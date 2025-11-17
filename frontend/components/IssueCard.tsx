import Link from 'next/link';

interface IssueCardProps {
  id: number;
  emoji: string;
  title: string;
  status: string;
  impact: string;
  relatedMeeting: string;
  region?: string;
}

export default function IssueCard({
  id,
  emoji,
  title,
  status,
  impact,
  relatedMeeting,
  region
}: IssueCardProps) {
  return (
    <Link href={`/issue/${id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{emoji}</span>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          {region && region !== "전체" && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full whitespace-nowrap">
              📍 내 지역
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-semibold">✅</span>
            <span className="text-gray-700">{status}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-orange-600 font-semibold">💰</span>
            <span className="text-gray-700">{impact}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              📋 관련 회의: {relatedMeeting}
            </span>
            <span className="text-blue-600 font-medium text-sm hover:underline">
              자세히 보기 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
