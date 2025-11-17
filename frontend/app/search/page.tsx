'use client';

import { useState } from 'react';
import Link from 'next/link';
import { issues } from '@/data/realData';
import IssueCard from '@/components/IssueCard';
import ChatBot from '@/components/ChatBot';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // 검색 필터링
  const filteredIssues = searchQuery
    ? issues.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.committee?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : issues;

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssues = filteredIssues.slice(startIndex, endIndex);

  // 페이지 변경 시 currentPage 리셋
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // 검색어 변경 시 currentPage 리셋
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // 페이지 번호 배열 생성 (최대 10개 페이지 버튼만 표시)
  const getPageNumbers = () => {
    const maxButtons = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">📋 전체 회의록</h1>
          <p className="text-sm text-gray-600 mt-1">총 {issues.length}개 안건</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 검색창 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="안건 제목이나 위원회로 검색..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 검색 결과 수 및 페이지당 항목 수 선택 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {searchQuery ? (
              <p>검색 결과: {filteredIssues.length}개</p>
            ) : (
              <p>전체 {filteredIssues.length}개 안건 중 {startIndex + 1}-{Math.min(endIndex, filteredIssues.length)}개 표시</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">페이지당</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={50}>50개</option>
              <option value={100}>100개</option>
            </select>
          </div>
        </div>

        {/* 안건 목록 */}
        <div className="space-y-4">
          {currentIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              id={issue.id}
              emoji="📄"
              title={issue.title}
              status={issue.status}
              impact={issue.committee || "전체"}
              relatedMeeting={`${issue.date} - ${issue.committee}`}
              region={issue.impact}
            />
          ))}
        </div>

        {/* 결과 없음 */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {/* 첫 페이지 */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              «
            </button>

            {/* 이전 페이지 */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              ‹
            </button>

            {/* 페이지 번호들 */}
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 border rounded-lg text-sm ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* 다음 페이지 */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              ›
            </button>

            {/* 마지막 페이지 */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              »
            </button>

            {/* 페이지 정보 */}
            <span className="ml-4 text-sm text-gray-600">
              {currentPage} / {totalPages} 페이지
            </span>
          </div>
        )}
      </div>

      {/* 챗봇 */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>서울시의회 회의록 시민 서비스 (프로토타입)</p>
        </div>
      </footer>
    </main>
  );
}
