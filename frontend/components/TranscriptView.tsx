'use client';

import { Speech, Speaker } from '@/types/meeting';
import { useState } from 'react';

interface Props {
  transcript: Speech[];
  speakers: Speaker[];
  glossary: Record<string, string>;
}

export default function TranscriptView({ transcript, speakers, glossary }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);

  // 필터링된 발언 목록
  const filteredTranscript = transcript.filter(speech => {
    const matchesSearch = searchTerm === '' || speech.text.includes(searchTerm);
    const matchesSpeaker = selectedSpeaker === null || speech.speaker.includes(selectedSpeaker);
    return matchesSearch && matchesSpeaker;
  });

  // 고유 발언자 목록
  const uniqueSpeakers = Array.from(new Set(transcript.map(s => s.speaker)));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📝 회의 전문</h2>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔍 발언 내용 검색
          </label>
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👤 발언자 필터
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpeaker(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedSpeaker === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              전체
            </button>
            {uniqueSpeakers.map((speaker, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSpeaker(speaker)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSpeaker === speaker
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {speaker}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredTranscript.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            검색 결과가 없습니다.
          </p>
        ) : (
          filteredTranscript.map((speech, idx) => (
            <div
              key={idx}
              className="border-l-4 border-gray-300 pl-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-gray-900 mb-1">
                ○ {speech.speaker}
              </div>
              <div className="text-gray-700">
                {highlightSearchTerm(speech.text, searchTerm)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
        총 {filteredTranscript.length}개의 발언 ({transcript.length}개 중)
      </div>
    </div>
  );
}

// 검색어 하이라이트 함수
function highlightSearchTerm(text: string, searchTerm: string) {
  if (!searchTerm) return text;

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={idx} className="bg-yellow-200 font-semibold">
            {part}
          </span>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}
