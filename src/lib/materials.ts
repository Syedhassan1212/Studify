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
    const raw = result.text ?? "";
    return cleanExtractedText(raw);
  }

  return buffer.toString("utf-8");
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/```+/g, "")
    .replace(/==+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}
