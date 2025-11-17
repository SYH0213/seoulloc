import { MeetingInfo, TimelineEvent } from '@/types/meeting';

interface Props {
  meeting: MeetingInfo;
  summary: string;
  timeline: TimelineEvent[];
}

export default function MeetingSummaryCard({ meeting, summary, timeline }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{meeting.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>📅 {meeting.date}</span>
            {meeting.start_time && meeting.end_time && (
              <span>
                ⏰ {meeting.start_time} ~ {meeting.end_time}
              </span>
            )}
            {meeting.duration_minutes && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {meeting.duration_minutes}분
              </span>
            )}
          </div>
          {meeting.location && (
            <div className="mt-1 text-sm text-gray-600">
              📍 {meeting.location}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">📊 한 줄 요약</h3>
        <p className="text-gray-700">{summary}</p>
      </div>
    </div>
  );
}
