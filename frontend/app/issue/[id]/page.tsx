'use client';

import { use } from 'react';
import Link from 'next/link';
import { issues } from '@/data/realData';
import ChatBot from '@/components/ChatBot';

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const issue = issues.find(i => i.id === parseInt(id));

  if (!issue) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>이슈를 찾을 수 없습니다.</p>
    </div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            ← 뒤로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">{issue.emoji}</span>
            {issue.title}
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* 3줄 요약 */}
        <section className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 요약</h2>
          <div className="text-gray-800 leading-relaxed">
            {typeof issue.summary === 'string' ? (
              <p>{issue.summary}</p>
            ) : (
              <ol className="space-y-2">
                {issue.summary.map((line, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* 쉬운 설명 */}
        {issue.easyExplanation && (
          <section className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💬 쉬운 설명</h2>
            <p className="text-gray-800 leading-relaxed">{issue.easyExplanation}</p>
          </section>
        )}

        {/* 타임라인 */}
        {issue.timeline && issue.timeline.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">⏱️ 결정 과정</h2>
            <div className="relative">
              {/* 세로선 */}
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-300"></div>

              {/* 이벤트들 */}
              <div className="space-y-8">
                {issue.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-12">
                    {/* 도트 */}
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      event.type === 'proposal' ? 'bg-gray-500' :
                      event.type === 'review' ? 'bg-blue-500' :
                      event.type === 'passed' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}>
                      {event.type === 'proposal' ? '📝' :
                       event.type === 'review' ? '🔍' :
                       event.type === 'passed' ? '✅' : '🚇'}
                    </div>

                    {/* 내용 */}
                    <div>
                      <div className="text-sm font-semibold text-gray-600">{event.date}</div>
                      <div className="text-gray-900 font-medium mt-1">{event.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 첨부 자료 */}
        {issue.attachments && issue.attachments.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📎 첨부 자료</h2>
            <div className="space-y-2">
              {issue.attachments.map((attachment, idx) => (
                <a
                  key={idx}
                  href={attachment.url}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <span>📄</span>
                  <span>{attachment.title}</span>
                  <span className="text-gray-400 text-sm">[PDF 다운로드]</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 원문 보기 */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 원문 보기</h2>
          {issue.url ? (
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              원문 회의록 보러가기 →
            </a>
          ) : (
            <p className="text-gray-500">원문 링크가 없습니다.</p>
          )}
        </section>
      </div>

      {/* 챗봇 */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>서울시의회 회의록 시민 서비스 (프로토타입)</p>
        </div>
      </footer>
    </main>
  );
}
