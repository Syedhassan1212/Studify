export function chunkText(
  text: string,
  {
    chunkSize = 1200,
    overlap = 200,
  }: { chunkSize?: number; overlap?: number } = {},
) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push(normalized.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}
