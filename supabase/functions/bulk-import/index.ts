import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACCEPTED_EXTENSIONS = new Set(["md", "markdown", "txt", "text", "rst", "csv", "json"]);
const MAX_CHUNK_CHARS = 4_500;
const MAX_EXISTING_NOTES_FOR_AI = 50;

type JsonRecord = Record<string, unknown>;

interface ImportedNote {
  title?: string;
  content: string;
  filename?: string;
  originalPath?: string;
  path?: string;
  mimeType?: string;
  size?: number;
  lastModified?: number | string;
  sha256?: string;
  importSource?: string;
  tags?: string[];
  aliases?: string[];
  wikiLinks?: string[];
}

interface ImportOptions {
  preserveDuplicates?: boolean;
  runAiAnalysis?: boolean;
  generateEmbeddings?: boolean;
  createReviewItems?: boolean;
}

interface Heading {
  level: number;
  text: string;
  line: number;
}

interface LinkRecord {
  label?: string;
  target: string;
  raw: string;
}

interface ParsedFrontmatter {
  frontmatter: JsonRecord;
  body: string;
  malformed: boolean;
}

interface ChunkRecord {
  chunkId: string;
  headingPath: string[];
  ordinal: number;
  content: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
}

interface AnalysisResult {
  concepts: string[];
  voidResonanceScore: number;
  tags: Array<{ name: string; category?: string; color?: string }>;
  collectionId: string | null;
  relatedNoteIds: string[];
  reasoning?: string;
  philosophicalTensions: string[];
  keyQuestions: string[];
  sourceAnchors: string[];
  riskFlags: string[];
  confidence: number;
  aiAvailable: boolean;
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const unique = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const normalizeLineEndings = (value: string) => value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const stripBom = (value: string) => value.replace(/^\uFEFF/, "");

const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "untitled";
};

const getExtension = (filename: string) => {
  const match = filename.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] || "";
};

const basenameWithoutExtension = (path: string) =>
  path.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, "") || "Untitled";

const yamlScalar = (value: unknown) => JSON.stringify(String(value ?? ""));

const yamlInline = (value: unknown) => JSON.stringify(value ?? null);

const estimateTokens = (content: string) => Math.max(1, Math.ceil(content.length / 4));

const countWords = (content: string) => (content.match(/\b[\w'-]+\b/g) || []).length;

const sha256Hex = async (value: string) => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const parseFrontmatterValue = (rawValue: string): unknown => {
  const value = rawValue.trim();
  if (!value) return "";
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }
  return value.replace(/^['"]|['"]$/g, "");
};

const parseFrontmatter = (content: string): ParsedFrontmatter => {
  if (!content.startsWith("---")) {
    return { frontmatter: {}, body: content, malformed: false };
  }

  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: {}, body: content, malformed: true };
  }

  const frontmatter: JsonRecord = {};
  const body = content.slice(match[0].length);
  const lines = match[1].split("\n");
  let currentListKey: string | null = null;

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (currentListKey && listItem) {
      const current = frontmatter[currentListKey];
      const list = Array.isArray(current) ? current : [];
      frontmatter[currentListKey] = [...list, listItem[1].trim().replace(/^['"]|['"]$/g, "")];
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) {
      currentListKey = null;
      continue;
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (!key) {
      currentListKey = null;
      continue;
    }

    if (!rawValue) {
      frontmatter[key] = [];
      currentListKey = key;
      continue;
    }

    frontmatter[key] = parseFrontmatterValue(rawValue);
    currentListKey = null;
  }

  return { frontmatter, body, malformed: false };
};

const frontmatterList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const extractTags = (frontmatter: JsonRecord, content: string, provided: string[] = []) => {
  const hashtags = Array.from(content.matchAll(/(^|\s)#([A-Za-z0-9/_-]+)/g)).map((match) => match[2]);
  const frontmatterTags = frontmatterList(frontmatter.tags).map((tag) => tag.replace(/^#/, ""));
  return unique([...provided, ...frontmatterTags, ...hashtags]);
};

const extractAliases = (frontmatter: JsonRecord, provided: string[] = []) =>
  unique([...provided, ...frontmatterList(frontmatter.aliases), ...frontmatterList(frontmatter.alias)]);

const extractWikiLinks = (content: string, provided: string[] = []): LinkRecord[] => {
  const records = Array.from(content.matchAll(/!?\[\[([^[\]]+)\]\]/g)).map((match) => {
    const target = match[1].split("|")[0].split("#")[0].trim();
    return { target, raw: match[0] };
  });

  for (const target of provided) {
    records.push({ target, raw: `[[${target}]]` });
  }

  const seen = new Set<string>();
  return records.filter((record) => {
    const key = record.target.toLowerCase();
    if (!record.target || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const extractMarkdownLinks = (content: string): LinkRecord[] =>
  Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map((match) => ({
    label: match[1],
    target: match[2],
    raw: match[0],
  }));

const extractHeadings = (content: string): Heading[] =>
  content.split("\n").flatMap((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) return [];
    return [{ level: match[1].length, text: match[2].trim(), line: index + 1 }];
  });

const resolveTitle = (note: ImportedNote, frontmatter: JsonRecord, body: string) => {
  if (note.title?.trim()) return note.title.trim();
  if (typeof frontmatter.title === "string" && frontmatter.title.trim()) return frontmatter.title.trim();

  const firstHeading = body.split("\n").find((line) => line.trim().startsWith("# "));
  if (firstHeading) return firstHeading.replace(/^#\s+/, "").trim();

  const filename = note.filename || note.originalPath || note.path || "Untitled";
  const basename = basenameWithoutExtension(filename);
  if (basename && basename !== "Untitled") return basename;

  const firstMeaningfulLine = body
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstMeaningfulLine?.slice(0, 90) || "Untitled";
};

const buildCanonicalMarkdown = (input: {
  docId: string;
  title: string;
  aliases: string[];
  sourceId: string;
  sourcePath: string;
  sourceHash: string;
  contentType: string;
  status: string;
  tags: string[];
  batchId: string;
  body: string;
}) => {
  const hasH1 = input.body.trimStart().startsWith("# ");
  const body = hasH1 ? input.body.trim() : `# ${input.title}\n\n${input.body.trim()}`;

  return `---\nid: ${yamlScalar(input.docId)}\ntitle: ${yamlScalar(input.title)}\naliases: ${yamlInline(input.aliases)}\nsource_id: ${yamlScalar(input.sourceId)}\nsource_path: ${yamlScalar(input.sourcePath)}\nsource_hash: ${yamlScalar(input.sourceHash)}\ncontent_type: ${yamlScalar(input.contentType)}\nstatus: ${yamlScalar(input.status)}\ntags: ${yamlInline(input.tags)}\ncollections: []\nprovenance:\n  origin: imported\n  import_batch_id: ${yamlScalar(input.batchId)}\n---\n\n${body}\n`;
};

const splitOversizedSection = (content: string): string[] => {
  if (content.length <= MAX_CHUNK_CHARS) return [content];

  const paragraphs = content.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > MAX_CHUNK_CHARS && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
};

const createChunks = (body: string, docId: string): ChunkRecord[] => {
  const lines = body.split("\n");
  const sections: Array<{ headingPath: string[]; content: string }> = [];
  const headingStack: Array<{ level: number; text: string }> = [];
  let currentLines: string[] = [];
  let currentPath: string[] = [];

  const flush = () => {
    const content = currentLines.join("\n").trim();
    if (content) sections.push({ headingPath: currentPath, content });
    currentLines = [];
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading && currentLines.length > 0) flush();

    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      while (headingStack.length && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }
      headingStack.push({ level, text });
      currentPath = headingStack.map((item) => item.text);
    }

    currentLines.push(line);
  }

  flush();

  const baseSections = sections.length > 0 ? sections : [{ headingPath: [], content: body.trim() }];
  const chunks: ChunkRecord[] = [];
  let searchOffset = 0;

  for (const section of baseSections) {
    for (const piece of splitOversizedSection(section.content)) {
      const startOffset = Math.max(0, body.indexOf(piece, searchOffset));
      const endOffset = startOffset + piece.length;
      searchOffset = endOffset;
      const ordinal = chunks.length + 1;
      const headingSlug = slugify(section.headingPath.join("-") || "root");

      chunks.push({
        chunkId: `${docId}:chunk:${String(ordinal).padStart(4, "0")}:${headingSlug}`,
        headingPath: section.headingPath,
        ordinal,
        content: piece,
        startOffset,
        endOffset,
        tokenEstimate: estimateTokens(piece),
      });
    }
  }

  return chunks;
};

const sourceStatusForFlags = (flags: string[]) => (flags.length > 0 ? "needs_review" : "imported");

const reviewRow = (input: {
  userId: string;
  batchId: string;
  sourceFileId?: string;
  canonicalDocumentId?: string;
  reviewType: string;
  severity?: "low" | "medium" | "high";
  title: string;
  details?: JsonRecord;
}) => ({
  user_id: input.userId,
  batch_id: input.batchId,
  source_file_id: input.sourceFileId ?? null,
  canonical_document_id: input.canonicalDocumentId ?? null,
  review_type: input.reviewType,
  severity: input.severity ?? "medium",
  title: input.title,
  details: input.details ?? {},
});

const pipeSafe = (value: unknown) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

const createReportMarkdown = (batch: {
  id: string;
  sourceLabel?: string;
  importMode: string;
  fileCount: number;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  quarantinedCount: number;
  reviewCount: number;
  files: Array<Record<string, unknown>>;
}) => {
  const rows = batch.files
    .map((file) =>
      `| ${pipeSafe(file.status)} | ${pipeSafe(file.title)} | ${pipeSafe(file.path)} | ${pipeSafe(file.sha256)} | ${pipeSafe(file.docId)} |`,
    )
    .join("\n");

  return `# Import Report\n\nBatch: \`${batch.id}\`\nSource: ${batch.sourceLabel || "unspecified"}\nMode: ${batch.importMode}\n\n## Summary\n\n| Metric | Count |\n| --- | ---: |\n| Files scanned | ${batch.fileCount} |\n| Imported | ${batch.importedCount} |\n| Duplicates | ${batch.duplicateCount} |\n| Quarantined | ${batch.quarantinedCount} |\n| Errors | ${batch.errorCount} |\n| Review items | ${batch.reviewCount} |\n\n## Files\n\n| Status | Title | Path | Hash | Document ID |\n| --- | --- | --- | --- | --- |\n${rows || "| none | none | none | none | none |"}\n`;
};

const fallbackConcepts = (content: string, tags: string[]) => {
  const terms = [
    "void",
    "nothingness",
    "nihilism",
    "nihiltheism",
    "despair",
    "meaninglessness",
    "transcendence",
    "unknowing",
    "paradox",
    "mysticism",
    "suffering",
  ];
  const lower = content.toLowerCase();
  return unique([...tags, ...terms.filter((term) => lower.includes(term))]).slice(0, 12);
};

const fallbackResonanceScore = (content: string) => {
  const lower = content.toLowerCase();
  const terms = ["void", "nothingness", "despair", "meaninglessness", "transcendence", "unknowing", "paradox"];
  const hits = terms.filter((term) => lower.includes(term)).length;
  return Math.min(1, hits / terms.length);
};

async function analyzeNoteWithAI(
  content: string,
  title: string,
  existingNotes: any[],
  existingTags: any[],
  existingCollections: any[],
  prefs: any,
  extractedTags: string[],
  runAiAnalysis: boolean,
): Promise<AnalysisResult> {
  const fallback = (): AnalysisResult => ({
    concepts: fallbackConcepts(content, extractedTags),
    voidResonanceScore: fallbackResonanceScore(content),
    tags: extractedTags.map((name) => ({ name, category: "source", color: "#64748b" })),
    collectionId: null,
    relatedNoteIds: [],
    philosophicalTensions: [],
    keyQuestions: [],
    sourceAnchors: [],
    riskFlags: [],
    confidence: 0.35,
    aiAvailable: false,
  });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!runAiAnalysis || !LOVABLE_API_KEY) return fallback();

  const systemPrompt = `You are a world-class Nihiltheism philosopher and corpus architect. Analyze the provided note for a living second-brain database. Return only valid JSON with this shape:
{
  "concepts": ["concept1", "concept2"],
  "voidResonanceScore": 0.0,
  "tags": [{"name": "tag name", "category": "philosophy|concept|tradition|source", "color": "#64748b"}],
  "collectionSuggestion": "collection name or null",
  "relatedNoteIds": ["note-id-1", "note-id-2"],
  "philosophicalTensions": ["source-grounded tension or unresolved dialectic"],
  "keyQuestions": ["question the agent should pursue next"],
  "sourceAnchors": ["short source-grounded phrase or heading from the note"],
  "riskFlags": ["ambiguity, missing provenance, overreach, duplicate, or interpretive risk"],
  "confidence": 0.0,
  "reasoning": "brief explanation"
}

Keep voidResonanceScore between 0 and 1.
Keep confidence between 0 and 1.
Never invent relatedNoteIds; choose only IDs from the supplied existing-note list.
Prefer existing tags where they fit.
Separate source-grounded claims from AI-inferred labels.
Do not force closure: preserve apophatic uncertainty and unresolved tensions.`;

  const notesContext = existingNotes
    .slice(0, MAX_EXISTING_NOTES_FOR_AI)
    .map((note) => `ID: ${note.id}, Title: ${note.title}, Concepts: ${JSON.stringify(note.detected_concepts || [])}`)
    .join("\n");

  const userPrompt = `Existing tags: ${existingTags.map((tag) => tag.name).join(", ")}
Existing collections: ${existingCollections.map((collection) => `${collection.name} (${collection.description || ""})`).join("; ")}

Analyze this note:
Title: ${title}
Content:
${content.slice(0, 24_000)}

Existing notes for backlink analysis:
${notesContext}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: prefs?.default_model || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback();

    const analysis = JSON.parse(jsonMatch[0]);
    const allowedIds = new Set(existingNotes.map((note) => note.id));
    const collectionSuggestion = typeof analysis.collectionSuggestion === "string" ? analysis.collectionSuggestion : "";
    const matchingCollection = collectionSuggestion
      ? existingCollections.find((collection) => collection.name.toLowerCase() === collectionSuggestion.toLowerCase())
      : null;

    const aiTags = Array.isArray(analysis.tags)
      ? analysis.tags
          .filter((tag: any) => tag?.name)
          .map((tag: any) => ({
            name: String(tag.name),
            category: String(tag.category || "concept"),
            color: String(tag.color || "#64748b"),
          }))
      : [];

    return {
      concepts: unique([...(Array.isArray(analysis.concepts) ? analysis.concepts.map(String) : []), ...fallbackConcepts(content, [])]).slice(0, 16),
      voidResonanceScore: Math.max(0, Math.min(1, Number(analysis.voidResonanceScore) || fallbackResonanceScore(content))),
      tags: [...extractedTags.map((name) => ({ name, category: "source", color: "#64748b" })), ...aiTags],
      collectionId: matchingCollection?.id || null,
      relatedNoteIds: Array.isArray(analysis.relatedNoteIds)
        ? unique(analysis.relatedNoteIds.map(String)).filter((id) => allowedIds.has(id)).slice(0, 20)
        : [],
      philosophicalTensions: Array.isArray(analysis.philosophicalTensions)
        ? unique(analysis.philosophicalTensions.map(String)).slice(0, 12)
        : [],
      keyQuestions: Array.isArray(analysis.keyQuestions)
        ? unique(analysis.keyQuestions.map(String)).slice(0, 12)
        : [],
      sourceAnchors: Array.isArray(analysis.sourceAnchors)
        ? unique(analysis.sourceAnchors.map(String)).slice(0, 10)
        : [],
      riskFlags: Array.isArray(analysis.riskFlags)
        ? unique(analysis.riskFlags.map(String)).slice(0, 12)
        : [],
      confidence: Math.max(0, Math.min(1, Number(analysis.confidence) || 0.5)),
      reasoning: typeof analysis.reasoning === "string" ? analysis.reasoning : undefined,
      aiAvailable: true,
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return fallback();
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let batchId: string | null = null;
  let supabaseClient: ReturnType<typeof createClient> | null = null;
  let userId: string | null = null;

  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader) return jsonResponse({ error: "Missing authorization header" }, 401);

    supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized", details: authError?.message }, 401);
    }

    userId = user.id;
    const payload = await req.json();
    const notes = Array.isArray(payload.notes) ? (payload.notes as ImportedNote[]) : [];
    const options: ImportOptions = payload.options || {};
    const importMode = String(payload.importMode || "files");
    const sourceLabel = typeof payload.sourceLabel === "string" ? payload.sourceLabel : null;

    if (notes.length === 0) return jsonResponse({ error: "No notes provided" }, 400);

    const { data: batch, error: batchError } = await supabaseClient
      .from("ingestion_batches")
      .insert({
        user_id: user.id,
        source_label: sourceLabel,
        import_mode: importMode,
        status: "processing",
        file_count: notes.length,
      })
      .select("id")
      .single();

    if (batchError || !batch) throw batchError || new Error("Failed to create ingestion batch");
    batchId = batch.id;
    if (!batchId) throw new Error("Failed to resolve ingestion batch id");

    const { data: prefs } = await supabaseClient
      .from("user_preferences")
      .select("preferred_ai_provider, default_model, openai_api_key, anthropic_api_key")
      .eq("user_id", user.id)
      .maybeSingle();

    const [notesRes, tagsRes, collectionsRes, sourcesRes] = await Promise.all([
      supabaseClient.from("notes").select("id, title, content, detected_concepts, custom_metadata").eq("user_id", user.id),
      supabaseClient.from("tags").select("id, name, category, color").eq("user_id", user.id),
      supabaseClient.from("collections").select("id, name, description").eq("user_id", user.id),
      supabaseClient.from("source_files").select("id, sha256, normalized_sha256, original_path, canonical_note_id, status").eq("user_id", user.id),
    ]);

    if (sourcesRes.error) throw sourcesRes.error;

    const existingNotes = notesRes.data || [];
    const existingTags = tagsRes.data || [];
    const existingCollections = collectionsRes.data || [];
    const existingSources = sourcesRes.data || [];
    const knownHashes = new Map<string, string>();
    const knownNormalizedHashes = new Map<string, string>();

    for (const source of existingSources) {
      if (source.sha256) knownHashes.set(source.sha256, source.id);
      if (source.normalized_sha256) knownNormalizedHashes.set(source.normalized_sha256, source.id);
    }

    const processedNotes: Array<Record<string, unknown>> = [];
    const allReviewRows: Array<Record<string, unknown>> = [];

    for (const rawNote of notes) {
      const filename = rawNote.filename || rawNote.originalPath || rawNote.path || "untitled.md";
      const originalPath = rawNote.originalPath || rawNote.path || filename;
      const extension = getExtension(filename);
      const rawContent = stripBom(normalizeLineEndings(String(rawNote.content || "")));
      const sourceHash = rawNote.sha256 || (await sha256Hex(rawContent));
      const normalizedContent = normalizeLineEndings(rawContent).trim();
      const normalizedHash = await sha256Hex(normalizedContent.toLowerCase());
      const stableSourceId = `src:${sourceHash.slice(0, 16)}`;
      const duplicateOfSourceId = knownHashes.get(sourceHash) || null;
      const nearDuplicateSourceId = knownNormalizedHashes.get(normalizedHash) || null;
      const modifiedAtSource =
        typeof rawNote.lastModified === "number"
          ? new Date(rawNote.lastModified).toISOString()
          : typeof rawNote.lastModified === "string"
            ? new Date(rawNote.lastModified).toISOString()
            : null;

      if (!ACCEPTED_EXTENSIONS.has(extension)) {
        const { data: skippedSource } = await supabaseClient
          .from("source_files")
          .insert({
            user_id: user.id,
            batch_id: batchId,
            stable_source_id: stableSourceId,
            original_path: originalPath,
            original_filename: filename,
            extension,
            mime_guess: rawNote.mimeType || null,
            size_bytes: rawNote.size ?? rawContent.length,
            sha256: sourceHash,
            normalized_sha256: normalizedHash,
            modified_at_source: modifiedAtSource,
            status: "skipped",
            error: "Unsupported extension",
            source_preview: rawContent.slice(0, 500),
          })
          .select("id")
          .single();

        const review = reviewRow({
          userId: user.id,
          batchId,
          sourceFileId: skippedSource?.id,
          reviewType: "unsupported_extension",
          severity: "medium",
          title: `Unsupported file type: ${filename}`,
          details: { extension },
        });
        allReviewRows.push(review);
        processedNotes.push({ title: filename, path: originalPath, status: "skipped", sha256: sourceHash, reviewItems: 1 });
        continue;
      }

      const parsed = parseFrontmatter(rawContent);
      const body = parsed.body.trim() || rawContent.trim();
      const frontmatter = parsed.frontmatter;
      const providedTags = Array.isArray(rawNote.tags) ? rawNote.tags : [];
      const providedAliases = Array.isArray(rawNote.aliases) ? rawNote.aliases : [];
      const providedWikiLinks = Array.isArray(rawNote.wikiLinks) ? rawNote.wikiLinks : [];
      const tags = extractTags(frontmatter, body, providedTags);
      const aliases = extractAliases(frontmatter, providedAliases);
      const wikiLinks = extractWikiLinks(body, providedWikiLinks);
      const markdownLinks = extractMarkdownLinks(body);
      const headings = extractHeadings(body);
      const title = resolveTitle(rawNote, frontmatter, body);
      const wordCount = countWords(body);
      const reviewFlags: string[] = [];

      if (parsed.malformed) reviewFlags.push("malformed_frontmatter");
      if (!title || title === "Untitled") reviewFlags.push("missing_title");
      if (wordCount < 20) reviewFlags.push("very_short_file");
      if (wordCount > 50_000) reviewFlags.push("very_large_file");
      if (nearDuplicateSourceId && !duplicateOfSourceId) reviewFlags.push("near_duplicate_candidate");

      if (duplicateOfSourceId && !options.preserveDuplicates) {
        const { data: duplicateSource } = await supabaseClient
          .from("source_files")
          .insert({
            user_id: user.id,
            batch_id: batchId,
            stable_source_id: stableSourceId,
            original_path: originalPath,
            original_filename: filename,
            extension,
            mime_guess: rawNote.mimeType || null,
            size_bytes: rawNote.size ?? rawContent.length,
            sha256: sourceHash,
            normalized_sha256: normalizedHash,
            modified_at_source: modifiedAtSource,
            status: "duplicate",
            title_guess: title,
            source_preview: rawContent.slice(0, 500),
            frontmatter,
            headings,
            tags,
            aliases,
            wiki_links: wikiLinks,
            markdown_links: markdownLinks,
            duplicate_of_source_id: duplicateOfSourceId,
            review_flags: ["exact_duplicate"],
          })
          .select("id")
          .single();

        const review = reviewRow({
          userId: user.id,
          batchId,
          sourceFileId: duplicateSource?.id,
          reviewType: "exact_duplicate",
          severity: "low",
          title: `Exact duplicate skipped: ${title}`,
          details: { duplicateOfSourceId, originalPath, sha256: sourceHash },
        });
        allReviewRows.push(review);
        processedNotes.push({
          title,
          path: originalPath,
          status: "duplicate",
          sha256: sourceHash,
          duplicateOfSourceId,
          reviewItems: 1,
        });
        continue;
      }

      if (!body) {
        const { data: quarantinedSource } = await supabaseClient
          .from("source_files")
          .insert({
            user_id: user.id,
            batch_id: batchId,
            stable_source_id: stableSourceId,
            original_path: originalPath,
            original_filename: filename,
            extension,
            mime_guess: rawNote.mimeType || null,
            size_bytes: rawNote.size ?? 0,
            sha256: sourceHash,
            normalized_sha256: normalizedHash,
            modified_at_source: modifiedAtSource,
            status: "quarantined",
            error: "Empty file",
            title_guess: title,
            source_preview: "",
            review_flags: ["empty_file"],
          })
          .select("id")
          .single();

        const review = reviewRow({
          userId: user.id,
          batchId,
          sourceFileId: quarantinedSource?.id,
          reviewType: "empty_file",
          severity: "high",
          title: `Empty file quarantined: ${filename}`,
          details: { originalPath },
        });
        allReviewRows.push(review);
        processedNotes.push({ title, path: originalPath, status: "quarantined", sha256: sourceHash, reviewItems: 1 });
        continue;
      }

      const { data: sourceFile, error: sourceError } = await supabaseClient
        .from("source_files")
        .insert({
          user_id: user.id,
          batch_id: batchId,
          stable_source_id: stableSourceId,
          original_path: originalPath,
          original_filename: filename,
          extension,
          mime_guess: rawNote.mimeType || null,
          size_bytes: rawNote.size ?? new TextEncoder().encode(rawContent).byteLength,
          sha256: sourceHash,
          normalized_sha256: normalizedHash,
          modified_at_source: modifiedAtSource,
          status: sourceStatusForFlags(reviewFlags),
          title_guess: title,
          source_preview: rawContent.slice(0, 500),
          frontmatter,
          headings,
          tags,
          aliases,
          wiki_links: wikiLinks,
          markdown_links: markdownLinks,
          duplicate_of_source_id: nearDuplicateSourceId,
          review_flags: reviewFlags,
        })
        .select("id")
        .single();

      if (sourceError || !sourceFile) {
        processedNotes.push({ title, path: originalPath, status: "error", error: sourceError?.message || "Failed to create source record" });
        continue;
      }

      for (const flag of reviewFlags) {
        allReviewRows.push(
          reviewRow({
            userId: user.id,
            batchId,
            sourceFileId: sourceFile.id,
            reviewType: flag,
            severity: flag.includes("large") || flag.includes("malformed") ? "medium" : "low",
            title: `${flag.replace(/_/g, " ")}: ${title}`,
            details: { originalPath, wordCount, nearDuplicateSourceId },
          }),
        );
      }

      try {
        const analysis = await analyzeNoteWithAI(
          body,
          title,
          existingNotes,
          existingTags,
          existingCollections,
          prefs,
          tags,
          options.runAiAnalysis !== false,
        );

        const customMetadata = {
          backlinks: analysis.relatedNoteIds,
          import_date: new Date().toISOString(),
          import_batch_id: batchId,
          source_file_id: sourceFile.id,
          stable_source_id: stableSourceId,
          original_filename: filename,
          original_path: originalPath,
          source_hash: sourceHash,
          normalized_hash: normalizedHash,
          frontmatter,
          aliases,
          wiki_links: wikiLinks.map((link) => link.target),
          markdown_links: markdownLinks.map((link) => link.target),
          provenance_labels: ["Source-grounded", analysis.aiAvailable ? "AI-generated" : "Source-grounded with interpretation"],
          ai_reasoning: analysis.reasoning || null,
          nihiltheism_analysis: {
            philosophical_tensions: analysis.philosophicalTensions,
            key_questions: analysis.keyQuestions,
            source_anchors: analysis.sourceAnchors,
            risk_flags: analysis.riskFlags,
            confidence: analysis.confidence,
            ai_available: analysis.aiAvailable,
          },
        };

        const { data: createdNote, error: noteError } = await supabaseClient
          .from("notes")
          .insert({
            user_id: user.id,
            title,
            content: body,
            source: `bulk-import:${originalPath}`,
            detected_concepts: analysis.concepts,
            void_resonance_score: analysis.voidResonanceScore,
            collection_id: analysis.collectionId,
            custom_metadata: customMetadata,
          })
          .select()
          .single();

        if (noteError || !createdNote) throw noteError || new Error("Failed to create note");

        const allTagSuggestions = analysis.tags
          .filter((tag) => tag.name)
          .filter((tag, index, array) => array.findIndex((item) => item.name.toLowerCase() === tag.name.toLowerCase()) === index)
          .slice(0, 32);

        let tagCount = 0;
        for (const tagSuggestion of allTagSuggestions) {
          const tagName = tagSuggestion.name.trim();
          if (!tagName) continue;

          let tagId = existingTags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase())?.id;

          if (!tagId) {
            const { data: newTag } = await supabaseClient
              .from("tags")
              .upsert(
                {
                  user_id: user.id,
                  name: tagName,
                  category: tagSuggestion.category || "concept",
                  color: tagSuggestion.color || "#64748b",
                },
                { onConflict: "user_id,name" },
              )
              .select()
              .single();

            if (newTag) {
              tagId = newTag.id;
              existingTags.push(newTag);
            }
          }

          if (tagId) {
            await supabaseClient.from("note_tags").upsert({ note_id: createdNote.id, tag_id: tagId });
            tagCount++;
          }
        }

        for (const relatedNoteId of analysis.relatedNoteIds) {
          const relatedNote = existingNotes.find((note) => note.id === relatedNoteId);
          if (!relatedNote) continue;

          const currentMetadata = (relatedNote as any).custom_metadata || {};
          const currentBacklinks = Array.isArray(currentMetadata.backlinks) ? currentMetadata.backlinks : [];
          await supabaseClient
            .from("notes")
            .update({
              custom_metadata: {
                ...currentMetadata,
                backlinks: unique([...currentBacklinks.map(String), createdNote.id]),
              },
            })
            .eq("id", relatedNoteId);
        }

        const docId = `doc:${slugify(title)}:${sourceHash.slice(0, 10)}`;
        const canonicalPath = `vault/notes/${slugify(title)}-${sourceHash.slice(0, 10)}.md`;
        const contentType = extension === "md" || extension === "markdown" ? "markdown" : extension === "txt" || extension === "text" ? "plain_text" : extension || "plain_text";
        const canonicalMarkdown = buildCanonicalMarkdown({
          docId,
          title,
          aliases,
          sourceId: stableSourceId,
          sourcePath: originalPath,
          sourceHash,
          contentType,
          status: reviewFlags.length > 0 ? "needs_review" : "active",
          tags,
          batchId,
          body,
        });

        const { data: canonicalDocument, error: documentError } = await supabaseClient
          .from("canonical_documents")
          .insert({
            user_id: user.id,
            source_file_id: sourceFile.id,
            note_id: createdNote.id,
            doc_id: docId,
            title,
            canonical_path: canonicalPath,
            markdown: canonicalMarkdown,
            content_type: contentType,
            status: reviewFlags.length > 0 ? "needs_review" : "active",
            source_hash: sourceHash,
            normalized_hash: normalizedHash,
            word_count: wordCount,
            heading_count: headings.length,
            link_count: wikiLinks.length + markdownLinks.length,
            frontmatter_present: Object.keys(frontmatter).length > 0,
            provenance: {
              origin: "imported",
              source_path: originalPath,
              import_batch_id: batchId,
              transformations: ["normalize_line_endings", "parse_frontmatter", "canonical_markdown", "heading_aware_chunks"],
            },
          })
          .select("id")
          .single();

        if (documentError || !canonicalDocument) throw documentError || new Error("Failed to create canonical document");

        const chunks = createChunks(body, docId);
        if (chunks.length > 0) {
          const chunkRows = chunks.map((chunk) => ({
            user_id: user.id,
            canonical_document_id: canonicalDocument.id,
            note_id: createdNote.id,
            chunk_id: chunk.chunkId,
            heading_path: chunk.headingPath,
            ordinal: chunk.ordinal,
            content: chunk.content,
            start_offset: chunk.startOffset,
            end_offset: chunk.endOffset,
            token_estimate: chunk.tokenEstimate,
            metadata: { source_hash: sourceHash, canonical_path: canonicalPath },
          }));
          const { error: chunkError } = await supabaseClient.from("document_chunks").insert(chunkRows);
          if (chunkError) throw chunkError;
        }

        await supabaseClient
          .from("source_files")
          .update({
            canonical_note_id: createdNote.id,
            status: reviewFlags.length > 0 ? "needs_review" : "imported",
          })
          .eq("id", sourceFile.id);

        await supabaseClient
          .from("notes")
          .update({
            custom_metadata: {
              ...customMetadata,
              tags: allTagSuggestions.map((tag) => tag.name),
              canonical_document_id: canonicalDocument.id,
              canonical_path: canonicalPath,
              chunk_count: chunks.length,
            },
          })
          .eq("id", createdNote.id);

        if (analysis.aiAvailable && options.createReviewItems !== false) {
          allReviewRows.push(
            reviewRow({
              userId: user.id,
              batchId,
              sourceFileId: sourceFile.id,
              canonicalDocumentId: canonicalDocument.id,
              reviewType: "ai_inferred_metadata",
              severity: "low",
              title: `AI metadata needs optional review: ${title}`,
              details: {
                concepts: analysis.concepts,
                tags: allTagSuggestions.map((tag) => tag.name),
                relatedNoteIds: analysis.relatedNoteIds,
                philosophicalTensions: analysis.philosophicalTensions,
                keyQuestions: analysis.keyQuestions,
                sourceAnchors: analysis.sourceAnchors,
                riskFlags: analysis.riskFlags,
                confidence: analysis.confidence,
                reasoning: analysis.reasoning || null,
              },
            }),
          );
        }

        if (options.generateEmbeddings !== false) {
          try {
            await supabaseClient.functions.invoke("generate-embeddings", {
              body: { noteId: createdNote.id, content: body },
            });
          } catch (embeddingError) {
            console.error(`Embedding failed for ${createdNote.id}:`, embeddingError);
            allReviewRows.push(
              reviewRow({
                userId: user.id,
                batchId,
                sourceFileId: sourceFile.id,
                canonicalDocumentId: canonicalDocument.id,
                reviewType: "embedding_failed",
                severity: "medium",
                title: `Embedding generation failed: ${title}`,
                details: { error: embeddingError instanceof Error ? embeddingError.message : "Unknown error" },
              }),
            );
          }
        }

        existingNotes.push({
          id: createdNote.id,
          title: createdNote.title,
          content: createdNote.content,
          detected_concepts: createdNote.detected_concepts,
          custom_metadata: createdNote.custom_metadata,
        });
        knownHashes.set(sourceHash, sourceFile.id);
        knownNormalizedHashes.set(normalizedHash, sourceFile.id);

        processedNotes.push({
          id: createdNote.id,
          sourceId: sourceFile.id,
          canonicalDocumentId: canonicalDocument.id,
          docId,
          title,
          path: originalPath,
          status: reviewFlags.length > 0 ? "needs_review" : "imported",
          sha256: sourceHash,
          tags: tagCount,
          relatedNotes: analysis.relatedNoteIds.length,
          voidResonanceScore: analysis.voidResonanceScore,
          chunks: chunks.length,
          reviewItems: reviewFlags.length + (analysis.aiAvailable ? 1 : 0),
        });
      } catch (error) {
        console.error(`Error processing note "${title}":`, error);
        await supabaseClient
          .from("source_files")
          .update({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", sourceFile.id);

        allReviewRows.push(
          reviewRow({
            userId: user.id,
            batchId,
            sourceFileId: sourceFile.id,
            reviewType: "import_error",
            severity: "high",
            title: `Import failed: ${title}`,
            details: { error: error instanceof Error ? error.message : "Unknown error", originalPath },
          }),
        );

        processedNotes.push({
          title,
          path: originalPath,
          status: "error",
          sha256: sourceHash,
          error: error instanceof Error ? error.message : "Unknown error",
          reviewItems: 1,
        });
      }
    }

    if (allReviewRows.length > 0 && options.createReviewItems !== false) {
      const { error: reviewError } = await supabaseClient.from("import_review_items").insert(allReviewRows);
      if (reviewError) console.error("Review item insert error:", reviewError);
    }

    const importedCount = processedNotes.filter((note) => note.status === "imported" || note.status === "needs_review").length;
    const duplicateCount = processedNotes.filter((note) => note.status === "duplicate").length;
    const errorCount = processedNotes.filter((note) => note.status === "error").length;
    const quarantinedCount = processedNotes.filter((note) => note.status === "quarantined").length;
    const reviewCount = allReviewRows.length;
    const finalStatus = errorCount > 0 || quarantinedCount > 0 ? "completed_with_errors" : "completed";

    const manifest = {
      batch_id: batchId,
      generated_at: new Date().toISOString(),
      source_label: sourceLabel,
      import_mode: importMode,
      accepted_extensions: Array.from(ACCEPTED_EXTENSIONS),
      files_scanned: notes.length,
      files_imported: importedCount,
      exact_duplicates: duplicateCount,
      quarantined: quarantinedCount,
      errors: errorCount,
      review_items: reviewCount,
      files: processedNotes.map((note) => ({
        title: note.title,
        path: note.path,
        status: note.status,
        sha256: note.sha256,
        source_id: note.sourceId,
        canonical_document_id: note.canonicalDocumentId,
        doc_id: note.docId,
        chunks: note.chunks,
        review_items: note.reviewItems,
      })),
    };

    const reportMarkdown = createReportMarkdown({
      id: batchId,
      sourceLabel: sourceLabel || undefined,
      importMode,
      fileCount: notes.length,
      importedCount,
      duplicateCount,
      errorCount,
      quarantinedCount,
      reviewCount,
      files: processedNotes,
    });

    await supabaseClient
      .from("ingestion_batches")
      .update({
        status: finalStatus,
        imported_count: importedCount,
        duplicate_count: duplicateCount,
        error_count: errorCount,
        quarantined_count: quarantinedCount,
        review_count: reviewCount,
        manifest,
        report_markdown: reportMarkdown,
        completed_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    return jsonResponse({
      success: true,
      batch: {
        id: batchId,
        status: finalStatus,
        importedCount,
        duplicateCount,
        errorCount,
        quarantinedCount,
        reviewCount,
      },
      processed: processedNotes.length,
      notes: processedNotes,
      manifest,
      reportMarkdown,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    if (supabaseClient && batchId && userId) {
      await supabaseClient
        .from("ingestion_batches")
        .update({
          status: "failed",
          error_count: 1,
          report_markdown: `# Import Report\n\nBatch: \`${batchId}\`\n\nImport failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }\n`,
          completed_at: new Date().toISOString(),
        })
        .eq("id", batchId)
        .eq("user_id", userId);
    }

    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
