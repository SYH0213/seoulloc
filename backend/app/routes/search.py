"""
시맨틱 검색 API 라우트
"""
from fastapi import APIRouter, HTTPException, Request
from typing import List
from app.models.schemas import SearchRequest, SearchResult

router = APIRouter()

@router.post("/search", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest, req: Request):
    """
    시맨틱 검색
    """
    try:
        # VectorDB 서비스 가져오기
        vector_db = req.app.state.vector_db

        # 검색 실행
        results = vector_db.search(
            query=request.query,
            limit=request.limit,
            filters=request.filters
        )

        # SearchResult 형식으로 변환
        search_results = [SearchResult(**result) for result in results]

        return search_results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 실패: {str(e)}")
