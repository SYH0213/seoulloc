import { TimelineEvent } from '@/types/meeting';

interface Props {
  events: TimelineEvent[];
}

export default function Timeline({ events }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">⏱️ 회의 타임라인</h2>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, idx) => (
            <div key={idx} className="relative pl-10">
              {/* Timeline Dot */}
              <div
                className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  event.type === 'start'
                    ? 'bg-green-500'
                    : event.type === 'end'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
              >
                <span className="text-white text-xs font-bold">
                  {event.type === 'start' ? '▶' : event.type === 'end' ? '■' : idx}
                </span>
              </div>

              {/* Event Content */}
              <div>
                <div className="font-semibold text-gray-900">
                  {event.time} - {event.event}
                </div>
                {event.status && (
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {event.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {events.length >= 2 && (
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600">
            총 소요시간: {events[0]?.time} ~ {events[events.length - 1]?.time}
          </p>
        </div>
      )}
    </div>
  );
}
