import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";

/* Backend Chat API contracts. */

export interface ApiConversationParticipant {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface ApiConversationBusiness {
  id: string;
  profile_image_url?: string | null;
  legal_name: string | null;
  dba: string | null;
  industry: string;
  city: string;
  state: string;
}

export interface ApiLatestMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ApiConversation {
  id: string;
  match_id: string;
  participant: ApiConversationParticipant;
  business: ApiConversationBusiness;
  latest_message: ApiLatestMessage | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ApiMessageCreate {
  content: string;
}

export interface ApiAiSuggestionRequest {
  instruction?: string;
}

export interface ApiAiSuggestionResponse {
  suggestion: string;
}

/* Frontend view models required by the Messages UI. */

export type MessageCategory =
  | "new"
  | "open"
  | "archived";

export interface MessageParticipant {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface MessageItem {
  id: string;
  sender: "current-user" | "participant";
  content: string;
  sentAt: string;
  read: boolean;
}

export interface MessageConversation {
  id: string;
  matchId: string;
  category: MessageCategory;

  participant: MessageParticipant;
  business: MatchBusinessDetails;

  preview: string;
  relativeTime: string;
  unreadCount: number;

  ndaRequired: boolean;
  ndaSigned: boolean;

  messages: MessageItem[];
}

export interface MessagesViewData {
  currentUser: MessageParticipant;
  conversations: MessageConversation[];
}