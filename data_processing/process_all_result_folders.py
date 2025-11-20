"""
result 폴더의 모든 txt 파일을 JSON으로 변환 (하이브리드 방식 + 병렬 처리)

사용법:
    python process_all_result_folders.py           # 전체 파일 처리
    python process_all_result_folders.py 10        # 랜덤 10개만 처리
    python process_all_result_folders.py 5         # 랜덤 5개만 처리

방식:
    - 1단계: Gemini 2.5 Pro로 안건 매핑 추출
    - 2단계: 순수 Python 코드로 발언 추출 (빠르고 안정적)
    - 병렬 처리: 3개 파일씩 동시 처리

결과:
    - data/result_txt/ 폴더에 JSON 저장
"""

import os
import json
import sys
import random
from pathlib import Path
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# 하이브리드 파싱 함수 임포트
from extract_metadata_hybrid import extract_metadata_hybrid

load_dotenv()

# 전역 카운터 (스레드 안전)
lock = threading.Lock()
success_count = 0
fail_count = 0
failed_files = []


def process_single_file(txt_file: Path, api_key: str, total: int, idx: int) -> dict:
    """단일 파일 처리"""
    global success_count, fail_count, failed_files

    folder_name = txt_file.parent.name

    try:
        # 하이브리드 파싱 실행 (배치 모드 - 간결한 출력)
        result = extract_metadata_hybrid(
            txt_path=str(txt_file),
            api_key=api_key,
            stage1_model="gemini-2.5-pro",
            verbose=False
        )

        # 제목을 파일명으로 사용 (특수문자 제거)
        title = result['meeting_info']['title']
        safe_title = title.replace('/', '_').replace('\\', '_').replace(':', '_').replace('*', '_').replace('?', '_').replace('"', '_').replace('<', '_').replace('>', '_').replace('|', '_')

        # data/result_txt/ 경로에만 저장
        result_txt_dir = Path("data/result_txt")
        result_txt_dir.mkdir(parents=True, exist_ok=True)
        json_output_path = result_txt_dir / f"{safe_title}.json"

        # JSON 저장
        with open(json_output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        with lock:
            success_count += 1
            current_success = success_count
            current_fail = fail_count

        print(f"✅ [{idx}/{total}] {folder_name[:60]}")
        print(f"   💾 {json_output_path.name}")
        print(f"   📊 {len(result['chunks'])}개 발언 | 진행: {current_success}개 성공, {current_fail}개 실패")
        print()

        return {'status': 'success', 'file': folder_name}

    except Exception as e:
        with lock:
            fail_count += 1
            failed_files.append((folder_name, str(e)))
            current_success = success_count
            current_fail = fail_count

        print(f"❌ [{idx}/{total}] {folder_name[:60]}")
        print(f"   오류: {str(e)[:100]}")
        print(f"   진행: {current_success}개 성공, {current_fail}개 실패")
        print()

        return {'status': 'failed', 'file': folder_name, 'error': str(e)}


def process_all_txt_files(n_files: int = None):
    """result 폴더의 모든 txt 파일 처리 (3개씩 병렬)

    Args:
        n_files: 처리할 파일 개수 (None이면 전체, 숫자면 랜덤 선택)
    """
    global success_count, fail_count, failed_files

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GOOGLE_API_KEY가 설정되지 않았습니다.")
        return

    # result 폴더의 모든 txt 파일 찾기
    result_dir = Path("result")
    all_txt_files = sorted(result_dir.glob("*/meeting_*.txt"))

    # 랜덤 선택 (n_files가 지정된 경우)
    if n_files is not None:
        if n_files > len(all_txt_files):
            print(f"⚠️  요청한 파일 수({n_files}개)가 전체 파일 수({len(all_txt_files)}개)보다 많습니다.")
            print(f"   전체 {len(all_txt_files)}개 파일을 처리합니다.")
            txt_files = all_txt_files
        else:
            random.seed()
            txt_files = random.sample(all_txt_files, n_files)
            print(f"🎲 전체 {len(all_txt_files)}개 중 랜덤 {n_files}개 선택")
    else:
        txt_files = all_txt_files

    print("=" * 100)
    print("📂 result 폴더 JSON 변환 (하이브리드 방식 + 병렬 처리)")
    print("=" * 100)
    print(f"처리할 파일 수: {len(txt_files)}개")
    print(f"방식: 1단계 Gemini + 2단계 순수 코드")
    print(f"병렬 처리: 3개 파일씩 동시 처리")
    print()

    # 카운터 초기화
    success_count = 0
    fail_count = 0
    failed_files = []

    # ThreadPoolExecutor로 3개씩 병렬 처리
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(process_single_file, txt_file, api_key, len(txt_files), idx): (idx, txt_file)
            for idx, txt_file in enumerate(txt_files, 1)
        }

        # 완료되는 대로 결과 수집
        for future in as_completed(futures):
            idx, txt_file = futures[future]
            try:
                result = future.result()
            except Exception as e:
                print(f"⚠️  예상치 못한 오류 발생: {txt_file.parent.name}")
                print(f"   {e}")
                print()

    # 최종 결과
    print("=" * 100)
    print("📊 최종 결과")
    print("=" * 100)
    print(f"총 파일: {len(txt_files)}개")
    print(f"✅ 성공: {success_count}개")
    print(f"❌ 실패: {fail_count}개")
    print()

    if failed_files:
        print("실패한 파일 목록:")
        for folder, error in failed_files:
            print(f"  - {folder}: {error}")
        print()


def main():
    """메인 함수"""
    # 커맨드 라인 인자 파싱
    n_files = None

    if len(sys.argv) > 1:
        try:
            n_files = int(sys.argv[1])
            if n_files <= 0:
                print("❌ 파일 개수는 1 이상이어야 합니다.")
                print("\n사용법:")
                print("  python process_all_result_folders.py           # 전체 파일 처리")
                print("  python process_all_result_folders.py 10        # 랜덤 10개만 처리")
                return
        except ValueError:
            print(f"❌ 잘못된 인자: '{sys.argv[1]}'")
            print("   숫자를 입력해주세요.")
            print("\n사용법:")
            print("  python process_all_result_folders.py           # 전체 파일 처리")
            print("  python process_all_result_folders.py 10        # 랜덤 10개만 처리")
            return

    process_all_txt_files(n_files=n_files)


if __name__ == "__main__":
    main()
