import bm25 from 'wink-bm25-text-search';
import { RagResult } from './types';
import { getAllCsvRecords } from './csv';

const engine = new bm25();

const pipe = [
  (text: string) => text.toLowerCase(),
  (text: string) => text.replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''),
  (text: string) => text.replace(/\s{2,}/g, ' '),
];

engine.defineConfig({ fldWeights: { question: 1, answer: 0.5 } });
engine.setPipeline(pipe);

let isIndexed = false;

async function ensureIndex() {
  if (isIndexed) return;

  const docs = await getAllCsvRecords();
  docs.forEach((doc, i) => {
    // Use a combination of fields for indexing
    const combinedText = `${doc.question} ${doc.answer || ''}`;
    engine.addDoc(combinedText, i);
  });

  engine.consolidate();
  isIndexed = true;
}

function calculateFreshnessBoost(dateStr: string): number {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

  if (diffDays <= 60) {
    return 0.25 * (1 - diffDays / 60); // Linear decay
  }
  return 0;
}

export async function search(query: string, topK = 8): Promise<RagResult[]> {
  await ensureIndex();
  const allDocs = await getAllCsvRecords();

  const results = engine.search(query, topK);

  const rankedResults = results.map(([docIndex, score]: [number, number]) => {
    const doc = allDocs[docIndex as number];
    const freshnessBoost = calculateFreshnessBoost(doc.last_updated);
    const approvedBoost = doc.approved === 'true' ? 1.2 : 1.0;
    const finalScore = score * (1 + freshnessBoost) * approvedBoost;

    return {
      content: `Question: ${doc.question}\nAnswer: ${doc.answer}`,
      source: doc.source,
      last_updated: doc.last_updated,
      score: finalScore,
    };
  });

  // Re-sort by final score
  rankedResults.sort((a: RagResult, b: RagResult) => b.score - a.score);

  return rankedResults.slice(0, 5); // Return top 5 after re-ranking
}
