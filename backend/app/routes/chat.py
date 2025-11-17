"""
RAG 챗봇 API 라우트
"""
import os
from fastapi import APIRouter, HTTPException, Request
from openai import OpenAI
from app.models.schemas import ChatRequest, ChatResponse, SearchResult

router = APIRouter()

# OpenAI 클라이언트 (함수 내에서 생성)
def get_openai_client():
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    RAG 기반 챗봇
    """
    try:
        # 1. VectorDB에서 관련 문서 검색
        vector_db = req.app.state.vector_db
        search_results = vector_db.search(query=request.message, limit=5)

        if not search_results:
            return ChatResponse(
                response="죄송합니다. 관련된 회의록을 찾을 수 없습니다.",
                sources=[]
            )

        # 2. 컨텍스트 구성
        context = "\n\n".join([
            f"[{result['committee']} - {result['date']}]\n제목: {result['title']}\n내용: {result['content'][:500]}"
            for result in search_results[:3]
        ])

        # 3. LLM 프롬프트 구성
        system_prompt = """당신은 서울시의회 회의록 도우미입니다.
사용자의 질문에 대해 제공된 회의록 내용을 바탕으로 정확하고 친절하게 답변해주세요.

답변 규칙:
1. 쉬운 말로 설명하세요
2. 날짜와 위원회 정보를 명확히 포함하세요
3. 회의록에 없는 내용은 추측하지 마세요
4. 답변은 3-5문장으로 간결하게 작성하세요"""

        user_prompt = f"""질문: {request.message}

관련 회의록 내용:
{context}

위 회의록 내용을 바탕으로 질문에 답변해주세요."""

        # 4. LLM 호출
        openai_client = get_openai_client()
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        answer = response.choices[0].message.content

        # 5. 출처 포맷팅
        sources = [SearchResult(**result) for result in search_results[:3]]

        return ChatResponse(
            response=answer,
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"챗봇 응답 생성 실패: {str(e)}")
