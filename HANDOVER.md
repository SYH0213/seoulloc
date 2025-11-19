# 작업 인수인계 문서

**작성 시각**: 2025-11-18 (오후 업데이트)
**현재 상태**: AI 요약 시스템 구축 완료, Gemini API quota 이슈로 내일 재시도 예정

---

## 🎯 현재 작업 목표

**AI 요약 시스템 구현**: 안건별 100-150자 AI 요약 자동 생성 및 프론트엔드 표시

### 아키텍처
```
[AI 요약 생성 흐름]
JSON 파일 (회의록 원본)
  ↓
create_agenda_database.py
  ↓
SQLite DB 생성 (agendas, agenda_chunks 테이블)
  ↓
generate_ai_summaries.py (별도 실행)
  ↓
Gemini 2.5 Flash로 요약 생성
  ↓
agendas.ai_summary, key_issues 업데이트
  ↓
프론트엔드에 표시 (search.html, details.html)
```

---

## 📋 오늘(11/18) 작업 내용

### ✅ 완료된 작업

#### 1. **AI 요약 시스템 설계 및 구현**
   - **database/create_agenda_database.py**
     - ai_summary, key_issues 컬럼 추가
     - DB 생성 및 안건 데이터 삽입만 담당
     - AI 요약 부분은 별도 스크립트로 분리

   - **database/generate_ai_summaries.py** ⭐ 신규 생성
     - combined_text를 2000자씩 청킹
     - 각 청크를 Gemini 2.5 Flash로 요약
     - 청크 요약들을 합쳐 100-150자 최종 요약 생성
     - 핵심 의제 3-5개 추출 (JSON 배열)
     - agendas 테이블에 UPDATE
     - API 호출 간격: 5초 (rate limit 방지)

#### 2. **백엔드 API 업데이트**
   - **backend_server.py**
     - SearchResult 모델에 key_issues 필드 추가
     - `/api/search`: ai_summary, key_issues 반환
     - `/api/agenda/{agenda_id}`: ai_summary, key_issues 반환
     - NULL 값 처리 (ai_summary 없으면 fallback)

#### 3. **프론트엔드 UI 구현**
   - **frontend/search.html**
     - AI 요약 표시 (238번 줄)
     - NULL 처리: "요약 생성 중..." 표시

   - **frontend/details.html**
     - AI 요약 섹션 추가 (211-223번 줄)
     - 핵심 의제 표시 (AI 생성 우선, 없으면 발언자별 표시)
     - **회의록 전체 내용 보기** 추가 (118-130번 줄)
       - combined_text 전체 표시
       - 접을 수 있는 details 태그 사용
       - 스크롤 가능 (max-h-96)
     - **원본 회의 영상 보기** 버튼 추가 (131-136번 줄)

#### 4. **Tailwind CSS 로딩 이슈 수정**
   - 세 파일 모두 수정 (main.html, search.html, details.html)
   - Tailwind config를 CDN보다 먼저 로드하도록 순서 변경
   - `window.tailwind.config` → `tailwind = { config: {...} }` 형식으로 변경

#### 5. **테스트 도구 생성**
   - **test_gemini.py** ⭐ 신규 생성
     - Gemini API 연결 테스트
     - Quota 상태 확인
     - 간단한 번역 테스트

### 🔄 진행 중인 작업

**AI 요약 생성 (Gemini API quota 이슈)**

1. ✅ DB 생성 완료 (6개 안건, 169개 청크)
2. ⏳ AI 요약 생성 중 - **503 에러 발생**
   - 원인: Gemini 서버 과부하 (The model is overloaded)
   - 상태: 일부 안건은 요약 생성 완료 (1-2개)
   - 해결: 내일 재시도 예정

---

## 🚨 현재 블로커

**문제**: Gemini API 503 에러 (Server Overloaded)

### 상황 분석
- **단일 요청 테스트**: ✅ 성공 (test_gemini.py)
- **연속 대량 요청**: ❌ 503 에러 발생
- **에러 메시지**: "The model is overloaded. Please try again later."

### 원인
- Gemini 서버 과부하 (클라우드 서버 부하)
- 이전 방식의 문제: agenda_chunks 테이블에서 134개 청크를 개별 호출
  - 134회 API 호출 × 4초 = 536초 (약 9분)
  - 너무 많은 연속 호출로 서버 차단

### 해결 방법 (이미 적용됨)
1. **청킹 방식 변경** ✅
   - 기존: agenda_chunks 테이블에서 text_preview (200자) 읽어서 134개 청크 요약
   - 변경: combined_text를 2000자씩 청킹 → 약 14개 청크로 감소 (90% 감소!)

2. **API 지연 증가** ✅
   - 4초 → 5초로 증가
   - 에러 발생 시 6초 대기

3. **내일 재시도**
   - 서버 부하가 줄어들면 정상 작동할 것으로 예상

---

## 🔧 내일 작업 순서

### 1단계: AI 요약 재생성

```bash
# Seoul 환경 활성화
conda activate seoul

# AI 요약 생성 (Gemini 2.5 Flash)
python database/generate_ai_summaries.py
```

**예상 소요 시간**: 약 15-20분 (6개 안건 × 평균 2-3분)

**예상 결과**:
```
================================================================================
🤖 AI 요약 생성 시작 (총 6개 안건)
================================================================================

[1/6] 기타발언...
   📝 텍스트 길이: 400자 → 1개 청크로 분할
   🔄 각 청크 요약 중...
      ✓ 청크 1/1 요약 완료
   🎯 최종 요약 생성 중...
   🔍 핵심 의제 추출 중...
   ✅ 요약: 서상열 위원장은 AI경쟁력강화특위 3차 회의를 개회하며...
   ✅ 핵심 의제: 3개 - ["회의 개회", "안건 상정", "...]

[2/6] 서울특별시 인공지능산업 육성 및 지원 조례안...
   📝 텍스트 길이: 800자 → 1개 청크로 분할
   ...

================================================================================
✅ AI 요약 생성 완료!
================================================================================
```

**확인 사항**:
- 모든 안건에 ai_summary 저장됨
- key_issues JSON 배열 저장됨
- NULL 값 없음

---

### 2단계: 서버 실행 및 테스트

```bash
python backend_server.py
```

**테스트 체크리스트**:
```
[ ] 1. 메인 페이지 접속
      - http://localhost:8000
      - 스타일 정상 적용 확인

[ ] 2. 검색 기능
      - 검색어: "AI"
      - AI 요약 표시 확인
      - NULL이면 "요약 생성 중..." 표시

[ ] 3. 상세 페이지
      - 안건 카드 클릭
      - AI 요약 섹션 확인
      - 핵심 의제 표시 확인
      - "회의록 전체 내용 보기" 클릭 → combined_text 확인
      - "원본 회의 영상 보기" 버튼 확인

[ ] 4. 모바일 테스트
      - http://192.168.0.54:8000
      - 반응형 디자인 확인
      - Tailwind CSS 정상 로딩 확인
```

---

## 📁 주요 파일 설명

### 새로 생성된 파일

1. **`database/generate_ai_summaries.py`** ⭐ 신규
   - AI 요약 전용 스크립트
   - combined_text 청킹 (2000자 단위)
   - Gemini 2.5 Flash 요약 생성
   - 실행: `python database/generate_ai_summaries.py`
   - 독립 실행 가능 (DB가 이미 있어야 함)

2. **`test_gemini.py`** ⭐ 신규
   - Gemini API 테스트 도구
   - Quota 상태 확인
   - 간단한 번역 요청으로 연결 테스트

### 수정된 파일

1. **`database/create_agenda_database.py`** ⭐ 수정됨
   - AI 요약 관련 코드 모두 제거
   - DB 생성 및 데이터 삽입만 담당
   - 빠른 실행 (몇 초 이내)
   - 실행 후 안내 메시지 출력: "python database/generate_ai_summaries.py"

2. **`backend_server.py`** ⭐ 수정됨
   - SearchResult 모델에 `key_issues: Optional[List[str]]` 추가 (57번 줄)
   - `/api/search`: ai_summary, key_issues 반환 (215-259번 줄)
   - `/api/agenda/{agenda_id}`: ai_summary, key_issues 반환 (358-415번 줄)
   - JSON 파싱 처리 (key_issues는 JSON 문자열로 저장)

3. **`frontend/search.html`** ⭐ 수정됨
   - AI 요약 표시 (238번 줄)
   - `${result.ai_summary || '요약 생성 중...'}` (NULL 처리)
   - Tailwind config 순서 변경 (15-39번 줄)

4. **`frontend/details.html`** ⭐ 수정됨
   - AI 요약 섹션 추가 (211-223번 줄)
   - combined_text 전체 보기 추가 (118-130번 줄)
   - 핵심 의제 표시 (215-255번 줄)
   - Tailwind config 순서 변경 (14-35번 줄)

5. **`frontend/main.html`** ⭐ 수정됨
   - Tailwind config 순서 변경 (9-31번 줄)

---

## 🗂️ 데이터베이스 구조

### SQLite: `data/sqlite_DB/agendas.db`

**테이블 1: agendas**
```sql
CREATE TABLE agendas (
    agenda_id TEXT PRIMARY KEY,           -- "meeting_20251117_195534_agenda_001"
    agenda_title TEXT NOT NULL,           -- "서울특별시 인공지능산업 육성 및 지원 조례안"
    meeting_title TEXT,                   -- "제332회 AI경쟁력강화특별위원회"
    meeting_date TEXT,                    -- "2025.09.10"
    meeting_url TEXT,
    main_speaker TEXT,                    -- "서상열 위원장" (가장 많이 발언)
    all_speakers TEXT,                    -- "서상열, 이용균, ..."
    speaker_count INTEGER,                -- 2
    chunk_count INTEGER,                  -- 4
    chunk_ids TEXT,                       -- "chunk_0001,chunk_0002,..."
    combined_text TEXT,                   -- 전체 회의록 텍스트 (길이 제한 없음!)
    ai_summary TEXT,                      -- ⭐ "서울시 AI산업 육성..." (100-150자)
    key_issues TEXT,                      -- ⭐ JSON: ["의제1", "의제2", ...]
    status TEXT DEFAULT '심사중',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**테이블 2: agenda_chunks** (매핑 테이블)
```sql
CREATE TABLE agenda_chunks (
    chunk_id TEXT PRIMARY KEY,            -- "meeting_20251117_195534_chunk_0001"
    agenda_id TEXT,                       -- FK to agendas
    chunk_index INTEGER,                  -- 순서
    speaker TEXT,                         -- "서상열 위원장"
    text_preview TEXT,                    -- 청크 텍스트 앞 200자
    FOREIGN KEY (agenda_id) REFERENCES agendas(agenda_id)
)
```

**현재 데이터**:
- 안건 수: 6개
- 청크 수: 169개
- AI 요약: 일부 완료 (1-2개), 나머지는 내일 재시도

---

## 🤖 AI 요약 생성 프로세스

### 2단계 요약 방식

```
combined_text (전체 회의록)
  ↓
1️⃣ 청킹 (2000자 단위)
  - 예: 26,800자 → 14개 청크
  ↓
2️⃣ 각 청크 요약 (Gemini 2.5 Flash)
  - 프롬프트: "간결하게 요약하세요" (글자 수 제한 없음)
  - 결과: 14개의 중간 요약
  ↓
3️⃣ 최종 요약 (100-150자)
  - 프롬프트: "100-150자로 최종 요약"
  - 안건의 핵심 목적, 주요 논의, 결론
  ↓
4️⃣ 핵심 의제 추출 (3-5개)
  - 프롬프트: "핵심 의제 3-5개를 JSON 배열로 반환"
  - 결과: ["의제1", "의제2", "의제3"]
  ↓
5️⃣ DB 업데이트
  - UPDATE agendas SET ai_summary = ?, key_issues = ?
```

### API 호출 최적화
- **기존 방식**: 134개 청크 × 4초 = 536초 (약 9분)
- **새로운 방식**: 14개 청크 × 5초 = 70초 (약 1분)
- **개선율**: 87% 감소! 🎉

---

## 🔍 프론트엔드 표시 방식

### search.html (검색 결과)
```html
<div class="bg-gray-100 p-3 rounded-md">
  <p>
    <span class="font-bold text-primary">AI 요약:</span>
    ${result.ai_summary || '요약 생성 중...'}
  </p>
</div>
```

### details.html (상세 페이지)

1. **AI 요약 섹션** (동적 생성)
```javascript
if (data.ai_summary) {
  const summarySection = document.createElement('div');
  summarySection.innerHTML = `
    <p>
      <span class="font-bold text-primary">AI 요약:</span>
      ${data.ai_summary}
    </p>
  `;
}
```

2. **핵심 의제**
```javascript
if (data.key_issues && data.key_issues.length > 0) {
  // AI가 생성한 핵심 의제 표시
  data.key_issues.forEach((issue, index) => {
    // "1. 의제1", "2. 의제2" 형식
  });
} else {
  // 핵심 의제가 없으면 발언자별로 표시 (기존 방식)
}
```

3. **회의록 전체 내용 보기**
```html
<details>
  <summary>회의록 전체 내용 보기</summary>
  <div class="max-h-96 overflow-y-auto">
    <p id="combined-text">${data.combined_text}</p>
  </div>
</details>
```

---

## 🐛 알려진 이슈 및 해결

### 이슈 1: Gemini API 503 에러 ✅ 해결됨
- **현상**: 연속 대량 요청 시 서버 과부하
- **원인**: 134개 청크 개별 요약 → 너무 많은 API 호출
- **해결**: combined_text 청킹 방식으로 변경 (90% 호출 감소)

### 이슈 2: Tailwind CSS 로딩 문제 ✅ 해결됨
- **현상**: 강력 새로고침 시 스타일이 텍스트로만 표시
- **원인**: config 설정 타이밍 이슈
- **해결**: Tailwind config를 CDN보다 먼저 로드

### 이슈 3: 503 에러 여전히 발생 ⏳ 내일 재시도
- **현상**: 일부 안건은 성공, 일부는 실패
- **원인**: Gemini 클라우드 서버 과부하
- **해결**: 내일 서버 부하가 줄면 재시도

---

## 📊 현재 데이터 상태

### 파일 구조
```
seoulloc/
├── data/
│   ├── result_txt/              # 원본 JSON (2개 파일, 169개 청크)
│   ├── chroma_db/               # ChromaDB (벡터 검색용)
│   └── sqlite_DB/
│       └── agendas.db           # ✅ 생성 완료 (6개 안건, AI 요약 일부)
├── database/
│   ├── create_agenda_database.py    # ✅ DB 생성 스크립트
│   └── generate_ai_summaries.py     # ⭐ AI 요약 생성 스크립트 (신규)
├── frontend/
│   ├── main.html                # ✅ Tailwind 수정
│   ├── search.html              # ✅ AI 요약 표시
│   └── details.html             # ✅ AI 요약 + combined_text 표시
├── backend_server.py            # ✅ API 업데이트
├── test_gemini.py               # ⭐ API 테스트 도구 (신규)
└── HANDOVER.md                  # 📝 현재 파일
```

### DB 상태
- **agendas 테이블**: 6개 안건
  - ai_summary: 1-2개 완료, 나머지 NULL
  - key_issues: 1-2개 완료, 나머지 NULL
- **agenda_chunks 테이블**: 169개 청크 (전부 저장됨)

---

## ✅ 내일 작업 체크리스트

```
[ ] 1. AI 요약 재생성
      - 명령: python database/generate_ai_summaries.py
      - 확인: 6개 안건 모두 ai_summary, key_issues 생성
      - 예상 시간: 15-20분

[ ] 2. 서버 실행 및 검색 테스트
      - 명령: python backend_server.py
      - 검색어: "AI", "인공지능", "조례"
      - 확인: AI 요약 표시됨

[ ] 3. 상세 페이지 테스트
      - 안건 클릭 → details.html
      - 확인: AI 요약, 핵심 의제, combined_text 모두 표시

[ ] 4. 모바일 테스트
      - http://192.168.0.54:8000
      - 확인: 반응형, Tailwind CSS 정상 작동

[ ] 5. (선택) 추가 회의록 데이터 추가
      - 더 많은 JSON 파일 다운로드
      - python database/create_agenda_database.py
      - python database/generate_ai_summaries.py
```

---

## 🚀 향후 작업 (우선순위 순)

### 1. 데이터 확장 (우선순위: 높음)
- 더 많은 회의록 크롤링
- 다양한 안건 유형 추가
- 현재: 6개 안건 → 목표: 50-100개 안건

### 2. 검색 품질 개선
- 코사인 유사도 임계값 설정
- 안건 제목 키워드 매칭 추가
- 하이브리드 검색 (벡터 + 키워드)

### 3. RAG 챗봇 구현 (예정)
- LangChain/Langgraph
- 청크 컬렉션 활용
- 대화형 질의응답

### 4. UI/UX 개선
- 다크모드 토글
- 필터링 기능 (날짜, 상태, 발언자)
- 페이지네이션

---

## 💡 핵심 아키텍처 원칙

1. **하이브리드 DB 방식**
   - ChromaDB: 벡터 검색 (세밀한 매칭)
   - SQLite: 메타데이터 + 전체 텍스트 (빠른 조회)

2. **2단계 요약**
   - 청크별 요약 → 최종 요약 (100-150자)
   - 정보 손실 최소화, 품질 향상

3. **독립적 스크립트 분리**
   - DB 생성: `create_agenda_database.py` (빠름)
   - AI 요약: `generate_ai_summaries.py` (느림, 별도 실행)
   - 유연한 워크플로우

4. **Rate Limiting 대응**
   - API 호출 간 5초 지연
   - 에러 발생 시 6초 대기
   - 청킹 방식으로 호출 횟수 90% 감소

---

## 🔗 참고 링크

- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **Google AI Studio**: https://aistudio.google.com/app/apikey (Quota 확인)
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**마지막 업데이트**: 2025-11-18 오후
**다음 작업자**: 내일 `python database/generate_ai_summaries.py` 실행하고 테스트하세요!
**중요**: Gemini 서버 부하가 줄어들면 정상 작동할 것으로 예상됩니다. 👍
