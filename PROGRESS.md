# 서울록(SeoulLog) 개발 진행 상황

**프로젝트**: 서울시의회 회의록 시맨틱 검색 및 RAG 챗봇 서비스
**시작일**: 2025-11-17
**현재 단계**: Phase 2 - 백엔드 및 프론트엔드 통합 구축

---

## ✅ 완료된 작업

### Phase 1: 데이터 수집 (완료)
- [x] 회의록 크롤링 스크립트 작성 (`crawl_final.py`, `crawl_all_urls.py`)
- [x] Selenium 기반 URL 자동 추출 (`extract_session_332_links.py`)
  - fancytree lazy 로딩 지원
  - 제332회 임시회 모든 회의록 링크 추출 성공
- [x] 제332회 임시회 53개 회의록 크롤링 완료
  - JSON, Markdown, TXT 3가지 형식으로 저장
  - `result/` 폴더에 회의록별로 분리 저장
- [x] Next.js 프론트엔드 기본 UI 구현 (`frontend/`)

---

## 🔄 진행 중 작업

### Phase 2: 백엔드 및 프론트엔드 통합 구축

#### 2.1 데이터 파싱 및 전처리 ✅
- [x] `result/` 폴더의 53개 회의록 JSON 파싱
- [x] 안건 단위로 분리 (의사일정 섹션 파싱) → **1,410개 안건 추출**
- [x] 메타데이터 추출 (회의명, 날짜, 위원회, 안건 제목, 결론)
- [x] 프론트엔드용 데이터 생성 (`frontend/data/realData.ts`)
- [x] ChromaDB용 JSON 생성 (`parsed_agenda_items.json`)

#### 2.2 벡터 DB 구축 (ChromaDB) ✅
- [x] ChromaDB 설치 및 초기화
- [x] 안건별 텍스트 임베딩 생성 스크립트 (`backend/app/services/vector_db.py`)
- [x] 메타데이터와 함께 ChromaDB 저장 기능 구현
- ⚠️ 실행 필요: `python backend/app/services/vector_db.py` (OpenAI API 키 필요)
- [ ] 컬렉션 구조:
  ```python
  {
    "id": "meeting_332_edu_1_item_1",
    "text": "안건 본문 내용",
    "metadata": {
      "meeting_title": "제332회 교육위원회 제1차",
      "meeting_date": "2025-09-01",
      "committee": "교육위원회",
      "item_number": 1,
      "item_title": "행정사무감사 계획서 채택의 건",
      "decision": "원안가결"
    }
  }
  ```

#### 2.3 FastAPI 백엔드 구축 ✅
- [x] FastAPI 프로젝트 구조 생성 (`backend/`)
- [x] API 엔드포인트 구현:
  - `GET /api/issues` - 전체 안건 목록
  - `GET /api/issues/{id}` - 안건 상세
  - `GET /api/issues/stats` - 통계
  - `POST /api/search` - 시맨틱 검색
  - `POST /api/chat` - RAG 챗봇
- [x] CORS 설정 (Next.js 연동)
- [x] Pydantic 스키마 정의
- [x] 라우터 분리 (issues, search, chat)

#### 2.4 시맨틱 검색 구현 ✅
- [x] 검색어 임베딩 생성
- [x] ChromaDB 유사도 검색
- [x] 메타데이터 필터링 (날짜, 위원회, 결론)
- [x] 검색 결과 정렬 및 반환

#### 2.5 RAG 챗봇 구현 ✅
- [x] RAG 파이프라인 구현:
  1. 질문 임베딩
  2. ChromaDB에서 관련 안건 검색 (top 5)
  3. 검색된 안건 + 질문을 LLM에 전달
  4. 답변 생성 + 출처 반환
- [x] OpenAI GPT-4o-mini 연동
- [x] 시스템 프롬프트 최적화

#### 2.6 프론트엔드 API 연동
- [ ] API 호출 함수 작성 (`frontend/lib/api.ts`)
- [ ] 검색 페이지 구현
- [ ] 챗봇 UI 실제 API 연결
- [ ] 로딩 상태 및 에러 처리

---

## 📝 다음 단계

### Phase 3: 최적화 및 추가 기능
- [ ] LLM 기반 자동 요약 생성
- [ ] 쉬운 말 변환 기능
- [ ] 안건 추적 시스템 (본회의-위원회 연결)
- [ ] 첨부파일 다운로드 기능

### Phase 4: 배포
- [ ] Docker 컨테이너화
- [ ] 환경 변수 설정
- [ ] 배포 (Vercel/AWS/GCP)

---

## 📂 프로젝트 구조

```
seoulloc/
├── frontend/              # Next.js 16
│   ├── app/
│   ├── components/
│   ├── data/
│   └── lib/
├── backend/               # FastAPI (예정)
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   ├── data/
│   └── requirements.txt
├── result/                # 크롤링된 회의록 (53개)
├── crawl_all_urls.py
├── extract_session_332_links.py
└── PROGRESS.md            # 이 파일
```

---

## 🔧 기술 스택

### 백엔드
- Python 3.10+
- FastAPI
- ChromaDB
- LangChain
- OpenAI API (임베딩 + LLM)

### 프론트엔드
- Next.js 16
- TypeScript
- Tailwind CSS

### 데이터
- BeautifulSoup4 (크롤링)
- Selenium (자동화)

---

## 📌 중요 파일 위치

- 회의록 데이터: `result/제332회 [위원회명] 제[N]차(날짜)/meeting_*.json`
- URL 목록: `SESSION_332_URLS.txt`
- 프론트엔드: `frontend/`
- 백엔드: `backend/` (생성 예정)

---

## 💡 참고사항

- 총 53개 회의록 크롤링 완료
- SESSION_332_URLS.txt에 모든 URL 저장됨
- JSON 데이터 구조: `{url, title, timestamp, content: [{type, content}]}`

---

**마지막 업데이트**: 2025-11-17 20:30

---

## ✅ 현재 완료 상태 요약

### 완료된 작업
1. ✅ 데이터 수집 및 파싱 (1,410개 안건)
2. ✅ ChromaDB 벡터 DB 구축 스크립트
3. ✅ FastAPI 백엔드 완성 (안건/검색/챗봇 API)
4. ✅ 프론트엔드 데이터 연동 준비 완료

### 실행 필요
1. ⚠️ **OpenAI API 키 설정** (backend/.env)
2. ⚠️ **ChromaDB 초기화** (`python backend/app/services/vector_db.py`)
3. ⚠️ **백엔드 서버 실행** (`uvicorn app.main:app --reload`)
4. ⚠️ **프론트엔드 실행** (`npm run dev`)

### 상세 가이드
- 설치 및 실행: `SETUP_GUIDE.md` 참고
- 백엔드 문서: `backend/README.md` 참고
