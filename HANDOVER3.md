# 작업 인수인계 문서 #3

**작성 시각**: 2025-11-22
**작업 기간**: 2025-11-22 (1일)
**현재 상태**: Clean Architecture 리팩토링 완료 - Service + Repository 패턴 적용

---

## 🎯 작업 목표

**Clean Architecture 리팩토링**: backend_server.py의 비즈니스 로직과 DB 접근 로직을 분리하여 유지보수성 및 테스트 용이성 향상

### 문제점 분석

기존 backend_server.py (759줄)의 문제:
- ❌ 라우터에 비즈니스 로직 혼재 (안건 그룹핑, 결과 포맷팅)
- ❌ 라우터에서 DB 직접 접근 (ChromaDB, SQLite)
- ❌ 단일 책임 원칙 위반 (SRP - Single Responsibility Principle)
- ❌ 테스트 불가능 (DB와 강하게 결합)
- ❌ 코드 중복 (connection 관리, 에러 핸들링)

### 목표 아키텍처

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer (프레젠테이션 계층)          │
│  - backend_server.py                            │
│  - 요청/응답 처리만                              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Business Layer (비즈니스 계층)                  │
│  - services/                                    │
│  - 비즈니스 로직, 데이터 변환                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Data Access Layer (데이터 접근 계층)            │
│  - repositories/                                │
│  - 순수 CRUD 작업만                              │
└─────────────────────────────────────────────────┘
```

---

## 📋 작업 내용 (2025-11-22)

### ✅ 1. 네이밍 규칙 정립

#### 📄 NAMING_CONVENTION.md (30+ KB)

**목적**: 프로젝트 전체의 일관성 있는 네이밍 규칙 정립

**주요 내용**:
- **파일명 규칙**: snake_case, 역할에 맞는 접두사/접미사
  ```
  create_*.py      # DB/테이블/구조 생성
  generate_*.py    # AI를 사용한 콘텐츠 생성
  insert_*.py      # 데이터 삽입
  *_analyzer.py    # 분석 도구
  *_service.py     # 서비스 계층
  *_repository.py  # Repository 계층
  ```

- **클래스명 규칙**: PascalCase, 역할에 맞는 접미사
  ```python
  *Analyzer        # 분석 클래스
  *Validator       # 검증 클래스
  *Service         # 비즈니스 로직 서비스
  *Repository      # 데이터 접근 계층
  ```

- **메소드명 규칙**: snake_case, 동사로 시작
  ```python
  get_*()          # 단일 항목 조회
  find_*()         # 단일 항목 조회 (없으면 None)
  search_*()       # 검색
  create_*()       # 생성
  ```

- **변수명 규칙**: snake_case, 명사형
  ```python
  user_query       # 사용자 쿼리
  n_results        # 결과 개수
  agenda_scores    # 안건 점수
  ```

**특징**:
- 패턴별 예시 및 안티패턴 제시
- 일관성 체크리스트 제공
- DB 관련 네이밍 규칙 (테이블명, 컬럼명)

---

### ✅ 2. 리팩토링 계획 수립

#### 📄 REFACTORING_PLAN.md (25+ KB)

**목적**: Clean Architecture 리팩토링의 상세 계획 및 설계

**주요 내용**:

**1. 현재 구조의 문제점 분석**
- backend_server.py의 759줄 코드 분석
- POST /api/search 엔드포인트 237줄 상세 분석
- SRP 위반, DB 직접 접근, 테스트 불가능 등 문제점 나열

**2. 목표 아키텍처 설계**
```
Presentation (backend_server.py)
    ↓ Service 호출
Business (services/)
    ↓ Repository 호출
Data Access (repositories/)
```

**3. 계층별 역할 정의**
- **Presentation Layer**: 요청/응답 처리, Service 호출만
- **Business Layer**: 비즈니스 로직, 데이터 변환, Repository 조합
- **Data Access Layer**: DB 접근, 순수 CRUD

**4. 상세 코드 설계**
- AgendaRepository 메소드 설계
- ChromaRepository 메소드 설계
- AgendaSearchService 검색 파이프라인 설계
- AgendaService CRUD 로직 설계

**5. 데이터 흐름 다이어그램**
- 검색 API 흐름
- 안건 상세 API 흐름

**6. 리팩토링 5단계 계획**
- Phase 1: Repository 계층 구현
- Phase 2: Service 계층 구현
- Phase 3: backend_server.py 리팩토링
- Phase 4: 테스트 및 검증
- Phase 5: Git Commit

---

### ✅ 3. Repository 계층 구현

#### 📁 repositories/

**목적**: 데이터베이스 접근을 추상화하고 순수 CRUD 작업만 수행

#### 3-1. repositories/agenda_repository.py (155줄)

**책임**:
- SQLite DB 연결 관리
- 안건 테이블 CRUD
- 청크 테이블 조회

**주요 메소드**:
```python
class AgendaRepository:
    def find_by_id(self, agenda_id: str) -> Optional[Dict]:
        """안건 ID로 조회"""

    def find_by_agenda_ids(
        self,
        agenda_ids: List[str],
        exclude_agenda_types: List[str] = None
    ) -> List[Dict]:
        """여러 안건 ID로 조회 + agenda_type 필터링"""

    def find_top_agendas(
        self,
        limit: int = 5,
        exclude_titles_like: List[str] = None
    ) -> List[Dict]:
        """Top 안건 조회 (최신 + 활발한 논의)"""

    def find_chunks_by_agenda_id(self, agenda_id: str) -> List[Dict]:
        """안건 ID로 청크 조회"""
```

**특징**:
- Context Manager로 DB 연결 관리 (`get_connection()`)
- `sqlite3.Row`로 Dict-like 접근
- **agenda_type 필터링 지원** (procedural, discussion, other 제외)
- 비즈니스 로직 없음 (순수 CRUD만)

#### 3-2. repositories/chroma_repository.py (80줄)

**책임**:
- ChromaDB 연결 관리
- 벡터 검색
- 메타데이터 조회

**주요 메소드**:
```python
class ChromaRepository:
    def search(
        self,
        query: str,
        n_results: int = 20,
        where_filter: Optional[Dict] = None
    ) -> Dict:
        """벡터 검색"""

    def get_all_speakers(self) -> List[str]:
        """모든 발언자 조회"""

    def get_all_dates(self) -> List[str]:
        """모든 회의 날짜 조회"""
```

**특징**:
- OpenAI Embedding 함수 통합
- Telemetry 비활성화 (posthog 버전 충돌 방지)
- 순수 벡터 검색만 수행

---

### ✅ 4. Service 계층 구현

#### 📁 services/

**목적**: Repository 계층을 조합하여 비즈니스 로직 구현

#### 4-1. services/agenda_search_service.py (280줄)

**책임**:
- 검색 파이프라인 전체 조율
- 안건 그룹핑, 필터링, 결과 포맷팅
- 비용 추적 및 로깅

**검색 파이프라인**:
```
1. 쿼리 분석 (QueryAnalyzer)
   ↓
2. 메타데이터 검증 (MetadataValidator)
   ↓
3. ChromaDB 벡터 검색 (ChromaRepository)
   ↓
4. 안건별 그룹핑 (최고 유사도만 선택)
   ↓
5. agenda_type 필터링 (procedural, discussion, other 제외) ⭐ 신규
   ↓
6. SQLite 조회 (AgendaRepository)
   ↓
7. 결과 포맷팅
```

**주요 메소드**:
```python
class AgendaSearchService:
    # agenda_type 필터링: 실제 안건만 표시
    EXCLUDED_AGENDA_TYPES = ["procedural", "discussion", "other"]

    async def search(
        self,
        query: str,
        n_results: int = 5
    ) -> List[Dict]:
        """검색 파이프라인 실행"""
```

**특징**:
- 의존성 주입 (DI) 패턴
  ```python
  def __init__(
      self,
      chroma_repo: ChromaRepository,
      agenda_repo: AgendaRepository,
      analyzer: QueryAnalyzer,
      validator: Optional[MetadataValidator] = None,
      cost_tracker: Optional[CostTracker] = None
  ):
  ```
- 비용 추적 및 전역 추적기에 누적
- 검증 실패 시 빈 결과 반환 (에러 아님)
- Private 메소드로 각 단계 분리 (`_analyze_query`, `_validate_metadata`, 등)

#### 4-2. services/agenda_service.py (140줄)

**책임**:
- 안건 CRUD 비즈니스 로직
- JSON 필드 파싱 (key_issues, attachments)

**주요 메소드**:
```python
class AgendaService:
    async def get_agenda_detail(self, agenda_id: str) -> Dict:
        """안건 상세 조회 (청크 포함)"""

    async def get_formatted_detail(self, agenda_id: str) -> Dict:
        """포맷된 안건 상세 (첨부 문서 포함)"""

    async def get_top_agendas(self, limit: int = 5) -> List[Dict]:
        """Top 안건 조회"""
```

**특징**:
- Repository 호출 + 비즈니스 로직
- JSON 문자열 파싱 헬퍼 메소드 (`_parse_json_field`)
- ValueError 예외로 안건 없음 처리

---

### ✅ 5. backend_server.py 리팩토링

#### 변경 통계

| 항목 | 이전 | 리팩토링 후 | 변화 |
|------|------|-------------|------|
| 전체 코드 | 759줄 | 454줄 | **-40%** (305줄 감소) |
| POST /api/search | 237줄 | ~15줄 | **-94%** (222줄 감소) |
| 책임 | 라우팅 + DB + 비즈니스 로직 | **라우팅만** | ✅ SRP 준수 |

#### 주요 변경사항

**1. Import 구조 변경**
```python
# 기존: ChromaDB, SQLite 직접 import
import sqlite3
import chromadb

# 리팩토링 후: Repository, Service import
from repositories.agenda_repository import AgendaRepository
from repositories.chroma_repository import ChromaRepository
from services.agenda_service import AgendaService
from services.agenda_search_service import AgendaSearchService
```

**2. 의존성 초기화 (DI 패턴)**
```python
# Repository 초기화
chroma_repo = ChromaRepository()
agenda_repo = AgendaRepository()

# Service 초기화 (의존성 주입)
search_service = AgendaSearchService(
    chroma_repo=chroma_repo,
    agenda_repo=agenda_repo,
    analyzer=analyzer,
    validator=validator,
    cost_tracker=cost_tracker
)
agenda_service = AgendaService(agenda_repo=agenda_repo)
```

**3. 라우트 간소화**

**이전 (237줄)**:
```python
@app.post("/api/search")
async def search(request: SearchRequest):
    # 1. 쿼리 분석 (30줄)
    analyzed_metadata = analyzer.analyze(user_query)

    # 2. 메타데이터 검증 (40줄)
    validation_result = validator.validate(analyzed_metadata)

    # 3. ChromaDB 직접 쿼리 (10줄)
    chunk_results = chroma_collection.query(...)

    # 4. 안건별 그룹핑 (30줄)
    agenda_scores = {}
    for i, chunk_id in enumerate(...):
        # 그룹핑 로직

    # 5. SQLite 직접 쿼리 (60줄)
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor.execute(...)

    # 6. 결과 포맷팅 (50줄)
    formatted_results.append(...)

    return SearchResponse(...)
```

**리팩토링 후 (15줄)**:
```python
@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    안건 단위 검색

    Service 계층에 완전히 위임합니다.
    """
    try:
        # Service 호출만
        results = await search_service.search(
            query=request.query,
            n_results=request.n_results or 5
        )

        return SearchResponse(
            query=request.query,
            total_results=len(results),
            results=results
        )

    except Exception as e:
        print(f"❌ 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

**4. 다른 엔드포인트도 동일하게 간소화**
```python
# GET /api/agenda/{id}
detail = await agenda_service.get_agenda_detail(agenda_id)

# GET /api/agenda/{id}/formatted-detail
detail = await agenda_service.get_formatted_detail(agenda_id)

# GET /api/top-agendas
agendas = await agenda_service.get_top_agendas(limit=5)
```

#### 제거된 코드

- ❌ ChromaDB 클라이언트 직접 초기화 (20줄)
- ❌ SQLite 직접 접근 코드 (100+ 줄)
- ❌ 안건 그룹핑 로직 (30줄)
- ❌ 결과 포맷팅 로직 (50줄)
- ❌ 메타데이터 검증 로직 (40줄)

---

### ✅ 6. agenda_type 필터링 추가 ⭐ 신규 기능

#### 배경

기존에는 검색 결과에 실제 안건뿐만 아니라 절차적 안건, 토론, 기타 발언도 포함되어 있었습니다.

**DB 현황** (총 79개 안건):
```
실제 안건: 55개
  - legislation (조례): 30개
  - report (보고): 15개
  - budget (예산): 8개
  - consent (동의안): 2개

제외 대상: 24개
  - procedural (절차): 18개 (개의, 산회 등)
  - discussion (토론): 4개
  - other (기타): 2개
```

#### 구현

**1. AgendaRepository에 필터링 지원 추가**
```python
def find_by_agenda_ids(
    self,
    agenda_ids: List[str],
    exclude_agenda_types: List[str] = None  # ⭐ 신규 파라미터
) -> List[Dict]:
    """여러 안건 ID로 조회 + agenda_type 필터링"""

    # agenda_type 필터링
    if exclude_agenda_types:
        type_placeholders = ','.join('?' * len(exclude_agenda_types))
        where_clause += f' AND agenda_type NOT IN ({type_placeholders})'
        params.extend(exclude_agenda_types)
```

**2. AgendaSearchService에서 필터링 적용**
```python
class AgendaSearchService:
    # 제외할 안건 타입 정의
    EXCLUDED_AGENDA_TYPES = ["procedural", "discussion", "other"]

    async def search(self, query: str, n_results: int = 5):
        # ... 검색 로직 ...

        # SQLite 조회 시 필터링 적용
        agendas = self.agenda_repo.find_by_agenda_ids(
            agenda_ids=agenda_ids,
            exclude_agenda_types=self.EXCLUDED_AGENDA_TYPES  # ⭐
        )
```

#### 효과

- ✅ 검색 결과에 실제 안건만 표시 (조례, 보고, 예산, 동의안)
- ✅ 절차적 안건 제외 (개의, 산회 등)
- ✅ 토론, 기타 발언 제외
- ✅ 사용자 경험 개선

---

### ✅ 7. 리팩토링 후 버그 수정 및 추가 개선 (테스트 결과 반영)

#### 7-1. Pydantic Validation Error 수정 ⚠️ 버그 픽스

**문제 발견**:
서버 실행 후 `/api/top-agendas` 엔드포인트 테스트 중 발견

**증상**:
```
fastapi.exceptions.ResponseValidationError: 5 validation errors:
{'type': 'missing', 'loc': ('response', 0, 'title'), 'msg': 'Field required'}
```

**원인 분석**:
- TopAgenda Pydantic 모델: `title` 필드 기대
- AgendaRepository.find_top_agendas(): DB의 `agenda_title` 필드 반환
- AgendaService.get_top_agendas(): Repository 결과를 그대로 반환
- **필드명 불일치** 발생 (리팩토링 과정에서 발생한 버그)

**원래 코드의 동작**:
리팩토링 전 backend_server.py는 SQL 쿼리 결과를 TopAgenda 객체로 변환할 때 암묵적으로 필드 매핑을 수행했으나, 리팩토링 후 Service 계층에서 매핑이 누락됨.

**해결 방법**:
Service 계층에서 명시적 필드 매핑 추가

```python
# services/agenda_service.py
async def get_top_agendas(self, limit: int = 5) -> List[Dict]:
    agendas = self.agenda_repo.find_top_agendas(...)

    # Repository의 agenda_title → Pydantic 모델의 title 필드로 매핑
    return [
        {
            "agenda_id": agenda['agenda_id'],
            "title": agenda['agenda_title'],  # ⭐ 필드명 매핑
            "meeting_title": agenda['meeting_title'],
            "meeting_date": agenda['meeting_date'],
            "ai_summary": agenda.get('ai_summary'),
            "chunk_count": agenda['chunk_count'],
            "main_speaker": agenda['main_speaker'],
            "status": agenda['status']
        }
        for agenda in agendas
    ]
```

**수정 파일**:
- `services/agenda_service.py` (get_top_agendas 메서드)

**Git Commit**: `0209f02`

---

#### 7-2. Top 안건 API에 agenda_type 필터링 적용 ⭐ 기능 추가

**배경**:
사용자 피드백: "주목받는 안건 TOP 5에 안건이 아닌 것도 들어가는 것 같다"

**문제 분석**:
- 검색 API (`/api/search`)에는 agenda_type 필터링 적용됨
- Top 안건 API (`/api/top-agendas`)에는 **적용 안 됨**
- 절차적 안건(개회, 산회), 토론, 기타도 TOP 5에 포함됨

**기존 TOP 5 선정 기준**:
```sql
WHERE agenda_title NOT LIKE '%개의%'
  AND agenda_title NOT LIKE '%산회%'
  AND chunk_count > 10
ORDER BY meeting_date DESC, chunk_count DESC
```
→ 제목 필터링만 있고 **agenda_type 필터링 없음**

**구현**:

**1. Repository 계층 수정**:
```python
# repositories/agenda_repository.py
def find_top_agendas(
    self,
    limit: int = 5,
    exclude_titles_like: List[str] = None,
    exclude_agenda_types: List[str] = None  # ⭐ 신규 파라미터
) -> List[Dict]:
    # ...

    # agenda_type 필터링
    if exclude_agenda_types:
        type_placeholders = ','.join('?' * len(exclude_agenda_types))
        where_conditions.append(f'agenda_type NOT IN ({type_placeholders})')
        params.extend(exclude_agenda_types)
```

**2. Service 계층 수정**:
```python
# services/agenda_service.py
class AgendaService:
    # 검색 서비스와 동일한 필터링 규칙 적용
    EXCLUDED_AGENDA_TYPES = ["procedural", "discussion", "other"]

    async def get_top_agendas(self, limit: int = 5) -> List[Dict]:
        agendas = self.agenda_repo.find_top_agendas(
            limit=limit,
            exclude_titles_like=['%개의%', '%산회%'],
            exclude_agenda_types=self.EXCLUDED_AGENDA_TYPES  # ⭐ 적용
        )
```

**개선된 TOP 5 선정 기준**:
```sql
WHERE agenda_title NOT LIKE '%개의%'
  AND agenda_title NOT LIKE '%산회%'
  AND chunk_count > 10
  AND agenda_type NOT IN ('procedural', 'discussion', 'other')  -- ✅ 추가
ORDER BY meeting_date DESC, chunk_count DESC
LIMIT 5
```

**효과**:
- ✅ Top 안건에도 실제 안건만 표시 (조례, 보고, 예산, 동의안)
- ✅ 검색 API와 Top 안건 API의 필터링 정책 일관성 확보
- ✅ 사용자 경험 개선

**수정 파일**:
- `repositories/agenda_repository.py` (find_top_agendas 메서드)
- `services/agenda_service.py` (EXCLUDED_AGENDA_TYPES 상수 추가, get_top_agendas 메서드)

**Git Commit**: `b110602`

---

## 📊 성능 및 품질 지표

### 코드 품질 향상

| 지표 | 이전 | 리팩토링 후 |
|------|------|-------------|
| backend_server.py 라인 수 | 759줄 | 454줄 (-40%) |
| POST /api/search 라인 수 | 237줄 | 15줄 (-94%) |
| 파일 개수 | 1개 (backend_server.py) | 6개 (분산) |
| 테스트 용이성 | ❌ 불가능 | ✅ 가능 |
| SRP 준수 | ❌ 위반 | ✅ 준수 |

### 새로 생성된 파일

```
repositories/
  __init__.py                 (9줄)
  agenda_repository.py        (155줄)
  chroma_repository.py        (80줄)

services/
  __init__.py                 (11줄)
  agenda_search_service.py    (280줄)
  agenda_service.py           (140줄)

NAMING_CONVENTION.md          (1300+ 줄)
REFACTORING_PLAN.md           (1200+ 줄)
```

**총 추가**: 3,175+ 줄
**총 삭제**: 427줄 (backend_server.py)
**순증가**: 2,748+ 줄

### 설계 원칙 준수

✅ **단일 책임 원칙 (SRP)**
- Presentation: 요청/응답 처리만
- Business: 비즈니스 로직만
- Data Access: DB 접근만

✅ **의존성 역전 원칙 (DIP)**
- 상위 계층이 하위 계층에 의존
- 인터페이스를 통한 의존성 주입

✅ **개방-폐쇄 원칙 (OCP)**
- 확장에는 열려있고 수정에는 닫혀있음
- 새 Repository나 Service 추가 가능

---

## 🔧 Git Commit 내역

총 6개의 커밋 생성:

### 1️⃣ docs: 네이밍 규칙 및 리팩토링 계획 문서 추가
```
커밋: 946f1f5
파일: NAMING_CONVENTION.md, REFACTORING_PLAN.md
```
- 네이밍 규칙 문서 (30+ KB)
- 리팩토링 계획 문서 (25+ KB)

### 2️⃣ feat: Repository 계층 추가 (데이터 접근 계층)
```
커밋: 22088bf
파일: repositories/__init__.py
      repositories/agenda_repository.py (155줄)
      repositories/chroma_repository.py (80줄)
```
- SQLite, ChromaDB 접근 추상화
- agenda_type 필터링 지원
- Context Manager로 DB 연결 관리

### 3️⃣ feat: Service 계층 추가 (비즈니스 로직 계층)
```
커밋: d2db24f
파일: services/__init__.py
      services/agenda_search_service.py (280줄)
      services/agenda_service.py (140줄)
```
- 검색 파이프라인 비즈니스 로직
- 안건 CRUD 비즈니스 로직
- 의존성 주입 (DI) 패턴

### 4️⃣ refactor: backend_server.py Clean Architecture 리팩토링
```
커밋: 4fa9335
파일: backend_server.py
변경: 759줄 → 454줄 (-40%, 305줄 감소)
```
- POST /api/search: 237줄 → 15줄 (-94%)
- 라우팅과 비즈니스 로직 완전 분리
- 단일 책임 원칙 (SRP) 준수

### 5️⃣ fix: Service 계층에서 agenda_title → title 필드 매핑 추가
```
커밋: 0209f02
파일: services/agenda_service.py
```
- **리팩토링 과정에서 발생한 버그 수정**
- AgendaService.get_top_agendas()에서 필드명 매핑 추가
- Repository의 agenda_title을 TopAgenda 모델의 title로 변환
- GET /api/top-agendas 엔드포인트 Pydantic validation error 해결

### 6️⃣ feat: Top 안건 조회에 agenda_type 필터링 추가
```
커밋: b110602
파일: repositories/agenda_repository.py
      services/agenda_service.py
```
- **사용자 피드백 반영**: "안건이 아닌 것도 TOP 5에 포함됨"
- Repository의 find_top_agendas()에 exclude_agenda_types 파라미터 추가
- Service에 EXCLUDED_AGENDA_TYPES 상수 정의
- 절차적 안건(procedural), 토론(discussion), 기타(other) 제외
- 검색 API와 Top 안건 API의 필터링 정책 일관성 확보

---

## 📁 최종 파일 구조

```
seoulloc/
├── backend_server.py (454줄) ✅ 리팩토링 완료
│
├── repositories/ ⭐ 신규
│   ├── __init__.py
│   ├── agenda_repository.py (155줄)
│   └── chroma_repository.py (80줄)
│
├── services/ ⭐ 신규
│   ├── __init__.py
│   ├── agenda_service.py (140줄)
│   └── agenda_search_service.py (280줄)
│
├── search/ (기존)
│   ├── query_analyzer.py
│   ├── simple_query_analyzer.py
│   ├── metadata_validator.py
│   ├── search_executor.py
│   ├── result_formatter.py
│   └── answer_generator_simple.py
│
├── utils/ (기존)
│   ├── custom_openai_embedding.py
│   ├── search_chromadb.py
│   └── cost_tracker.py
│
├── database/ (기존)
│   ├── create_agenda_database.py
│   ├── generate_ai_summaries.py
│   ├── generate_attachment_summaries.py
│   └── insert_to_chromadb.py
│
├── data_processing/ (기존)
│   ├── extract_metadata_hybrid.py
│   ├── parse_with_pure_code.py
│   └── process_all_result_folders.py
│
├── crawling/ (기존)
│   ├── extract_session_332_links.py
│   └── crawl_all_urls.py
│
├── frontend/ (기존)
│   ├── main.html
│   ├── search.html
│   └── details.html
│
├── data/ (기존)
│   ├── result_txt/          # JSON 파일
│   ├── chroma_db/           # ChromaDB 벡터 DB
│   └── sqlite_DB/           # SQLite DB
│       └── agendas.db
│
├── old/ (기존)              # 구버전 코드
├── prompts/ (기존)          # 프롬프트 템플릿
│
├── NAMING_CONVENTION.md ⭐ 신규
├── REFACTORING_PLAN.md ⭐ 신규
├── HANDOVER.md (기존)
├── HANDOVER2.md (기존)
├── HANDOVER3.md ⭐ 현재 문서
├── ATTACHMENT_IMPLEMENTATION.md (기존)
├── PIPELINE.md (기존)
├── PATH_CHECK.md (기존)
└── README.md (기존)
```

---

## 🧪 테스트 계획

### 수동 테스트 항목

#### 1. 서버 실행 테스트
```bash
# Conda 환경 활성화
conda activate genminute

# 서버 실행
python backend_server.py
```

**예상 출력**:
```
================================================================================
SeoulLog 백엔드 서버 초기화
================================================================================

📦 Repository 계층 초기화...
✅ ChromaRepository, AgendaRepository 초기화 완료

🔍 쿼리 분석기 초기화...
✅ QueryAnalyzer (OpenAI) 초기화 성공

🔎 메타데이터 검증기 초기화...
✅ MetadataValidator 초기화 성공

⚙️ Service 계층 초기화...
✅ AgendaSearchService, AgendaService 초기화 완료

================================================================================
✅ 서버 초기화 완료!
================================================================================
```

#### 2. API 테스트

**검색 API** (POST /api/search):
```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI 인재 양성", "n_results": 5}'
```

**검증 항목**:
- ✅ 검색 결과 5개 이하 반환
- ✅ procedural, discussion, other 타입 제외 확인
- ✅ similarity 점수 0~1 범위
- ✅ ai_summary 존재
- ✅ key_issues 존재 (있는 경우)

**안건 상세 API** (GET /api/agenda/{id}):
```bash
curl http://localhost:8000/api/agenda/meeting_20251119_113802_agenda_001
```

**검증 항목**:
- ✅ agenda_id, title, meeting_title, meeting_date 존재
- ✅ ai_summary 존재
- ✅ chunks 배열 존재

**Top 안건 API** (GET /api/top-agendas):
```bash
curl http://localhost:8000/api/top-agendas
```

**검증 항목**:
- ✅ 5개 이하 안건 반환
- ✅ chunk_count > 10
- ✅ "개의", "산회" 제목 제외

#### 3. agenda_type 필터링 확인

**검색 쿼리**: "개의"
```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "개의", "n_results": 5}'
```

**예상 결과**:
- "개의"라는 단어가 포함된 안건은 검색되지만
- agenda_type이 "procedural"인 "개의" 안건은 **제외**됨

---

## 🚀 다음 단계 (권장 사항)

### 1. 즉시 수행 (필수)

✅ **서버 실행 및 테스트**
```bash
conda activate genminute
python backend_server.py
```

✅ **API 동작 확인**
- POST /api/search
- GET /api/top-agendas
- GET /api/agenda/{id}

### 2. 단기 (1-2일 내)

🔲 **유닛 테스트 작성**
```python
# tests/test_agenda_repository.py
def test_find_by_id():
    repo = AgendaRepository()
    agenda = repo.find_by_id("meeting_20251119_113802_agenda_001")
    assert agenda is not None

# tests/test_agenda_search_service.py
def test_search():
    service = AgendaSearchService(...)
    results = await service.search("AI", n_results=5)
    assert len(results) <= 5
```

🔲 **API 통합 테스트 작성**
```python
# tests/test_api.py
def test_search_api():
    response = client.post("/api/search", json={"query": "AI", "n_results": 5})
    assert response.status_code == 200
    assert len(response.json()["results"]) <= 5
```

### 3. 중기 (1주일 내)

🔲 **성능 모니터링**
- 검색 응답 시간 측정
- DB 쿼리 성능 분석
- 비용 추적 데이터 분석

🔲 **에러 핸들링 개선**
- Custom Exception 클래스 추가
- 더 구체적인 에러 메시지
- 로깅 시스템 개선

### 4. 장기 (2주 이상)

🔲 **Dependency Injection Container**
- 현재는 수동 DI
- 자동 DI 컨테이너 도입 고려 (python-dependency-injector 등)

🔲 **캐싱 시스템**
- 자주 조회되는 안건 캐싱
- Redis 도입 고려

🔲 **프론트엔드 개선**
- agenda_type 필터링 UI 추가
- 검색 결과 정렬 옵션 추가

---

## 📝 주요 학습 포인트

### Clean Architecture 적용

**Before (Monolithic)**:
```
backend_server.py (759줄)
  ├── 라우팅
  ├── 비즈니스 로직
  └── DB 접근
```

**After (Layered)**:
```
backend_server.py (454줄) - Presentation
  ↓
services/ - Business Logic
  ↓
repositories/ - Data Access
```

### 의존성 주입 (DI) 패턴

**장점**:
- 테스트 용이성 (Mock 객체 주입 가능)
- 결합도 감소
- 유연성 향상

**예시**:
```python
# Service 초기화 시 Repository 주입
search_service = AgendaSearchService(
    chroma_repo=chroma_repo,
    agenda_repo=agenda_repo,
    analyzer=analyzer
)
```

### 단일 책임 원칙 (SRP)

**각 계층의 책임**:
- **Presentation**: 요청/응답만
- **Business**: 비즈니스 로직만
- **Data Access**: DB 접근만

**효과**:
- 코드 이해 용이
- 유지보수 간편
- 테스트 간단

---

## ⚠️ 주의사항

### 1. 서버 실행 환경

**반드시 Conda 환경 활성화**:
```bash
conda activate genminute  # 또는 사용 중인 환경
```

**필요 패키지**:
- fastapi
- uvicorn
- chromadb
- openai
- google-generativeai

### 2. 환경 변수

**.env 파일 필수**:
```
OPENAI_API_KEY=your-key
GOOGLE_API_KEY=your-key
```

### 3. DB 경로

**SQLite DB 경로 확인**:
```
data/sqlite_DB/agendas.db
```

**ChromaDB 경로 확인**:
```
data/chroma_db/
```

### 4. Import 경로

**프로젝트 루트에서 실행**:
```bash
cd /mnt/c/Users/SBA/Project/seoulloc
python backend_server.py
```

**하위 폴더에서 실행 시 Import 에러 발생**

---

## 🔍 트러블슈팅

### 문제 1: ModuleNotFoundError

**증상**:
```
ModuleNotFoundError: No module named 'repositories'
```

**해결**:
```bash
# 프로젝트 루트에서 실행하는지 확인
pwd
# /mnt/c/Users/SBA/Project/seoulloc

# 또는 PYTHONPATH 설정
export PYTHONPATH=/mnt/c/Users/SBA/Project/seoulloc:$PYTHONPATH
```

### 문제 2: DB 연결 에러

**증상**:
```
sqlite3.OperationalError: unable to open database file
```

**해결**:
```bash
# DB 파일 경로 확인
ls -la data/sqlite_DB/agendas.db

# 없으면 재생성
python database/create_agenda_database.py
python database/generate_ai_summaries.py
```

### 문제 3: ChromaDB 에러

**증상**:
```
chromadb.errors.InvalidCollectionException: Collection seoul_council_meetings does not exist
```

**해결**:
```bash
# ChromaDB 재생성
python database/insert_to_chromadb.py
```

---

## 📚 참고 문서

### 프로젝트 문서
- **NAMING_CONVENTION.md**: 네이밍 규칙 상세
- **REFACTORING_PLAN.md**: 리팩토링 계획 및 설계
- **PIPELINE.md**: 전체 파이프라인 문서
- **HANDOVER.md**: 11/18-11/20 작업 내역
- **HANDOVER2.md**: 11/21 작업 내역
- **ATTACHMENT_IMPLEMENTATION.md**: 첨부 문서 구현

### 외부 참고 자료
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## 👥 작업자

**Claude Code** (AI Assistant)
**날짜**: 2025-11-22
**작업 시간**: 약 2-3시간

---

## ✅ 체크리스트

### 완료된 작업 (2025-11-22)
- [x] 네이밍 규칙 정립 및 문서화
- [x] 리팩토링 계획 수립 및 문서화
- [x] Repository 계층 구현
- [x] Service 계층 구현
- [x] backend_server.py 리팩토링
- [x] 검색 API에 agenda_type 필터링 추가
- [x] **Pydantic validation error 버그 수정** (리팩토링 후 테스트 결과 반영)
- [x] **Top 안건 API에도 agenda_type 필터링 추가** (사용자 피드백 반영)
- [x] Git commit (6개)
- [x] 인수인계 문서 작성 및 업데이트 (HANDOVER3.md)

### 다음 작업자가 해야 할 일
- [ ] 서버 실행 및 동작 확인 (사용자 환경)
- [ ] API 테스트 (POST /api/search, GET /api/top-agendas)
- [ ] agenda_type 필터링 동작 확인
- [ ] 유닛 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 성능 모니터링
- [ ] 에러 핸들링 개선

---

**마지막 업데이트**: 2025-11-22 (완료)
**문서 버전**: 2.0 (버그 수정 및 추가 개선 반영)
**프로젝트**: SeoulLog - 서울시의회 회의록 검색 시스템
**작업 완료**: 2025-11-22 Clean Architecture 리팩토링 및 테스트 기반 개선 완료
