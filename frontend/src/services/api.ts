import type { ChatRequestPayload, ChatResponsePayload } from '../types/chat';
import type { User, AuthResponse, ConversationSummary } from '../types/auth';
import type { AgentDefinition } from '../types/agent';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// Token helper methods
export function getStoredToken(): string | null {
  return localStorage.getItem('mello_auth_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('mello_auth_token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('mello_auth_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Agents API
export async function fetchAgents(): Promise<AgentDefinition[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/agents`);
    if (!res.ok) {
      throw new ApiError('Failed to fetch agents list', res.status);
    }
    return await res.json();
  } catch (err: any) {
    console.error('Error fetching agents:', err);
    return [];
  }
}

// Health Check
export async function checkBackendHealth(): Promise<{ status: string; app: string; version: string; llm_provider: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new ApiError(`Health check failed: ${res.statusText}`, res.status);
    }
    return await res.json();
  } catch (err: any) {
    throw new ApiError(err.message || 'Cannot reach Mello AI backend server.');
  }
}

// Authentication
export async function signupUser(email: string, password: string, fullName?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.detail || 'Failed to sign up.', res.status);
  }

  const data: AuthResponse = await res.json();
  setStoredToken(data.access_token);
  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.detail || 'Invalid email or password.', res.status);
  }

  const data: AuthResponse = await res.json();
  setStoredToken(data.access_token);
  return data;
}

export async function loginWithGoogle(credential: string, email?: string, fullName?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, email, full_name: fullName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.detail || 'Google authentication failed.', res.status);
  }

  const data: AuthResponse = await res.json();
  setStoredToken(data.access_token);
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        removeStoredToken();
      }
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

// Conversations Management
export async function listConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new ApiError('Failed to fetch conversations.', res.status);
  }
  return await res.json();
}

export async function getConversation(conversationId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new ApiError('Conversation not found.', res.status);
  }
  return await res.json();
}

export async function updateConversation(conversationId: string, updates: { title?: string; is_pinned?: boolean }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new ApiError('Failed to update conversation.', res.status);
  }
  return await res.json();
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new ApiError('Failed to delete conversation.', res.status);
  }
}

export async function toggleSaveMessage(conversationId: string, messageId: string): Promise<{ is_saved: boolean }> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/${messageId}/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new ApiError('Failed to save message.', res.status);
  }
  return await res.json();
}

// Chat API
export async function sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const detail = errData?.detail || `Server error (${res.status})`;
      throw new ApiError(typeof detail === 'string' ? detail : JSON.stringify(detail), res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Mello AI server is currently unreachable. Please make sure the backend is running on port 8000.'
    );
  }
}
