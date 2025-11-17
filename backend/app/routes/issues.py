"""
안건 목록 API 라우트
"""
import json
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import IssueResponse

router = APIRouter()

# 캐시된 이슈 목록 (메모리)
_issues_cache = None

def load_issues():
    """parsed_agenda_items.json에서 이슈 로드"""
    global _issues_cache
    if _issues_cache is not None:
        return _issues_cache

    try:
        with open("../../parsed_agenda_items.json", 'r', encoding='utf-8') as f:
            agenda_items = json.load(f)

        # 프론트엔드 형식으로 변환
        issues = []
        for idx, item in enumerate(agenda_items):
            issue = IssueResponse(
                id=idx + 1,
                title=item['title'],
                category=item['metadata']['committee'],
                status="통과" if "가결" in item['decision'] else "심의중",
                date=item['metadata']['date'],
                impact="전체",
                summary=item['content'][:200] + "...",
                committee=item['metadata']['committee'],
                decision=item['decision'],
                url=item['metadata']['url']
            )
            issues.append(issue)

        _issues_cache = issues
        return issues

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이슈 로드 실패: {str(e)}")

@router.get("/issues", response_model=List[IssueResponse])
async def get_issues(limit: int = 100, offset: int = 0):
    """
    전체 안건 목록 조회
    """
    issues = load_issues()
    return issues[offset:offset+limit]

@router.get("/issues/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: int):
    """
    특정 안건 상세 조회
    """
    issues = load_issues()

    # ID로 검색
    for issue in issues:
        if issue.id == issue_id:
            return issue

    raise HTTPException(status_code=404, detail="안건을 찾을 수 없습니다")

@router.get("/issues/stats")
async def get_stats():
    """
    통계 정보
    """
    issues = load_issues()

    # 위원회별 통계
    committee_stats = {}
    for issue in issues:
        committee = issue.committee
        if committee not in committee_stats:
            committee_stats[committee] = 0
        committee_stats[committee] += 1

    # 결론별 통계
    decision_stats = {}
    for issue in issues:
        decision = issue.decision
        if decision not in decision_stats:
            decision_stats[decision] = 0
        decision_stats[decision] += 1

    return {
        "total": len(issues),
        "by_committee": committee_stats,
        "by_decision": decision_stats
    }
