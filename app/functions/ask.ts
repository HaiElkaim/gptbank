import { Handler, HandlerEvent } from '@netlify/functions';
import { router, post } from 'itty-router';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';
import { moderate } from './lib/moderation';
import { search } from './lib/rag';
import { applyGuardrails } from './lib/guardrails';
import { getLLMResponseStream } from './lib/llm';
import { consumeToken } from './lib/cache';
import { logger, getPromptsDir } from './lib/utils';
import { AskRequestBody, ChatMessage } from './lib/types';

async function loadSystemPrompt(): Promise<string> {
    // A/B testing: 90% get v1, 10% get v2
    const promptFile = Math.random() < 0.9 ? 'system_v1.md' : 'system_v2_abtest.md';
    const filePath = path.join(getPromptsDir(), promptFile);
    return fs.readFile(filePath, 'utf-8');
}

const askHandler = async (request: Request) => {
  const ip = request.headers.get('x-nf-client-connection-ip') || '127.0.0.1';
  if (!consumeToken(ip)) {
    return new Response(JSON.stringify({ message: 'Rate limit exceeded' }), { status: 429 });
  }

  let body: AskRequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON body' }), { status: 400 });
  }

  const { question, history = [] } = body;

  if (!question || typeof question !== 'string') {
    return new Response(JSON.stringify({ message: 'Question is required' }), { status: 400 });
  }

  logger.info({ ip, question }, 'Received question');

  const moderationResult = moderate(question);
  if (!moderationResult.isAllowed) {
    return new Response(JSON.stringify({ message: moderationResult.reason }), { status: 400 });
  }

  const ragResults = await search(question);
  const { context, pass } = applyGuardrails(ragResults);

  let finalResponseStream: ReadableStream<Uint8Array>;

  if (!pass) {
    const noInfoResponse = 'Je ne dispose pas de cette information dans ma base de connaissances. Pour toute assistance, veuillez contacter notre support client.';
    const readable = new Readable();
    readable.push(noInfoResponse);
    readable.push(null);
    return new Response(readable, { status: 200 });
  } else {
    const systemPrompt = await loadSystemPrompt();
    const messages: ChatMessage[] = [
      { role: 'system', content: `${systemPrompt}\n\nCONTEXTE:\n${context}` },
      ...history,
      { role: 'user', content: question },
    ];

    try {
        finalResponseStream = await getLLMResponseStream(messages);
    } catch(e) {
        logger.error(e, 'LLM stream failed');
        return new Response(JSON.stringify({ message: 'Error communicating with LLM provider.' }), { status: 502 });
    }
  }

  return new Response(finalResponseStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

const r = router({ base: '/.netlify/functions/ask' });
r.post('*', askHandler);

export const handler: Handler = (event: HandlerEvent) => {
    const req = new Request(`http://${event.headers.host}${event.path}`, {
        method: event.httpMethod,
        headers: event.headers as HeadersInit,
        body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
    });
    return r.handle(req);
};
