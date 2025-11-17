export interface MeetingInfo {
  title: string;
  session_number: string | null;
  committee: string | null;
  meeting_number: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  duration_minutes: number | null;
}

export interface AgendaItem {
  number: string;
  title: string;
  status: string;
  summary: string | null;
  easy_explanation: string | null;
  time: string | null;
  key_points: string[];
}

export interface Speaker {
  name: string;
  role: string;
  profile_url: string | null;
  speech_count: number;
}

export interface TimelineEvent {
  time: string;
  event: string;
  type: 'start' | 'agenda' | 'end';
  status?: string;
}

export interface Attachment {
  title: string;
  url: string;
}

export interface Speech {
  speaker: string;
  text: string;
  type: string;
}

export interface MeetingData {
  meeting: MeetingInfo;
  agenda_items: AgendaItem[];
  speakers: Speaker[];
  timeline: TimelineEvent[];
  attachments: Attachment[];
  transcript: Speech[];
  url: string;
  summary: string;
  glossary: Record<string, string>;
}
