"""
AI 요약 생성 스크립트

이미 생성된 SQLite DB의 agenda_chunks를 읽어서 AI 요약을 생성하고
agendas 테이블의 ai_summary, key_issues를 업데이트합니다.

사용법:
    python database/generate_ai_summaries.py
"""

import json
import sqlite3
import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Gemini 설정
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)
    print("✅ Gemini 2.5 Flash 초기화 성공")
else:
    client = None
    print("⚠️ GOOGLE_API_KEY 없음 - AI 요약 생성 불가")
    exit(1)

# SQLite DB 경로
SQLITE_DB_PATH = "data/sqlite_DB/agendas.db"


def chunk_text(text, chunk_size=2000):
    """텍스트를 일정 크기로 청킹 (글자 수 기준)"""
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i+chunk_size])
    return chunks


def summarize_text_chunk(text_chunk, agenda_title, chunk_index):
    """텍스트 청크 하나를 요약 (글자 수 제한 없음, 자유롭게)"""
    if not client or not text_chunk.strip():
        return None

    try:
        prompt = f"""안건 '{agenda_title}'의 일부 내용입니다:

{text_chunk}

위 내용을 간결하게 요약하세요. 핵심 내용을 중심으로 요약문만 반환하세요."""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        summary = response.text.strip()

        # API 속도 제한 방지: 각 호출 사이 5초 대기
        time.sleep(5)

        return summary
    except Exception as e:
        print(f"  ⚠️ 청크 요약 실패 (청크 {chunk_index}): {e}")
        time.sleep(6)  # 에러 발생 시 6초 대기 후 다음 요청
        return None


def summarize_agenda(chunk_summaries, agenda_title):
    """청크 요약들을 합쳐서 최종 요약 (100-150자)"""
    if not client or not chunk_summaries:
        return None

    try:
        combined = "\n\n".join([s for s in chunk_summaries if s])

        if not combined.strip():
            return None

        prompt = f"""안건 '{agenda_title}'에 대한 요약들입니다:

{combined}

위 내용을 통합하여 100-150자로 최종 요약하세요.
- 안건의 핵심 목적
- 주요 논의 내용
- 결론 또는 결과

요약문만 반환하세요."""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        summary = response.text.strip()

        # API 속도 제한 방지
        time.sleep(5)

        return summary[:160]  # 최대 160자로 제한
    except Exception as e:
        print(f"  ⚠️ 최종 요약 실패: {e}")
        time.sleep(6)
        return None


def extract_key_issues(chunk_summaries, agenda_title):
    """핵심 의제 3-5개 추출"""
    if not client or not chunk_summaries:
        return None

    try:
        combined = "\n\n".join([s for s in chunk_summaries if s])

        if not combined.strip():
            return None

        prompt = f"""안건 '{agenda_title}'에 대한 요약들입니다:

{combined}

이 안건의 핵심 의제 3-5가지를 추출하세요.
각 의제는 한 줄로 간결하게 작성하세요.
JSON 배열 형식으로만 반환하세요.

예시: ["의제1", "의제2", "의제3"]"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        text = response.text.strip()

        # API 속도 제한 방지
        time.sleep(5)

        # JSON 파싱
        if text.startswith('[') and text.endswith(']'):
            issues = json.loads(text)
            return issues[:5]  # 최대 5개
        else:
            # JSON이 아닌 경우 수동 파싱
            lines = [line.strip('- ').strip() for line in text.split('\n') if line.strip()]
            return lines[:5]
    except Exception as e:
        print(f"  ⚠️ 핵심 의제 추출 실패: {e}")
        time.sleep(6)
        return None


def generate_ai_summaries():
    """커밋된 DB에서 combined_text를 읽어와 AI 요약 생성"""

    if not client:
        print("\n⚠️ Gemini API 없음 - AI 요약 건너뜀")
        return

    # DB 연결
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()

    # 모든 안건 조회
    cursor.execute('SELECT agenda_id, agenda_title, combined_text FROM agendas')
    agendas = cursor.fetchall()

    print("\n" + "=" * 80)
    print(f"🤖 AI 요약 생성 시작 (총 {len(agendas)}개 안건)")
    print("=" * 80)

    for idx, (agenda_id, agenda_title, combined_text) in enumerate(agendas, 1):
        print(f"\n[{idx}/{len(agendas)}] {agenda_title[:50]}...")

        if not combined_text or not combined_text.strip():
            print(f"   ⚠️ 텍스트 없음 - 건너뜀")
            continue

        # 1단계: combined_text를 청킹 (2000자씩)
        text_chunks = chunk_text(combined_text, chunk_size=2000)
        print(f"   📝 텍스트 길이: {len(combined_text)}자 → {len(text_chunks)}개 청크로 분할")

        # 2단계: 각 청크 요약
        print(f"   🔄 각 청크 요약 중...")
        chunk_summaries = []

        for i, text_chunk in enumerate(text_chunks):
            chunk_summary = summarize_text_chunk(text_chunk, agenda_title, i+1)
            if chunk_summary:
                chunk_summaries.append(chunk_summary)
                print(f"      ✓ 청크 {i+1}/{len(text_chunks)} 요약 완료")

        if not chunk_summaries:
            print(f"   ⚠️ 청크 요약 실패 - 건너뜀")
            continue

        # 3단계: 최종 요약 (100-150자)
        print(f"   🎯 최종 요약 생성 중...")
        ai_summary = summarize_agenda(chunk_summaries, agenda_title)

        # 4단계: 핵심 의제 추출
        print(f"   🔍 핵심 의제 추출 중...")
        key_issues = extract_key_issues(chunk_summaries, agenda_title)

        # DB 업데이트
        if ai_summary or key_issues:
            cursor.execute('''
                UPDATE agendas
                SET ai_summary = ?, key_issues = ?
                WHERE agenda_id = ?
            ''', (
                ai_summary,
                json.dumps(key_issues, ensure_ascii=False) if key_issues else None,
                agenda_id
            ))

            if ai_summary:
                print(f"   ✅ 요약: {ai_summary[:80]}...")
            if key_issues:
                print(f"   ✅ 핵심 의제: {len(key_issues)}개 - {key_issues}")

    conn.commit()
    conn.close()

    print("\n" + "=" * 80)
    print("✅ AI 요약 생성 완료!")
    print("=" * 80)


if __name__ == "__main__":
    print("=" * 80)
    print("AI 요약 생성 스크립트")
    print("=" * 80)
    print()

    # AI 요약 생성
    generate_ai_summaries()

    print("\n✅ 모든 작업 완료!")
