import { embedGeminiText } from "@/lib/gemini";
import { supabaseServer } from "@/lib/supabase/server";

export type RetrievedChunk = {
  id: string;
  content: string;
  source_type: string;
  source_id: string;
  similarity: number;
};

export async function retrieveContext({
  query,
  topicId,
  matchCount = 6,
}: {
  query: string;
  topicId?: string | null;
  matchCount?: number;
}) {
  const embedding = await embedGeminiText(query);
  const supabase = await supabaseServer();

  const { data, error } = await supabase.rpc("match_study_chunks", {
    query_embedding: embedding,
    match_count: matchCount,
    topic_id: topicId ?? null,
  });

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  const chunks = (data ?? []) as RetrievedChunk[];
  const context = chunks.map((chunk) => chunk.content).join("\n\n");

  return { context, chunks };
}
