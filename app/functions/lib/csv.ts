import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { getDataDir } from './utils';
import { CsvRecord } from './types';

const CSV_FILES = ['faq.csv', 'fees.csv', 'products.csv', 'glossary.csv'];

let allCsvRecords: CsvRecord[] | null = null;

async function loadAndParseCsv(fileName: string): Promise<CsvRecord[]> {
  const filePath = path.join(getDataDir(), fileName);
  const content = await fs.readFile(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
  // Add source from filename
  return records.map((r: any) => ({ ...r, source: r.source || path.parse(fileName).name }));
}

export async function getAllCsvRecords(): Promise<CsvRecord[]> {
  if (allCsvRecords) {
    return allCsvRecords;
  }

  const promises = CSV_FILES.map(loadAndParseCsv);
  const results = await Promise.all(promises);
  allCsvRecords = results.flat();
  return allCsvRecords;
}
