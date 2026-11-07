export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  daily_message_count: number;
  remaining_messages: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ConversationSummary {
  id: string;
  title: string;
  is_pinned: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}
