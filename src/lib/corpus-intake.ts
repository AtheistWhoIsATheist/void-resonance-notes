export const TEXT_CORPUS_EXTENSIONS = ['.txt', '.text', '.md', '.markdown'] as const;
export const TEXT_CORPUS_ACCEPT = TEXT_CORPUS_EXTENSIONS.join(',');

const MAX_SINGLE_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_FILE_BYTES = 20 * 1024 * 1024;

export interface PreparedCorpusFile {
  title: string;
  content: string;
  filename: string;
  originalPath: string;
  mimeType: string;
  size: number;
  lastModified: number;
  sha256: string;
  importSource: string;
}

export interface ProcessedCorpusFile {
  id?: string;
  sourceId?: string;
  canonicalDocumentId?: string;
  docId?: string;
  title: string;
  path?: string;
  status?: 'imported' | 'needs_review' | 'duplicate' | 'quarantined' | 'skipped' | 'error';
  tags?: number;
  relatedNotes?: number;
  voidResonanceScore?: number;
  chunks?: number;
  reviewItems?: number;
  sha256?: string;
  error?: string;
}

export interface ImportBatchSummary {
  id: string;
  status: string;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  quarantinedCount: number;
  reviewCount: number;
}

export interface CorpusImportResponse {
  success?: boolean;
  batch?: ImportBatchSummary;
  processed?: number;
  notes?: ProcessedCorpusFile[];
  manifest?: unknown;
  reportMarkdown?: string;
  error?: string;
}

interface PrepareCorpusFilesOptions {
  importSource: string;
  acceptedExtensions?: readonly string[];
  onProgress?: (progress: number) => void;
}

interface CorpusBriefOptions {
  conversationTitle?: string;
  userInstruction?: string;
}

const getRelativePath = (file: File) => {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  return relativePath || file.name;
};

const normalizeLineEndings = (content: string) => content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const titleFromContent = (filename: string, content: string) => {
  const firstHeading = content.split(/\n/).find((line) => line.trim().startsWith('# '));
  if (firstHeading) return firstHeading.replace(/^#\s+/, '').trim();
  return filename.replace(/\.(txt|text|md|markdown)$/i, '') || 'Untitled source';
};

const sha256Hex = async (content: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isSupportedTextCorpusFile = (
  file: File,
  acceptedExtensions: readonly string[] = TEXT_CORPUS_EXTENSIONS,
) => acceptedExtensions.some((extension) => file.name.toLowerCase().endsWith(extension));

export const prepareCorpusFiles = async (
  files: FileList | File[],
  options: PrepareCorpusFilesOptions,
): Promise<PreparedCorpusFile[]> => {
  const acceptedExtensions = options.acceptedExtensions ?? TEXT_CORPUS_EXTENSIONS;
  const selectedFiles = Array.from(files).filter((file) => isSupportedTextCorpusFile(file, acceptedExtensions));

  if (selectedFiles.length === 0) {
    throw new Error('Select at least one plain text or Markdown file.');
  }

  const oversizedFile = selectedFiles.find((file) => file.size > MAX_SINGLE_FILE_BYTES);
  if (oversizedFile) {
    throw new Error(`${oversizedFile.name} is ${formatBytes(oversizedFile.size)}. Split files over ${formatBytes(MAX_SINGLE_FILE_BYTES)} before importing.`);
  }

  const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_TOTAL_FILE_BYTES) {
    throw new Error(`This upload is ${formatBytes(totalBytes)}. Import at most ${formatBytes(MAX_TOTAL_FILE_BYTES)} at a time.`);
  }

  const prepared: PreparedCorpusFile[] = [];

  for (const [index, file] of selectedFiles.entries()) {
    const content = normalizeLineEndings(await file.text());
    prepared.push({
      title: titleFromContent(file.name, content),
      content,
      filename: file.name,
      originalPath: getRelativePath(file),
      mimeType: file.type || 'text/plain',
      size: file.size,
      lastModified: file.lastModified,
      sha256: await sha256Hex(content),
      importSource: options.importSource,
    });
    options.onProgress?.(Math.round(((index + 1) / selectedFiles.length) * 45));
  }

  return prepared;
};

export const createCorpusIntakeBrief = (
  batch: ImportBatchSummary | null | undefined,
  results: ProcessedCorpusFile[],
  reportMarkdown: string,
  options: CorpusBriefOptions = {},
) => {
  const imported = results.filter((result) => result.status === 'imported' || result.status === 'needs_review');
  const errored = results.filter((result) => result.status === 'error' || result.status === 'quarantined');
  const reviewItems = results.reduce((sum, result) => sum + (result.reviewItems || 0), 0);
  const topFiles = imported
    .slice(0, 10)
    .map((result) => {
      const location = result.path ? ` (${result.path})` : '';
      const metrics = [
        `${result.chunks || 0} chunks`,
        `${result.tags || 0} tags`,
        result.voidResonanceScore !== undefined ? `void resonance ${result.voidResonanceScore.toFixed(2)}` : null,
        `status ${result.status || 'unknown'}`,
      ].filter(Boolean);
      return `- ${result.title}${location}: ${metrics.join(', ')}`;
    })
    .join('\n');

  const riskFiles = errored
    .slice(0, 6)
    .map((result) => `- ${result.title}${result.path ? ` (${result.path})` : ''}: ${result.error || result.status}`)
    .join('\n');

  return [
    '# Active Corpus Intake Brief',
    '',
    options.conversationTitle ? `Conversation: ${options.conversationTitle}` : '',
    `Batch: ${batch?.id || 'pending'}`,
    `Status: ${batch?.status || 'unknown'}`,
    `Imported: ${batch?.importedCount || 0}`,
    `Duplicates: ${batch?.duplicateCount || 0}`,
    `Quarantined: ${batch?.quarantinedCount || 0}`,
    `Errors: ${batch?.errorCount || 0}`,
    `Review items: ${batch?.reviewCount ?? reviewItems}`,
    '',
    'Operational mandate:',
    '- Treat the imported files as live second-brain material for Nihiltheism research.',
    '- Use source-grounded claims when the imported corpus supports them.',
    '- Mark AI-inferred labels, conceptual bridges, and speculative expansions as provisional.',
    '- Clarify terms, expose hidden assumptions, map tensions, and propose next research actions.',
    '- Preserve apophatic humility: do not close the void into a final doctrine.',
    '',
    options.userInstruction ? `User instruction: ${options.userInstruction}` : '',
    '',
    'Imported files:',
    topFiles || '- No imported files available in the last result payload.',
    riskFiles ? '\nReview risks:\n' + riskFiles : '',
    reportMarkdown ? '\nImport report:\n' + reportMarkdown : '',
  ]
    .filter(Boolean)
    .join('\n');
};
