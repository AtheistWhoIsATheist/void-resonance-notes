import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_ROLES = new Set(["user", "assistant"]);
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_SYSTEM_PROMPT_CHARS = 30_000;
const MAX_CONTEXT_SECTION_CHARS = 18_000;
const MAX_CORPUS_BRIEF_CHARS = 7_000;
const MAX_RETRIEVAL_CHUNKS = 10;
const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "being",
  "between",
  "could",
  "from",
  "have",
  "into",
  "more",
  "over",
  "should",
  "that",
  "their",
  "there",
  "these",
  "this",
  "through",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "your",
]);

type IncomingMessage = {
  role?: string;
  content?: string;
};

type SourceFileRow = {
  id: string;
  original_path?: string | null;
  original_filename?: string | null;
  title_guess?: string | null;
  status?: string | null;
  review_flags?: unknown;
};

type CanonicalDocumentRow = {
  id: string;
  title?: string | null;
  canonical_path?: string | null;
  status?: string | null;
  word_count?: number | null;
  heading_count?: number | null;
  link_count?: number | null;
  source_file_id?: string | null;
};

type DocumentChunkRow = {
  canonical_document_id?: string | null;
  ordinal?: number | null;
  heading_path?: string[] | null;
  content?: string | null;
  token_estimate?: number | null;
};

const normalizeMessages = (messages: unknown): Array<{ role: string; content: string }> => {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((item): item is IncomingMessage => Boolean(item && typeof item === "object"))
    .map((item) => ({
      role: ALLOWED_ROLES.has(item.role ?? "") ? (item.role as string) : "user",
      content: typeof item.content === "string" ? item.content.trim().slice(0, MAX_MESSAGE_CHARS) : "",
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_MESSAGES);
};

const truncate = (value: string, maxChars: number) =>
  value.length <= maxChars ? value : `${value.slice(0, maxChars)}\n...[truncated]`;

const appendSystemSection = (systemPrompt: string, heading: string, body: string) => {
  if (!body.trim()) return systemPrompt;
  const next = `${systemPrompt}\n\n## ${heading}\n${body.trim()}`;
  return truncate(next, MAX_SYSTEM_PROMPT_CHARS);
};

const latestUserContent = (messages: Array<{ role: string; content: string }>) =>
  [...messages].reverse().find((message) => message.role === "user")?.content || "";

const queryTerms = (query: string) =>
  Array.from(
    new Set(
      query
        .toLowerCase()
        .match(/[a-z0-9][a-z0-9'-]{3,}/g)
        ?.filter((term) => !STOP_WORDS.has(term)) || [],
    ),
  ).slice(0, 32);

const scoreChunk = (chunk: DocumentChunkRow, doc: CanonicalDocumentRow | undefined, terms: string[]) => {
  if (!terms.length) return 0;
  const haystack = `${doc?.title || ""} ${doc?.canonical_path || ""} ${(chunk.heading_path || []).join(" ")} ${chunk.content || ""}`.toLowerCase();
  return terms.reduce((score, term) => {
    const hits = haystack.split(term).length - 1;
    return score + hits;
  }, 0);
};

const formatJsonish = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      messages,
      model = 'google/gemini-2.5-flash',
      includeContext = false,
      systemPrompt: customSystemPrompt,
      corpusBrief,
      activeBatchId,
    } = await req.json();
    const safeMessages = normalizeMessages(messages);
    const latestQuery = latestUserContent(safeMessages);

    if (!safeMessages.length) {
      return new Response(
        JSON.stringify({ error: 'No valid messages were provided.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt with optional context
    let systemPrompt = (typeof customSystemPrompt === 'string' ? customSystemPrompt : '') ||
      'You are a philosophical AI assistant specializing in nihilism, existentialism, and void-resonance theory. Provide thoughtful, nuanced insights.';
    systemPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT_CHARS);
    systemPrompt = appendSystemSection(
      systemPrompt,
      "Nihiltheism Corpus Discipline",
      [
        "When corpus context is provided, treat it as the user's living second brain.",
        "Separate source-grounded claims from AI-inferred metadata and speculative synthesis.",
        "Use review flags, duplicate signals, chunks, and provenance as epistemic constraints.",
        "Clarify, densify, and unravel philosophical material without turning Nihiltheism into a closed doctrine.",
      ].join("\n"),
    );

    if (typeof corpusBrief === "string" && corpusBrief.trim()) {
      systemPrompt = appendSystemSection(
        systemPrompt,
        "Active Corpus Intake Brief",
        truncate(corpusBrief.trim(), MAX_CORPUS_BRIEF_CHARS),
      );
    }
    
    if (includeContext) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.4');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && !userError) {
        console.log('Fetching user context for AI chat...');
        
        // Fetch recent notes for context
        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select('title, content, detected_concepts, void_resonance_score, custom_metadata')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (!notesError && notes && notes.length > 0) {
          const notesContext = notes.map(note => {
            const metadata = (note.custom_metadata || {}) as Record<string, unknown>;
            const sourcePath = typeof metadata.original_path === "string" ? ` source=${metadata.original_path}` : "";
            const reviewSignals = metadata.nihiltheism_analysis
              ? ` analysis=${truncate(JSON.stringify(metadata.nihiltheism_analysis), 260)}`
              : "";
            return `- ${note.title}: ${truncate(note.content || "", 260)} (Concepts: ${(note.detected_concepts || []).join(', ')}, Resonance: ${note.void_resonance_score || 'N/A'}${sourcePath}${reviewSignals})`;
          }
          ).join('\n');
          
          systemPrompt = appendSystemSection(
            systemPrompt,
            "Recent Second-Brain Notes",
            `${notesContext}\n\nUse these notes as personalized philosophical memory, while clearly separating source claims from inference.`,
          );
        }

        // Fetch user's tags for additional context
        const { data: tags, error: tagsError } = await supabase
          .from('tags')
          .select('name, category')
          .eq('user_id', user.id)
          .limit(20);

        if (!tagsError && tags && tags.length > 0) {
          const tagsContext = tags.map(tag => tag.name).join(', ');
          systemPrompt = appendSystemSection(systemPrompt, "User Tags", tagsContext);
        }

        const { data: batches, error: batchesError } = await supabase
          .from('ingestion_batches')
          .select('id, source_label, import_mode, status, file_count, imported_count, duplicate_count, quarantined_count, error_count, review_count, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!batchesError && batches && batches.length > 0) {
          const batchContext = batches.map(batch =>
            `- ${batch.source_label || batch.import_mode}: ${batch.status}, ${batch.imported_count}/${batch.file_count} imported, ${batch.duplicate_count} duplicates, ${batch.quarantined_count} quarantined, ${batch.review_count} review items`
          ).join('\n');

          systemPrompt = appendSystemSection(systemPrompt, "Recent Corpus Intake Batches", batchContext);
        }

        const { data: reviewItems, error: reviewError } = await supabase
          .from('import_review_items')
          .select('review_type, severity, title, details, created_at')
          .eq('user_id', user.id)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(8);

        if (!reviewError && reviewItems && reviewItems.length > 0) {
          const reviewContext = reviewItems.map(item =>
            `- [${item.severity}] ${item.review_type}: ${item.title} ${JSON.stringify(item.details || {}).slice(0, 220)}`
          ).join('\n');

          systemPrompt = appendSystemSection(
            systemPrompt,
            "Open Corpus Review Signals",
            `${reviewContext}\n\nUse these review signals to separate source-grounded claims from inferred or risky claims.`,
          );
        }

        const { data: canonicalDocs, error: docsError } = await supabase
          .from('canonical_documents')
          .select('title, canonical_path, status, word_count, heading_count, link_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (!docsError && canonicalDocs && canonicalDocs.length > 0) {
          const docsContext = canonicalDocs.map(doc =>
            `- ${doc.title} (${doc.status}) path=${doc.canonical_path}; words=${doc.word_count}; headings=${doc.heading_count}; links=${doc.link_count}`
          ).join('\n');

          systemPrompt = appendSystemSection(systemPrompt, "Recent Canonical Corpus Documents", docsContext);
        }

        if (typeof activeBatchId === "string" && activeBatchId.trim()) {
          const { data: sourceFiles, error: sourceError } = await supabase
            .from("source_files")
            .select("id, original_path, original_filename, title_guess, status, review_flags")
            .eq("user_id", user.id)
            .eq("batch_id", activeBatchId)
            .limit(80);

          if (!sourceError && sourceFiles && sourceFiles.length > 0) {
            const typedSources = sourceFiles as SourceFileRow[];
            const sourceIds = typedSources.map((source) => source.id);
            const sourceById = new Map(typedSources.map((source) => [source.id, source]));

            const sourceContext = typedSources
              .slice(0, 20)
              .map((source) => {
                const path = source.original_path || source.original_filename || source.id;
                const flags = formatJsonish(source.review_flags);
                return `- ${source.title_guess || source.original_filename || "Untitled"}: ${source.status || "unknown"} path=${path}${flags ? ` flags=${flags}` : ""}`;
              })
              .join("\n");
            systemPrompt = appendSystemSection(systemPrompt, "Active Ingestion Source Files", sourceContext);

            const { data: activeDocs, error: activeDocsError } = await supabase
              .from("canonical_documents")
              .select("id, title, canonical_path, status, word_count, heading_count, link_count, source_file_id")
              .eq("user_id", user.id)
              .in("source_file_id", sourceIds)
              .limit(50);

            if (!activeDocsError && activeDocs && activeDocs.length > 0) {
              const typedDocs = activeDocs as CanonicalDocumentRow[];
              const docById = new Map(typedDocs.map((doc) => [doc.id, doc]));
              const docIds = typedDocs.map((doc) => doc.id);
              const terms = queryTerms(latestQuery);

              const { data: chunks, error: chunkError } = await supabase
                .from("document_chunks")
                .select("canonical_document_id, ordinal, heading_path, content, token_estimate")
                .eq("user_id", user.id)
                .in("canonical_document_id", docIds)
                .order("ordinal", { ascending: true })
                .limit(120);

              if (!chunkError && chunks && chunks.length > 0) {
                const rankedChunks = (chunks as DocumentChunkRow[])
                  .map((chunk) => ({
                    chunk,
                    doc: chunk.canonical_document_id ? docById.get(chunk.canonical_document_id) : undefined,
                    score: scoreChunk(chunk, chunk.canonical_document_id ? docById.get(chunk.canonical_document_id) : undefined, terms),
                  }))
                  .sort((a, b) => b.score - a.score || (a.chunk.ordinal || 0) - (b.chunk.ordinal || 0))
                  .slice(0, MAX_RETRIEVAL_CHUNKS);

                const chunkContext = rankedChunks
                  .map(({ chunk, doc, score }, index) => {
                    const source = doc?.source_file_id ? sourceById.get(doc.source_file_id) : undefined;
                    const heading = (chunk.heading_path || []).join(" > ") || "root";
                    const sourcePath = source?.original_path || doc?.canonical_path || "unknown source";
                    return [
                      `Source ${index + 1}: ${doc?.title || "Untitled"} | ${sourcePath} | heading=${heading} | relevance=${score}`,
                      truncate(chunk.content || "", 1_200),
                    ].join("\n");
                  })
                  .join("\n\n");

                systemPrompt = appendSystemSection(
                  systemPrompt,
                  "Active Corpus Retrieval Chunks",
                  truncate(chunkContext, MAX_CONTEXT_SECTION_CHARS),
                );
              }
            }
          }
        }
      }
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...safeMessages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
