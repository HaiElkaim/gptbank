import { fetch } from 'undici';
import { ChatMessage } from './types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.PRIMARY_MODEL || 'anthropic/claude-3.5-sonnet';
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || 'openai/gpt-4o-mini';
const HTTP_REFERER = process.env.HTTP_REFERER;
const X_TITLE = process.env.X_TITLE;

async function getCompletion(model: string, messages: ChatMessage[], stream: boolean) {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': HTTP_REFERER || '',
      'X-Title': X_TITLE || '',
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
      temperature: 0.2,
    }),
  });
}

export async function getLLMResponseStream(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  let response;
  try {
    response = await getCompletion(PRIMARY_MODEL, messages, true);
    if (!response.ok) {
      throw new Error(`Primary model failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Primary model failed, trying fallback:', error);
    response = await getCompletion(FALLBACK_MODEL, messages, true);
    if (!response.ok) {
      throw new Error(`Fallback model also failed with status: ${response.status}`);
    }
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body;
}
