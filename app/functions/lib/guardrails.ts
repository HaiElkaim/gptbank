import { RagResult } from './types';

const MIN_SCORE_THRESHOLD = 0.1; // Adjust this threshold based on BM25 score distribution

export function applyGuardrails(results: RagResult[]): { context: string; pass: boolean } {
  const reliableResults = results.filter(r => r.score >= MIN_SCORE_THRESHOLD);

  if (reliableResults.length === 0) {
    return {
      context: '',
      pass: false,
    };
  }

  const context = reliableResults
    .map(r => `Extrait de ${r.source} (màj: ${r.last_updated}):\n${r.content}`)
    .join('\n\n---\n\n');

  return {
    context,
    pass: true,
  };
}
