import type { ChatRequestPayload, ChatResponsePayload } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

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

export async function sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
