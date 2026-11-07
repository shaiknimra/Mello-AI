export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: string;
  status?: 'sending' | 'completed' | 'error';
  error?: string;
}

export type ResponseLength = 'short' | 'medium' | 'detailed';
export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';
export type Personality = 'Friendly' | 'Professional' | 'Academic';

export interface ChatSettings {
  responseLength: ResponseLength;
  explanationLevel: ExplanationLevel;
  personality: Personality;
}

export interface ChatRequestPayload {
  message: string;
  conversation_id?: string;
  agent_id?: string;
  response_length: ResponseLength;
  explanation_level: ExplanationLevel;
  personality: Personality;
}

export interface ChatResponsePayload {
  conversation_id: string;
  message_id: string;
  role: string;
  content: string;
  agent_id: string;
  agent_name: string;
  status: 'completed' | 'error';
  error?: string;
  created_at: string;
}
