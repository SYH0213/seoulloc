"""
ChromaDB 벡터 데이터베이스 서비스
"""
import json
import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from openai import OpenAI

class VectorDBService:
    def __init__(self, persist_dir: str = "./chroma_db", collection_name: str = "seoul_meetings"):
        """ChromaDB 초기화"""
        self.persist_dir = persist_dir
        self.collection_name = collection_name

        # ChromaDB 클라이언트 생성
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )

        # OpenAI 클라이언트
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # 컬렉션 가져오기 또는 생성
        try:
            self.collection = self.client.get_collection(name=collection_name)
            print(f"✓ 기존 컬렉션 로드: {collection_name}")
        except:
            self.collection = self.client.create_collection(
                name=collection_name,
                metadata={"description": "서울시의회 회의록 안건"}
            )
            print(f"✓ 새 컬렉션 생성: {collection_name}")

    def generate_embedding(self, text: str) -> List[float]:
        """OpenAI API로 텍스트 임베딩 생성"""
        response = self.openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding

    def add_documents(self, agenda_items: List[Dict[str, Any]], batch_size: int = 100):
        """
        안건 목록을 ChromaDB에 추가
        """
        total = len(agenda_items)
        print(f"\n{'=' * 80}")
        print(f"ChromaDB에 {total}개 안건 추가 시작")
        print(f"{'=' * 80}\n")

        for i in range(0, total, batch_size):
            batch = agenda_items[i:i+batch_size]

            ids = []
            documents = []
            embeddings = []
            metadatas = []

            for item in batch:
                # ID
                ids.append(item['id'])

                # 문서 텍스트 (제목 + 내용)
                doc_text = f"{item['title']}\n\n{item['content']}"
                documents.append(doc_text)

                # 임베딩 생성
                embedding = self.generate_embedding(doc_text)
                embeddings.append(embedding)

                # 메타데이터
                metadata = {
                    "title": item['title'],
                    "committee": item['metadata']['committee'],
                    "date": item['metadata']['date'],
                    "decision": item['decision'],
                    "url": item['metadata']['url'],
                    "session_number": item['metadata']['session_number'],
                    "meeting_number": item['metadata']['meeting_number']
                }
                metadatas.append(metadata)

            # ChromaDB에 배치 추가
            self.collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )

            progress = min(i + batch_size, total)
            print(f"진행: {progress}/{total} ({progress/total*100:.1f}%)")

        print(f"\n✓ 총 {total}개 안건 추가 완료\n")

    def search(self, query: str, limit: int = 10, filters: Optional[Dict] = None) -> List[Dict]:
        """
        시맨틱 검색
        """
        # 쿼리 임베딩 생성
        query_embedding = self.generate_embedding(query)

        # ChromaDB 검색
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            where=filters if filters else None
        )

        # 결과 포맷팅
        search_results = []
        for i in range(len(results['ids'][0])):
            search_results.append({
                "id": results['ids'][0][i],
                "title": results['metadatas'][0][i]['title'],
                "content": results['documents'][0][i],
                "committee": results['metadatas'][0][i]['committee'],
                "date": results['metadatas'][0][i]['date'],
                "decision": results['metadatas'][0][i]['decision'],
                "url": results['metadatas'][0][i]['url'],
                "score": float(results['distances'][0][i])
            })

        return search_results

    def get_collection_stats(self) -> Dict:
        """컬렉션 통계"""
        count = self.collection.count()
        return {
            "collection_name": self.collection_name,
            "total_documents": count
        }

def init_vector_db_from_json(json_file: str = None):
    """
    JSON 파일에서 ChromaDB 초기화
    """
    # JSON 파일 경로 자동 탐지
    if json_file is None:
        # 현재 파일의 위치에서 프로젝트 루트 찾기
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, '../../..'))
        json_file = os.path.join(project_root, 'parsed_agenda_items.json')

    if not os.path.exists(json_file):
        print(f"❌ 파일을 찾을 수 없습니다: {json_file}")
        print(f"현재 작업 디렉토리: {os.getcwd()}")
        print(f"찾는 파일 경로: {json_file}")
        return

    print(f"✓ JSON 파일 찾음: {json_file}\n")

    # JSON 로드
    with open(json_file, 'r', encoding='utf-8') as f:
        agenda_items = json.load(f)

    # VectorDB 서비스 생성
    db_service = VectorDBService()

    # 기존 데이터 확인
    stats = db_service.get_collection_stats()
    if stats['total_documents'] > 0:
        print(f"⚠ 컬렉션에 이미 {stats['total_documents']}개 문서가 있습니다.")
        response = input("기존 데이터를 삭제하고 다시 추가하시겠습니까? (y/n): ")
        if response.lower() == 'y':
            # 컬렉션 삭제 후 재생성
            db_service.client.delete_collection(name=db_service.collection_name)
            db_service.collection = db_service.client.create_collection(
                name=db_service.collection_name,
                metadata={"description": "서울시의회 회의록 안건"}
            )
            print("✓ 기존 컬렉션 삭제 완료")
        else:
            print("종료합니다.")
            return

    # 문서 추가
    db_service.add_documents(agenda_items)

    # 완료 통계
    final_stats = db_service.get_collection_stats()
    print(f"{'=' * 80}")
    print(f"ChromaDB 초기화 완료")
    print(f"  - 컬렉션: {final_stats['collection_name']}")
    print(f"  - 총 문서: {final_stats['total_documents']}개")
    print(f"{'=' * 80}")

if __name__ == "__main__":
    # 환경 변수 로드
    from dotenv import load_dotenv
    load_dotenv()

    # ChromaDB 초기화
    init_vector_db_from_json()
