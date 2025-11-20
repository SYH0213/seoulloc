"""
모든 txt 파일의 구조를 검증하는 스크립트

사용법:
    python validate_all_txt_files.py
"""

import os
import re
from pathlib import Path
from collections import Counter


def analyze_txt_structure(txt_path: str) -> dict:
    """txt 파일의 구조 분석"""

    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')

    # 기본 정보
    title = lines[0].replace('제목: ', '').strip() if lines else ""
    url = lines[1].replace('URL: ', '').strip() if len(lines) > 1 else ""

    # 본문 추출
    separator_index = content.find('=' * 80)
    if separator_index != -1:
        main_content = content[separator_index + 80:].strip()
    else:
        main_content = content

    # 발언자 추출
    speakers = re.findall(r'^○([^\n]+)', main_content, re.MULTILINE)
    unique_speakers = list(set(speakers))

    # --- 구분선 개수
    separator_count = main_content.count('\n---\n')

    # 안건 패턴 찾기
    agenda_patterns = {
        '숫자점_안건': re.findall(r'^\d+\.\s+(.+?)(?:\(|$)', main_content, re.MULTILINE),
        '의사일정': re.findall(r'의사일정\s+제(\d+)항', main_content),
        '참고자료': re.findall(r'\(참고\)|회의록 끝에 실음', main_content)
    }

    # 회의 유형 판단
    meeting_type = "알 수 없음"
    if "본회의" in title:
        meeting_type = "본회의"
    elif "위원회" in title:
        meeting_type = "위원회"

    return {
        "file_path": txt_path,
        "title": title,
        "meeting_type": meeting_type,
        "file_size": len(content),
        "total_speakers": len(speakers),
        "unique_speakers": len(unique_speakers),
        "speaker_list": unique_speakers[:5],  # 처음 5명만
        "separator_count": separator_count,
        "agenda_숫자점": len(agenda_patterns['숫자점_안건']),
        "의사일정_개수": len(set(agenda_patterns['의사일정'])),
        "참고자료_개수": len(agenda_patterns['참고자료']),
        "has_separator": separator_count > 0,
        "has_agenda": len(agenda_patterns['숫자점_안건']) > 0 or len(agenda_patterns['의사일정']) > 0
    }


def validate_batch(txt_files: list, batch_num: int, total_batches: int):
    """5개 파일 배치 검증"""

    print("=" * 100)
    print(f"배치 {batch_num}/{total_batches} 검증 중... ({len(txt_files)}개 파일)")
    print("=" * 100)
    print()

    results = []

    for idx, txt_file in enumerate(txt_files, 1):
        print(f"[{idx}/{len(txt_files)}] {Path(txt_file).parent.name}")

        analysis = analyze_txt_structure(txt_file)
        results.append(analysis)

        # 요약 출력
        print(f"  📄 제목: {analysis['title'][:60]}...")
        print(f"  📊 유형: {analysis['meeting_type']}")
        print(f"  📏 크기: {analysis['file_size']:,} bytes")
        print(f"  👥 발언자: {analysis['total_speakers']}회 발언 / {analysis['unique_speakers']}명")
        print(f"     - {', '.join(analysis['speaker_list'][:3])}...")
        print(f"  📋 구조:")
        print(f"     - 구분선(---): {analysis['separator_count']}개")
        print(f"     - 숫자점 안건: {analysis['agenda_숫자점']}개")
        print(f"     - 의사일정: {analysis['의사일정_개수']}개 항")
        print(f"     - 참고자료: {analysis['참고자료_개수']}개")

        # 프롬프트 적합성 판단
        적합성 = []
        if not analysis['has_separator']:
            적합성.append("⚠️  구분선 없음")
        if not analysis['has_agenda']:
            적합성.append("⚠️  안건 패턴 없음")
        if analysis['unique_speakers'] == 0:
            적합성.append("❌ 발언자 없음")

        if 적합성:
            print(f"  ⚠️  이슈: {', '.join(적합성)}")
        else:
            print(f"  ✅ 프롬프트 적합")

        print()

    # 배치 요약
    print("-" * 100)
    print(f"📊 배치 {batch_num} 요약:")
    print("-" * 100)

    # 회의 유형 분포
    type_counts = Counter([r['meeting_type'] for r in results])
    print(f"회의 유형: {dict(type_counts)}")

    # 평균 통계
    avg_size = sum(r['file_size'] for r in results) / len(results)
    avg_speakers = sum(r['unique_speakers'] for r in results) / len(results)
    avg_separators = sum(r['separator_count'] for r in results) / len(results)

    print(f"평균 크기: {avg_size:,.0f} bytes")
    print(f"평균 발언자: {avg_speakers:.1f}명")
    print(f"평균 구분선: {avg_separators:.1f}개")

    # 이슈 파일
    issue_files = [
        r for r in results
        if not r['has_separator'] or not r['has_agenda'] or r['unique_speakers'] == 0
    ]

    if issue_files:
        print(f"\n⚠️  이슈 파일: {len(issue_files)}개")
        for r in issue_files:
            print(f"  - {Path(r['file_path']).parent.name}")
    else:
        print(f"\n✅ 모든 파일 적합!")

    print()

    return results


def main():
    """메인 함수"""

    # result 폴더의 모든 txt 파일 찾기
    result_dir = Path("result")
    txt_files = sorted(result_dir.glob("*/meeting_*.txt"))

    print("=" * 100)
    print("txt 파일 구조 검증 시작")
    print("=" * 100)
    print(f"총 파일 수: {len(txt_files)}개")
    print()

    # 5개씩 나눠서 처리
    batch_size = 5
    batches = [txt_files[i:i+batch_size] for i in range(0, len(txt_files), batch_size)]

    all_results = []

    for batch_num, batch in enumerate(batches, 1):
        results = validate_batch(
            [str(f) for f in batch],
            batch_num,
            len(batches)
        )
        all_results.extend(results)

        # 사용자 입력 대기 (마지막 배치 제외)
        if batch_num < len(batches):
            input(f"\n👉 배치 {batch_num} 완료. Enter 키를 눌러 다음 배치 진행...")
            print("\n")

    # 전체 요약
    print("=" * 100)
    print("📊 전체 요약")
    print("=" * 100)

    total_files = len(all_results)
    본회의_files = sum(1 for r in all_results if r['meeting_type'] == '본회의')
    위원회_files = sum(1 for r in all_results if r['meeting_type'] == '위원회')

    total_issue_files = sum(
        1 for r in all_results
        if not r['has_separator'] or not r['has_agenda'] or r['unique_speakers'] == 0
    )

    print(f"총 파일: {total_files}개")
    print(f"  - 본회의: {본회의_files}개")
    print(f"  - 위원회: {위원회_files}개")
    print()
    print(f"✅ 적합 파일: {total_files - total_issue_files}개 ({(total_files - total_issue_files) / total_files * 100:.1f}%)")
    print(f"⚠️  이슈 파일: {total_issue_files}개 ({total_issue_files / total_files * 100:.1f}%)")

    if total_issue_files > 0:
        print("\n이슈 파일 목록:")
        for r in all_results:
            if not r['has_separator'] or not r['has_agenda'] or r['unique_speakers'] == 0:
                issues = []
                if not r['has_separator']:
                    issues.append("구분선 없음")
                if not r['has_agenda']:
                    issues.append("안건 없음")
                if r['unique_speakers'] == 0:
                    issues.append("발언자 없음")
                print(f"  - {Path(r['file_path']).parent.name}: {', '.join(issues)}")

    print()


if __name__ == "__main__":
    main()
