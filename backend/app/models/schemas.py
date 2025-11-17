"""
Pydantic 스키마 정의
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class AgendaItem(BaseModel):
    """안건 아이템"""
    id: str
    item_number: int
    title: str
    content: str
    decision: str
    metadata: Dict[str, Any]

class SearchRequest(BaseModel):
    """검색 요청"""
    query: str
    limit: Optional[int] = 10
    filters: Optional[Dict[str, Any]] = None

class SearchResult(BaseModel):
    """검색 결과"""
    id: str
    title: str
    content: str
    committee: str
    date: str
    decision: str
    url: str
    score: float

class ChatRequest(BaseModel):
    """챗봇 요청"""
    message: str
    history: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    """챗봇 응답"""
    response: str
    sources: List[SearchResult]

class IssueResponse(BaseModel):
    """프론트엔드용 이슈 응답"""
    id: int
    title: str
    category: str
    status: str
    date: str
    impact: str
    summary: str
    committee: str
    decision: str
    url: str
