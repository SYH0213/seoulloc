import { AgendaItem, Attachment } from '@/types/meeting';
import { useState } from 'react';

interface Props {
  item: AgendaItem;
  attachments: Attachment[];
  glossary: Record<string, string>;
}

export default function AgendaCard({ item, attachments, glossary }: Props) {
  const [showFullText, setShowFullText] = useState(false);

  // 이 안건과 관련된 첨부파일 찾기
  const relatedAttachments = attachments.filter(att =>
    att.title.includes(item.title.substring(0, 20))
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            📋 안건 {item.number}: {item.title}
          </h3>
          {item.time && (
            <span className="text-sm text-gray-600">⏰ {item.time}</span>
          )}
        </div>
        <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full whitespace-nowrap">
          ✓ {item.status}
        </span>
      </div>

      {item.easy_explanation && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <h4 className="font-semibold text-gray-900 mb-1">💬 쉬운 설명</h4>
          <p className="text-gray-700">{item.easy_explanation}</p>
        </div>
      )}

      {relatedAttachments.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 mb-2">📎 첨부문서</h4>
          <div className="space-y-2">
            {relatedAttachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                📄 {att.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
