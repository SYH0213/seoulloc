# SeoulLog Backend API

FastAPI 기반 서울시의회 회의록 검색 및 RAG 챗봇 API

## 설치 방법

```bash
# 1. 가상환경 생성 (선택)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 패키지 설치
pip install -r requirements.txt

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 열어서 OPENAI_API_KEY 입력
```

## ChromaDB 초기화

```bash
cd app/services
python vector_db.py
```

**주의**: OpenAI API 사용량 발생 (약 1,410개 안건 임베딩)
- 예상 비용: $0.50 ~ $1.00 (text-embedding-3-small 기준)

## 서버 실행

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

또는:

```bash
python app/main.py
```

## API 문서

서버 실행 후:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 엔드포인트

### 안건 목록
- `GET /api/issues` - 전체 안건 목록
- `GET /api/issues/{id}` - 특정 안건 상세
- `GET /api/issues/stats` - 통계

### 검색
- `POST /api/search` - 시맨틱 검색
  ```json
  {
    "query": "교통 관련 안건",
    "limit": 10,
    "filters": {"committee": "교통위원회"}
  }
  ```

### 챗봇
- `POST /api/chat` - RAG 챗봇
  ```json
  {
    "message": "교통 요금 인상 관련 안건이 있나요?",
    "history": []
  }
  ```

## 폴더 구조

```
backend/
├── app/
│   ├── main.py              # FastAPI 앱
│   ├── routes/              # API 라우트
│   │   ├── issues.py        # 안건 API
│   │   ├── search.py        # 검색 API
│   │   └── chat.py          # 챗봇 API
│   ├── services/            # 비즈니스 로직
│   │   └── vector_db.py     # ChromaDB 서비스
│   └── models/              # 데이터 모델
│       └── schemas.py       # Pydantic 스키마
├── chroma_db/               # ChromaDB 저장소 (자동 생성)
├── requirements.txt
├── .env
└── README.md
```
