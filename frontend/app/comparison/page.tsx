import Link from 'next/link';

export default function ComparisonPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">기존 vs 개선: 무엇이 달라졌나요?</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Before/After 비교 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 기존 사이트 */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-600">❌</span>
              기존 SMC 사이트
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-100 rounded p-4 h-64 flex items-center justify-center text-gray-500">
                [회의록 목록 스크린샷]
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-sm text-gray-700">PDF 파일만 제공</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-sm text-gray-700">68페이지 회의록을 직접 읽어야 함</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-sm text-gray-700">검색 결과 부정확 (관련 없는 것도 나옴)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-sm text-gray-700">질문 기능 없음</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">❌</span>
                  <span className="text-sm text-gray-700">안건 진행 과정 파악 어려움</span>
                </div>
              </div>
            </div>
          </div>

          {/* 우리 개선안 */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">✅</span>
              우리 개선안
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded p-4 h-64 flex items-center justify-center">
                <Link href="/" className="text-blue-600 hover:underline font-medium">
                  [실제 데모 보기 →]
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-gray-700"><strong>3줄 요약</strong> 제공</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-gray-700"><strong>쉬운 말</strong>로 설명</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-gray-700"><strong>정확한 검색</strong> (관련도 순 정렬)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-gray-700"><strong>챗봇 질문</strong> 가능</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-gray-700"><strong>시각적 타임라인</strong> 제공</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사용자 시나리오 비교 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 사용자 시나리오 비교</h2>

          <div className="space-y-8">
            {/* 시나리오 1 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">직장인 A (점심시간에 빠르게 확인)</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-semibold">기존:</span>
                  <span className="text-gray-700">5분 걸려도 원하는 정보 못 찾고 포기 ❌</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold">개선:</span>
                  <span className="text-gray-700">30초 만에 3줄 요약으로 이해 완료 ✅</span>
                </div>
              </div>
            </div>

            {/* 시나리오 2 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">주부 B (내 동네 정책만 보고 싶어)</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-semibold">기존:</span>
                  <span className="text-gray-700">전체 회의록 목록을 일일이 뒤적임 ❌</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold">개선:</span>
                  <span className="text-gray-700">지역 필터로 즉시 확인 ✅</span>
                </div>
              </div>
            </div>

            {/* 시나리오 3 */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">청년 C (지하철 요금 왜 올랐는지만 알고 싶어)</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-semibold">기존:</span>
                  <span className="text-gray-700">정보 찾기 어렵고 이해 안 됨 ❌</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold">개선:</span>
                  <span className="text-gray-700">챗봇에 질문하고 즉답 받기 ✅</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 기대 효과 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 기대 효과</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">10배</div>
              <div className="text-sm text-gray-700">페이지 체류시간 증가</div>
              <div className="text-xs text-gray-500 mt-1">30초 → 3분</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">6배</div>
              <div className="text-sm text-gray-700">재방문율 증가</div>
              <div className="text-xs text-gray-500 mt-1">5% → 30%</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">7배</div>
              <div className="text-sm text-gray-700">시민 참여율 증가</div>
              <div className="text-xs text-gray-500 mt-1">0.3% → 2%</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            개선된 서비스 체험하기 →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>서울시의회 회의록 시민 서비스 (프로토타입)</p>
        </div>
      </footer>
    </main>
  );
}
