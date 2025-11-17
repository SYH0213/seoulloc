import { Speaker } from '@/types/meeting';

interface Props {
  speakers: Speaker[];
}

export default function SpeakerList({ speakers }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">👥 참석자 및 발언자</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {speakers.map((speaker, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{speaker.name}</h3>
                <p className="text-sm text-gray-600">{speaker.role}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                발언 {speaker.speech_count}회
              </span>
            </div>

            {speaker.profile_url && (
              <a
                href={speaker.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-blue-600 hover:underline"
              >
                프로필 보기 →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
