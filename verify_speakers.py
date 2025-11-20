import re
import json
from collections import Counter

# txt 파일에서 모든 ○발언자 패턴 추출
with open('result/제332회 교육위원회 제3차(2025.09.09)/meeting_20251119_113816.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# 헤더 제거
lines = content.split('\n')
separator_idx = -1
for i, line in enumerate(lines):
    if '=' * 80 in line:
        separator_idx = i
        break

if separator_idx != -1:
    lines = lines[separator_idx + 1:]

# ○로 시작하는 모든 라인 찾기
speakers_in_txt = []
for line in lines:
    if line.strip().startswith('○'):
        match = re.match(r'^○\s*(.+?)\s{2,}(.+)', line.strip())
        if match:
            speaker = match.group(1).strip()
            speakers_in_txt.append(speaker)
        else:
            match = re.match(r'^○\s*(.+)', line.strip())
            if match:
                speaker = match.group(1).strip()
                speakers_in_txt.append(speaker)

print(f'원본 txt 파일에서 찾은 발언자 라인: {len(speakers_in_txt)}개')
print()

# JSON에서 추출된 발언자
with open('test_results/test_제332회 교육위원회 제3차(2025.09.09).json', 'r', encoding='utf-8') as f:
    result = json.load(f)

print(f'JSON에서 추출된 발언 청크: {len(result["chunks"])}개')
print()

# 발언자별 카운트
txt_counter = Counter(speakers_in_txt)
json_counter = Counter(c['speaker'] for c in result['chunks'])

print('=== 발언자별 비교 ===')
print(f'{"발언자":<25} | txt 라인 | JSON 청크')
print('-' * 55)
for speaker in sorted(txt_counter.keys()):
    txt_count = txt_counter[speaker]
    json_count = json_counter.get(speaker, 0)
    match = '✅' if json_count > 0 else '❌'
    print(f'{speaker:<25} | {txt_count:4d}개 | {json_count:4d}개 {match}')

print()
matched = len([s for s in txt_counter.keys() if json_counter.get(s, 0) > 0])
total = len(txt_counter)
print(f'매칭률: {matched}/{total} = {matched / total * 100:.1f}%')
