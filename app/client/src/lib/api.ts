import { MessageProps } from '@/components/Message';

export async function askQuestion(
  question: string,
  history: MessageProps[]
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, history }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Failed to fetch');
  }

  if (!response.body) {
    throw new Error('Response body is empty');
  }

  return response.body;
}
