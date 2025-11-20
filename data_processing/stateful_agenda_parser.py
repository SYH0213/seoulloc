"""
상태 기반 안건 파싱 (Stateful Agenda Parser)

아이디어:
- 청크를 순서대로 처리하면서 "현재 활성 안건" 상태를 유지
- LLM에게 이전 안건 context를 전달하여 연속성 있게 판단
- 새 안건 발견 시 상태 업데이트, 없으면 이전 안건 유지
"""

import json
import os
import google.generativeai as genai
from typing import List, Dict, Optional


class StatefulAgendaParser:
    """상태를 유지하며 안건을 파싱"""

    def __init__(self, api_key: Optional[str] = None):
        genai.configure(api_key=api_key or os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.5-pro')  # gemini-2.5-pro 사용

        # 상태 변수
        self.known_agendas = {}  # {번호: 제목} 매핑
        self.current_agendas = []  # 현재 활성 안건 번호 리스트

    def parse_chunk(self, chunk_text: str, speaker: str) -> List[str]:
        """
        청크를 분석하여 소속 안건 판단

        Returns:
            안건 제목 리스트 (여러 안건에 속할 수 있음)
        """

        # 프롬프트 구성
        known_agendas_str = "\n".join([
            f"{num}. {title}"
            for num, title in sorted(self.known_agendas.items())
        ])

        current_agendas_str = ", ".join([
            f"{num}번" for num in self.current_agendas
        ]) if self.current_agendas else "없음"

        system_prompt = """당신은 서울시의회 회의록 안건 추적기입니다.

청크를 분석하여:
1. **새 안건 발견**: "숫자. 조례안/계획안..." 형태 → 안건 목록에 추가
2. **안건 언급**: "의사일정 제N항", "제N항 표결" → 해당 안건 활성화
3. **일괄 상정**: "제N항부터 제M항까지" → 범위 내 모든 안건 활성화
4. **안건 없음**: 위 경우가 아니면 → 이전 안건 유지

JSON 형식으로 답변:
{
  "new_agendas": [{"num": 34, "title": "서울특별시 광역지매센터 설치..."}],
  "mentioned_nums": [34],
  "range": {"start": 34, "end": 37} or null,
  "action": "new" | "mention" | "range" | "keep"
}"""

        user_prompt = f"""알려진 안건 목록:
{known_agendas_str if known_agendas_str else "(없음)"}

현재 활성 안건: {current_agendas_str}

청크 내용:
발언자: {speaker}
내용: {chunk_text}

분석 결과를 JSON으로 출력하세요."""

        # LLM 호출 (Gemini)
        full_prompt = f"""{system_prompt}

---

{user_prompt}"""

        response = self.model.generate_content(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                response_mime_type="application/json"
            )
        )

        result = json.loads(response.text)

        # 상태 업데이트
        self._update_state(result)

        # 현재 활성 안건들의 제목 반환
        return [
            self.known_agendas.get(num, f"안건 {num}번")
            for num in self.current_agendas
        ]

    def _update_state(self, result: Dict):
        """LLM 응답을 바탕으로 상태 업데이트"""

        action = result.get('action', 'keep')

        # 1. 새 안건 발견 → 안건 목록에 추가
        if result.get('new_agendas'):
            for agenda in result['new_agendas']:
                num = agenda['num']
                title = agenda['title']
                self.known_agendas[num] = title
                print(f"  ✅ 새 안건 발견: {num}. {title[:30]}...")

            # 새 안건을 현재 활성 안건으로 설정
            self.current_agendas = [a['num'] for a in result['new_agendas']]

        # 2. 일괄 상정 → 범위 내 모든 안건 활성화
        elif result.get('range'):
            start = result['range']['start']
            end = result['range']['end']
            self.current_agendas = list(range(start, end + 1))
            print(f"  📋 일괄 상정: 제{start}항 ~ 제{end}항")

        # 3. 특정 안건 언급 → 해당 안건만 활성화
        elif result.get('mentioned_nums'):
            self.current_agendas = result['mentioned_nums']
            print(f"  🎯 안건 언급: {result['mentioned_nums']}")

        # 4. 아무것도 없음 → 이전 안건 유지
        else:
            print(f"  ↔️  이전 안건 유지: {self.current_agendas}")


def test_stateful_parser():
    """테스트"""

    parser = StatefulAgendaParser()

    # 테스트 청크들 (순서대로)
    test_chunks = [
        {
            "speaker": "",
            "text": "34. 서울특별시 광역지매센터 설치 및 운영 조례 일부개정조례안(서울특별시장 제출)\n35. 서울특별시 환경보전 및 지역사회 알권리 조례 일부개정조례안(서울특별시장 제출)"
        },
        {
            "speaker": "의장 최호정",
            "text": "다음은 의사일정 제34항부터 제37항까지 보건복지위원회에서 심사한 안건 4건을 일괄 상정합니다."
        },
        {
            "speaker": "의장 최호정",
            "text": "보건복지위원회의 심사보고는 원활한 회의진행을 위하여 전자회의단말기에 제공된 내용으로 대신하겠습니다."
        },
        {
            "speaker": "의장 최호정",
            "text": "그러면 의사일정 제34항 서울특별시 광역지매센터 설치 및 운영 조례 일부개정조례안을 표결하겠습니다."
        },
        {
            "speaker": "의장 최호정",
            "text": "투표를 다 하셨습니까? 재석의원 70명 중 찬성 70명으로 의사일정 제34항은 가결되었음을 선포합니다."
        },
        {
            "speaker": "의장 최호정",
            "text": "다음은 의사일정 제35항 서울특별시 환경보전 및 지역사회 알권리 조례 일부개정조례안을 표결하겠습니다."
        }
    ]

    print("="*80)
    print("상태 기반 안건 파싱 테스트")
    print("="*80)
    print()

    for i, chunk in enumerate(test_chunks, 1):
        print(f"[청크 {i}]")
        print(f"발언자: {chunk['speaker']}")
        print(f"내용: {chunk['text'][:60]}...")
        print()

        agendas = parser.parse_chunk(chunk['text'], chunk['speaker'])

        print(f"→ 할당된 안건:")
        for agenda in agendas:
            print(f"    - {agenda[:50]}...")
        print()
        print("-"*80)
        print()


if __name__ == "__main__":
    test_stateful_parser()
