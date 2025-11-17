"""
FastAPI 메인 애플리케이션
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import issues, search, chat
from app.services.vector_db import VectorDBService

# 환경 변수 로드
load_dotenv()

# FastAPI 앱 생성
app = FastAPI(
    title="SeoulLog API",
    description="서울시의회 회의록 검색 및 RAG 챗봇 API",
    version="1.0.0"
)

# CORS 설정 (Next.js 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# VectorDB 서비스 초기화 (전역)
@app.on_event("startup")
async def startup_event():
    """서버 시작 시 VectorDB 로드"""
    app.state.vector_db = VectorDBService(
        persist_dir=os.getenv("CHROMA_PERSIST_DIR", "./chroma_db"),
        collection_name=os.getenv("COLLECTION_NAME", "seoul_meetings")
    )
    print("✓ VectorDB 서비스 로드 완료")

# 라우터 등록
app.include_router(issues.router, prefix="/api", tags=["Issues"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])

@app.get("/")
async def root():
    """API 루트"""
    return {
        "message": "SeoulLog API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True
    )
