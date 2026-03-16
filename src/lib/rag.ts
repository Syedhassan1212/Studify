import { embedGeminiText } from "@/lib/gemini";
import { supabaseServer } from "@/lib/supabase/server";

export type RetrievedChunk = {
  id: string;
  content: string;
  source_type: string;
  source_id: string;
  similarity: number;
  topic_id: string;
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
    filter_topic_id: topicId ?? null,
  });

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  let chunks = (data ?? []) as RetrievedChunk[];
  if (topicId) {
    const filtered = chunks.filter((chunk) => chunk.topic_id === topicId);
    if (chunks.length > 0 && filtered.length === 0) {
      console.warn(
        "RAG returned chunks outside the requested topic. Verify match_study_chunks filter.",
      );
    }
    chunks = filtered;
  }
  const context = chunks.map((chunk) => chunk.content).join("\n\n");

  return { context, chunks };
}
