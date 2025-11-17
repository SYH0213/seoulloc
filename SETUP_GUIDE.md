# 서울록(SeoulLog) 설치 및 실행 가이드

## 🚀 빠른 시작

### 1. OpenAI API 키 준비

1. https://platform.openai.com/ 에서 API 키 발급
2. 사용량 확인 (약 $1-2 예상)

### 2. 백엔드 설정

```bash
# 백엔드 폴더로 이동
cd backend

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
nano .env  # 또는 메모장으로 열어서 OPENAI_API_KEY 입력
```

**.env 파일 예시:**
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
CHROMA_PERSIST_DIR=./chroma_db
COLLECTION_NAME=seoul_meetings
API_HOST=0.0.0.0
API_PORT=8000
```

### 3. ChromaDB 초기화 (최초 1회만)

```bash
cd backend/app/services
python vector_db.py
```

**예상 시간**: 10-20분 (1,410개 안건 임베딩 생성)
**예상 비용**: $0.50 ~ $1.00

진행 상황:
```
================================================================================
ChromaDB에 1410개 안건 추가 시작
================================================================================

진행: 100/1410 (7.1%)
진행: 200/1410 (14.2%)
...
진행: 1410/1410 (100.0%)

✓ 총 1410개 안건 추가 완료
```

### 4. 백엔드 서버 실행

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

또는:
```bash
python app/main.py
```

서버가 시작되면:
- API 문서: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 5. 프론트엔드 실행 (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 접속:
- http://localhost:3000

---

## 📊 데이터 통계

- **총 회의록**: 53개
- **총 안건**: 1,410개
- **회기**: 제332회 임시회 (2025.08.27 ~ 2025.09.12)
- **위원회**: 20개

---

## 🧪 테스트

### 1. API 테스트 (Swagger UI)

http://localhost:8000/docs 에서 직접 테스트:

**1) 안건 목록 조회**
```
GET /api/issues?limit=10&offset=0
```

**2) 시맨틱 검색 테스트**
```
POST /api/search
{
  "query": "교통 요금 인상",
  "limit": 5
}
```

**3) 챗봇 테스트**
```
POST /api/chat
{
  "message": "행정사무감사는 언제 진행되나요?",
  "history": []
}
```

### 2. 프론트엔드 테스트

1. http://localhost:3000 접속
2. 메인 페이지에서 1,410개 안건 목록 확인
3. 검색 기능 테스트
4. 챗봇 테스트 (우측 하단 버튼)

---

## 🐛 문제 해결

### 1. ChromaDB 초기화 실패

**증상**: `OPENAI_API_KEY not found`
**해결**:
```bash
# .env 파일 확인
cat backend/.env

# API 키가 올바르게 설정되었는지 확인
```

### 2. 백엔드 서버 시작 실패

**증상**: `ModuleNotFoundError: No module named 'fastapi'`
**해결**:
```bash
cd backend
pip install -r requirements.txt
```

### 3. 프론트엔드 빌드 오류

**증상**: `Module not found: Can't resolve '@/data/realData'`
**해결**:
```bash
# 데이터 파일이 생성되었는지 확인
ls frontend/data/realData.ts

# 없으면 파싱 스크립트 재실행
python parse_session_332.py
```

### 4. CORS 오류

**증상**: `Access to fetch has been blocked by CORS policy`
**해결**:
- 백엔드가 http://localhost:8000 에서 실행 중인지 확인
- 프론트엔드가 http://localhost:3000 에서 실행 중인지 확인

---

## 📁 프로젝트 구조

```
seoulloc/
├── frontend/              # Next.js 프론트엔드
│   ├── app/
│   ├── components/
│   ├── data/
│   │   └── realData.ts   # 1,410개 안건 데이터
│   └── lib/
│
├── backend/               # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py       # 메인 앱
│   │   ├── routes/       # API 라우트
│   │   ├── services/     # 비즈니스 로직
│   │   └── models/       # 데이터 모델
│   ├── chroma_db/        # ChromaDB 저장소
│   └── requirements.txt
│
├── result/                # 크롤링된 회의록 (53개)
├── parsed_agenda_items.json  # 파싱된 안건 데이터
├── PROGRESS.md            # 개발 진행 상황
└── SETUP_GUIDE.md         # 이 파일
```

---

## 💰 비용 안내

### OpenAI API 사용량

1. **ChromaDB 초기화** (최초 1회)
   - 모델: text-embedding-3-small
   - 안건 수: 1,410개
   - 예상 토큰: 약 200,000 tokens
   - **예상 비용: $0.04**

2. **시맨틱 검색** (매 요청마다)
   - 검색 1회당: ~500 tokens
   - **예상 비용: $0.0001 (거의 무료)**

3. **RAG 챗봇** (매 요청마다)
   - 모델: gpt-4o-mini
   - 요청 1회당: ~1,000 tokens
   - **예상 비용: $0.0015**

**총 초기 비용**: $0.04 ~ $0.10
**운영 비용**: 검색/챗봇 100회 사용 시 약 $0.15

---

## 🎯 다음 단계

### Phase 3: 추가 기능
- [ ] LLM 기반 자동 요약 생성
- [ ] 쉬운 말 변환
- [ ] 안건 추적 시스템
- [ ] 첨부파일 다운로드

### Phase 4: 배포
- [ ] Docker 컨테이너화
- [ ] Vercel/AWS 배포
- [ ] 환경 변수 관리

---

## 📞 문의

문제가 발생하면 `PROGRESS.md` 파일을 참고하세요.
