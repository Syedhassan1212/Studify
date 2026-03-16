export async function extractTextFromBuffer({
  filename,
  buffer,
}: {
  filename: string;
  buffer: Buffer;
}) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text ?? "";
  }

  return buffer.toString("utf-8");
}
