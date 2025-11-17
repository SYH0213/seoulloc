'use client';

import { useState } from 'react';
import Link from 'next/link';
import IssueCard from '@/components/IssueCard';
import ChatBot from '@/components/ChatBot';
import { issues } from '@/data/realData';

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // 지역 필터링 (최대 20개만 표시)
  const filteredIssues = issues
    .filter(issue =>
      selectedRegion === '전체' || issue.impact === selectedRegion || issue.impact === '전체'
    )
    .slice(0, 20);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏛️ 서울시의회 회의록</h1>
              <p className="text-sm text-gray-600 mt-1">시민이 쉽게 이해하는 회의록</p>
            </div>

            {/* 검색바 */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  🔍
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 지역 선택 */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            📍 내 지역:
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="전체">전체</option>
              <option value="강남구">강남구</option>
              <option value="강북구">강북구</option>
              <option value="은평구">은평구</option>
              <option value="마포구">마포구</option>
              <option value="송파구">송파구</option>
            </select>
          </label>
        </div>

        {/* 이슈 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🔥 지금 뜨는 이슈</h2>
            <Link
              href="/search"
              className="text-sm text-blue-600 hover:underline"
            >
              전체 회의록 보기 →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                id={issue.id}
                emoji="📄"
                title={issue.title}
                status={issue.status}
                impact={issue.impact}
                relatedMeeting={`${issue.date} - ${issue.committee}`}
                region={issue.impact}
              />
            ))}
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>해당 지역의 이슈가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 정보 섹션 */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 이 서비스는요</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>복잡한 회의록을 <strong>3줄 요약</strong>으로 빠르게 이해</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>어려운 용어를 <strong>쉬운 말</strong>로 풀어서 설명</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>우하단 챗봇으로 <strong>궁금한 점을 바로 질문</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>안건이 어떻게 진행되었는지 <strong>타임라인</strong>으로 확인</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 챗봇 */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>서울시의회 회의록 시민 서비스 (프로토타입)</p>
          <p className="mt-1">
            <Link href="/comparison" className="text-blue-600 hover:underline">
              기존 사이트와 비교하기
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
