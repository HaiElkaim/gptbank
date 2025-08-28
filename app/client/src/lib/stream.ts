export async function streamResponse(
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  }
}
