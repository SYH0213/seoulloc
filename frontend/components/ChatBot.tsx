'use client';

import { useState } from 'react';
import { mockChatExamples } from '@/data/mockData';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);

    // Mock 답변 (실제로는 API 호출)
    setTimeout(() => {
      const mockAnswers: Record<string, string> = {
        "행정사무감사": "2025년도 행정사무감사는 11월 4일부터 11월 17일까지 14일간 진행됩니다. 이는 제332회 운영위원회 제1차 회의에서 결정되었습니다.\n\n📎 출처: 제332회 운영위원회 - 안건 2",
        "통과된 안건": "이번 회의에서는 총 4개의 안건이 모두 원안가결 되었습니다:\n1. 의사일정 협의\n2. 행정사무감사 일정 결정\n3. 공무국외활동 조례 개정\n4. 의원연구단체 변경\n\n📎 출처: 제332회 운영위원회",
        "지하철 요금": "지하철 운영 적자가 580억 원에 달해서 요금을 150원 인상하기로 결정했습니다. 2024년 12월 1일부터 1,550원으로 인상됩니다.\n\n📎 출처: 제345회 교통위원회"
      };

      const matchedKey = Object.keys(mockAnswers).find(key =>
        question.includes(key)
      );

      setAnswer(
        matchedKey
          ? mockAnswers[matchedKey]
          : "죄송합니다. 해당 질문에 대한 정보를 회의록에서 찾을 수 없습니다. 다른 질문을 해주시겠어요?"
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col max-h-[600px]">
          {/* 헤더 */}
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <span className="font-semibold">회의록 질문하기</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 답변 영역 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {answer && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">📘 답변:</p>
                <p className="text-gray-800 whitespace-pre-line">{answer}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">답변을 찾고 있습니다...</span>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                placeholder="회의록에 대해 질문하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={askQuestion}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                📤
              </button>
            </div>

            {/* 예시 질문 */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-600 mb-2">💡 질문 예시:</p>
              {mockChatExamples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(example)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-xs text-gray-700"
                >
                  • {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
