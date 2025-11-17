# 크롤링 데이터 분석 - 추출 가능한 정보

## 파일 구조
```
result/제332회 운영위원회 제1차(2025.08.27)/
├── meeting_20251117_114011.json  (구조화된 데이터)
├── meeting_20251117_114011.md    (마크다운 - 링크 포함)
└── meeting_20251117_114011.txt   (순수 텍스트)
```

---

## 1. JSON 파일에서 추출 가능한 데이터

### 기본 메타데이터
```json
{
  "url": "원본 URL",
  "title": "제332회 운영위원회 제1차(2025.08.27)",
  "timestamp": "20251117_114011"
}
```

**추출 가능**:
- ✅ 회의 번호: `제332회`
- ✅ 회의 유형: `운영위원회`
- ✅ 회차: `제1차`
- ✅ 회의 날짜: `2025.08.27`
- ✅ 크롤링 시간
- ✅ 원본 URL

### Content 배열 구조
```json
"content": [
  {"type": "text", "content": "일시  2025년 8월 27일(수) 오전 11시"},
  {"type": "text", "content": "장소  운영위원회 회의실"},
  {"type": "link", "text": "이숙자", "url": "https://ms.smc.seoul.kr/kr/profile/..."}
]
```

**추출 가능**:
- ✅ **회의 일시**: "일시  2025년 8월 27일(수) 오전 11시"
- ✅ **회의 장소**: "장소  운영위원회 회의실"
- ✅ **의사일정 목록**:
  - 1. 제332회 서울특별시의회 임시회 의사일정 협의의 건
  - 2. 2025년도 서울특별시의회 행정사무감사 시기 및 기간 결정의 건
  - 3. 서울특별시의회의원 공무국외활동에 관한 조례 일부개정조례안
  - 4. 2025년도 하반기 의원연구단체 변경 심의의 건

- ✅ **심사된안건 (링크 포함)**:
  ```json
  {
    "type": "link",
    "text": "1. 제332회 서울특별시의회 임시회 의사일정 협의의 건",
    "url": "#item1"
  }
  ```

- ✅ **발언자 정보 (링크로 구분 가능)**:
  ```json
  {
    "type": "link",
    "text": "이숙자",
    "url": "https://ms.smc.seoul.kr/kr/profile/profile.do?code=1174&th=11"
  }
  ```
  - 의원 이름
  - 프로필 URL
  - 의원 코드 (code=1174)
  - 기수 (th=11)

- ✅ **첨부파일 링크**:
  ```json
  {
    "type": "link",
    "text": "제332회 서울특별시의회 임시회 의사일정안",
    "url": "https://ms.smc.seoul.kr/record/appendixDownload.do?key=..."
  }
  ```

---

## 2. Markdown 파일에서 추출 가능한 데이터

### 가독성 높은 회의록
- ✅ **발언자별 대화 내용**:
  ```
  ○위원장 [이숙자](링크)  의석을 정돈해 주시기 바랍니다...
  ○사무처장 김용석  존경하는 이숙자 위원장님...
  ```

- ✅ **시간 정보**:
  ```
  (11시 11분 개의)
  (11시 16분)
  ```

- ✅ **안건별 구분**:
  ```
  1. 제332회 서울특별시의회 임시회 의사일정 협의의 건
  (11시 16분)
  ○위원장 이숙자 그럼 의사일정 제1항...
  ```

- ✅ **의결 결과**:
  ```
  이의가 없으므로 의사일정 제1항은 원안가결되었음을 선포합니다.
  ```

---

## 3. TXT 파일에서 추출 가능한 데이터

### 순수 텍스트 (링크 제거)
- ✅ **전체 텍스트 임베딩용**: VectorDB에 저장할 순수 텍스트
- ✅ **LLM 요약용**: 링크 없이 깔끔한 텍스트
- ✅ **검색 인덱싱용**: 전문 검색 엔진용

---

## 추출 가능한 구조화된 데이터 정리

### 1. 회의 메타데이터
| 필드 | 값 | 추출 방법 |
|------|-----|-----------|
| meeting_id | 제332회 | title에서 정규식 |
| meeting_type | 운영위원회 | title에서 파싱 |
| session_number | 제1차 | title에서 정규식 |
| meeting_date | 2025-08-27 | title 또는 content 파싱 |
| meeting_time | 오전 11시 | content에서 "일시" 검색 |
| location | 운영위원회 회의실 | content에서 "장소" 검색 |
| start_time | 11시 11분 | "(11시 11분 개의)" 파싱 |
| end_time | 11시 28분 | "(11시 28분 산회)" 파싱 |
| url | 원본 URL | JSON에서 직접 |

### 2. 안건 정보
| 필드 | 값 | 추출 방법 |
|------|-----|-----------|
| agenda_number | 1, 2, 3, 4 | "1. ", "2. " 패턴 |
| agenda_title | "제332회 서울특별시의회 임시회 의사일정 협의의 건" | link의 text |
| anchor_link | #item1, #item2 | link의 url |
| decision | "원안가결" | "원안가결되었음" 텍스트 검색 |
| decision_time | 11시 16분 | 안건 시작 시간 파싱 |
| attachment_title | "제332회 서울특별시의회 임시회 의사일정안" | 첨부파일 링크 text |
| attachment_url | 다운로드 URL | appendixDownload.do 링크 |

### 3. 발언자 정보
| 필드 | 값 | 추출 방법 |
|------|-----|-----------|
| speaker_name | "이숙자" | 링크 text |
| speaker_role | "위원장" | "○위원장" 파싱 |
| profile_url | 프로필 링크 | /kr/profile/ 링크 |
| member_code | 1174 | URL의 code 파라미터 |
| term | 11 | URL의 th 파라미터 |

### 4. 발언 내용
| 필드 | 값 | 추출 방법 |
|------|-----|-----------|
| speaker | "이숙자" | ○ 다음 텍스트 |
| role | "위원장" | ○위원장 파싱 |
| content | "의석을 정돈해..." | 발언 전체 텍스트 |
| timestamp | "11시 11분" | 가장 가까운 시간 |
| related_agenda | "item1" | 가장 가까운 안건 |

### 5. 출석 정보 (하단에 있음)
```
○출석위원
이숙자  박성연  김성준  김춘곤
박석    윤영희  이상욱  이새날
박수빈  이병도  전병주

○청가위원
송경택  이성배
```

| 필드 | 값 | 추출 방법 |
|------|-----|-----------|
| attendees | ["이숙자", "박성연", ...] | "○출석위원" 다음 텍스트 |
| absent | ["송경택", "이성배"] | "○청가위원" 다음 텍스트 |

### 6. 공무원 출석 정보
```
○출석공무원
시의회사무처
  사무처장          김용석
  의정국장          서인석
  ...
```

| 필드 | 값 | 추출 방법 |
|------|-----|-----------|
| officials | [{"position": "사무처장", "name": "김용석"}, ...] | "○출석공무원" 다음 파싱 |

---

## 데이터 활용 전략

### JSON 파일 → 구조화 데이터 추출
**용도**: PostgreSQL에 저장할 메타데이터 추출

**추출할 데이터**:
1. 회의 기본 정보 (날짜, 시간, 장소, 유형)
2. 안건 목록 및 의결 결과
3. 발언자 목록
4. 첨부파일 링크

**처리 방법**:
```python
# JSON 파싱 후
- title에서 정규식으로 회의 정보 추출
- content 배열 순회하며 패턴 매칭
- type="link"인 항목에서 발언자/첨부파일 구분
- "원안가결", "부결" 등 키워드로 의결 결과 추출
```

---

### Markdown 파일 → 사람이 읽을 콘텐츠
**용도**: 웹 UI에 표시, 쉬운 요약 생성

**활용 방법**:
1. 안건별로 섹션 분할하여 표시
2. 발언자별 하이라이트
3. 첨부파일 다운로드 링크 제공

---

### TXT 파일 → VectorDB 임베딩
**용도**: RAG 시스템, 의미 검색

**처리 방법**:
1. **청크 분할**:
   ```python
   # 안건별로 분할
   chunk_1 = "1. 제332회... ~ 원안가결..."
   chunk_2 = "2. 2025년도... ~ 원안가결..."
   ```

2. **임베딩 생성**:
   ```python
   from sentence_transformers import SentenceTransformer
   model = SentenceTransformer('BM-K/KoSimCSE-roberta')

   embeddings = model.encode(chunks)
   ```

3. **VectorDB 저장**:
   ```python
   # ChromaDB 예시
   collection.add(
       documents=[chunk_text],
       embeddings=[embedding],
       metadatas=[{
           "meeting_title": "제332회 운영위원회 제1차",
           "agenda_number": 1,
           "decision": "원안가결",
           "date": "2025-08-27",
           "speakers": ["이숙자", "김용석"]
       }]
   )
   ```

---

## 다음 단계: 전처리 스크립트

### 필요한 스크립트

1. **`parse_json.py`**: JSON에서 구조화된 데이터 추출
   ```python
   def extract_meeting_metadata(json_data):
       # 회의 기본 정보 추출
       pass

   def extract_agenda_items(content_array):
       # 안건 목록 및 의결 결과 추출
       pass

   def extract_speakers(content_array):
       # 발언자 정보 추출
       pass
   ```

2. **`chunk_text.py`**: TXT를 청크로 분할
   ```python
   def split_by_agenda(text):
       # 안건별로 분할
       pass

   def split_by_speaker(text):
       # 발언자별로 분할
       pass
   ```

3. **`generate_embeddings.py`**: 임베딩 생성
   ```python
   def create_embeddings(chunks):
       # 한국어 임베딩 모델 사용
       pass
   ```

4. **`store_to_db.py`**: DB 저장
   ```python
   def save_to_postgres(metadata):
       # PostgreSQL에 메타데이터 저장
       pass

   def save_to_vectordb(chunks, embeddings, metadata):
       # ChromaDB에 저장
       pass
   ```

---

## 요약

| 파일 | 주요 용도 | 추출 데이터 |
|------|-----------|------------|
| **JSON** | 구조화된 데이터 추출, 메타데이터 파싱 | 회의 정보, 안건, 발언자, 링크 |
| **Markdown** | 웹 UI 표시, 사람이 읽을 콘텐츠 | 가독성 높은 회의록, 하이퍼링크 포함 |
| **TXT** | VectorDB 임베딩, 검색 인덱싱 | 순수 텍스트, 청크 분할용 |

**최적 전략**:
- JSON으로 메타데이터를 PostgreSQL에 저장
- TXT를 청크로 나눠 VectorDB에 임베딩
- Markdown을 웹에서 표시
