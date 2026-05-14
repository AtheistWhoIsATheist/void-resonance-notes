import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FolderOpen, FileText, CheckCircle2, XCircle, Loader2, AlertTriangle, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ACCEPTED_EXTENSIONS = ['.txt', '.text', '.md', '.markdown', '.rst', '.csv', '.json'];

interface BulkImportProps {
  onImported?: () => void | Promise<void>;
  mode?: 'notes' | 'agent';
  onAgentBrief?: (brief: string) => void;
}

interface PreparedNote {
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

interface ProcessedNote {
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

interface ImportBatchSummary {
  id: string;
  status: string;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  quarantinedCount: number;
  reviewCount: number;
}

interface AuditBatch {
  id: string;
  source_label: string | null;
  import_mode: string;
  status: string;
  file_count: number;
  imported_count: number;
  duplicate_count: number;
  error_count: number;
  quarantined_count: number;
  review_count: number;
  created_at: string;
  completed_at: string | null;
}

interface ReviewItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  status: string;
  review_type: string;
  created_at: string;
  source_files?: {
    original_path: string | null;
    original_filename: string | null;
  } | null;
}

const getRelativePath = (file: File) => {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  return relativePath || file.name;
};

const titleFromContent = (filename: string, content: string) => {
  const firstHeading = content.split(/\r?\n/).find((line) => line.trim().startsWith('# '));
  if (firstHeading) return firstHeading.replace(/^#\s+/, '').trim();
  return filename.replace(/\.(txt|text|md|markdown|rst|csv|json)$/i, '');
};

const sha256Hex = async (content: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const statusVariant = (status?: ProcessedNote['status']): BadgeVariant => {
  if (status === 'imported') return 'default';
  if (status === 'needs_review') return 'secondary';
  if (status === 'duplicate' || status === 'skipped') return 'outline';
  return 'destructive';
};

const severityVariant = (severity: ReviewItem['severity']): BadgeVariant => {
  if (severity === 'high') return 'destructive';
  if (severity === 'medium') return 'secondary';
  return 'outline';
};

const createAgentBrief = (batch: ImportBatchSummary | null, results: ProcessedNote[], reportMarkdown: string) => {
  const imported = results.filter((result) => result.status === 'imported' || result.status === 'needs_review');
  const reviewItems = results.reduce((sum, result) => sum + (result.reviewItems || 0), 0);
  const topFiles = imported
    .slice(0, 8)
    .map((result) => `- ${result.title}${result.path ? ` (${result.path})` : ''}: ${result.chunks || 0} chunks, ${result.tags || 0} tags, status ${result.status || 'unknown'}`)
    .join('\n');

  return [
    '# Corpus Intake Brief For The Nihiltheism Agent',
    '',
    `Batch: ${batch?.id || 'pending'}`,
    `Status: ${batch?.status || 'unknown'}`,
    `Imported: ${batch?.importedCount || 0}`,
    `Duplicates: ${batch?.duplicateCount || 0}`,
    `Quarantined: ${batch?.quarantinedCount || 0}`,
    `Errors: ${batch?.errorCount || 0}`,
    `Review items: ${batch?.reviewCount ?? reviewItems}`,
    '',
    'Use the newly ingested corpus as working context. Do not treat ingestion as a standalone archive task. Treat it as an agent tool for clarifying, densifying, and unraveling philosophical chaos.',
    '',
    'Your task:',
    '1. Identify the central philosophical tensions in the imported material.',
    '2. Separate source-grounded claims from AI-inferred metadata.',
    '3. Surface duplicates, lacunae, ambiguous terms, and review risks.',
    '4. Build a densification path from raw notes toward concepts, questions, and usable synthesis.',
    '5. Return concrete next actions for the knowledge graph, notes, and review queue.',
    '',
    'Imported files:',
    topFiles || '- No imported files available in the last result payload.',
    '',
    reportMarkdown ? 'Import report follows:' : '',
    reportMarkdown,
  ].filter(Boolean).join('\n');
};

export const BulkImport = ({ onImported, mode = 'notes', onAgentBrief }: BulkImportProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessedNote[]>([]);
  const [batch, setBatch] = useState<ImportBatchSummary | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [preserveDuplicates, setPreserveDuplicates] = useState(false);
  const [runAiAnalysis, setRunAiAnalysis] = useState(true);
  const [generateEmbeddings, setGenerateEmbeddings] = useState(true);
  const [auditBatches, setAuditBatches] = useState<AuditBatch[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [agentBrief, setAgentBrief] = useState('');

  const isAgentTool = mode === 'agent';

  const folderInputProps = useMemo(
    () =>
      ({
        webkitdirectory: '',
        directory: '',
      }) as InputHTMLAttributes<HTMLInputElement>,
    [],
  );

  const prepareFiles = useCallback(async (files: FileList, importSource: string) => {
    const acceptedFiles = Array.from(files).filter((file) =>
      ACCEPTED_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension)),
    );

    if (acceptedFiles.length === 0) {
      throw new Error('No supported text or Markdown files were selected.');
    }

    const prepared: PreparedNote[] = [];

    for (const [index, file] of acceptedFiles.entries()) {
      const content = await file.text();
      const originalPath = getRelativePath(file);
      prepared.push({
        title: titleFromContent(file.name, content),
        content,
        filename: file.name,
        originalPath,
        mimeType: file.type || 'text/plain',
        size: file.size,
        lastModified: file.lastModified,
        sha256: await sha256Hex(content),
        importSource,
      });

      setProgress(((index + 1) / acceptedFiles.length) * 40);
    }

    return prepared;
  }, []);

  const loadAuditTrail = useCallback(async () => {
    setIsLoadingAudit(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setAuditBatches([]);
        setReviewItems([]);
        return;
      }

      const [batchesRes, reviewRes] = await Promise.all([
        supabase
          .from('ingestion_batches')
          .select('id, source_label, import_mode, status, file_count, imported_count, duplicate_count, error_count, quarantined_count, review_count, created_at, completed_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('import_review_items')
          .select('id, title, severity, status, review_type, created_at, source_files(original_path, original_filename)')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(8),
      ]);

      if (batchesRes.error) throw batchesRes.error;
      if (reviewRes.error) throw reviewRes.error;

      setAuditBatches((batchesRes.data || []) as AuditBatch[]);
      setReviewItems((reviewRes.data || []) as ReviewItem[]);
    } catch (error) {
      console.error('Ingestion audit load error:', error);
      toast({
        title: 'Audit Trail Unavailable',
        description: 'Could not load recent ingestion batches or review items.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    void loadAuditTrail();
  }, [loadAuditTrail]);

  const importFiles = useCallback(
    async (files: FileList | null, mode: 'files' | 'folder') => {
      if (!files || files.length === 0 || isProcessing) return;

      setIsProcessing(true);
      setProgress(0);
      setResults([]);
      setBatch(null);
      setReportMarkdown('');

      try {
        const notes = await prepareFiles(files, mode === 'folder' ? 'folder-import' : 'file-import');
        setProgress(50);

        const { data, error } = await supabase.functions.invoke('bulk-import', {
          body: {
            notes,
            importMode: mode,
            sourceLabel: isAgentTool
              ? mode === 'folder' ? 'Agent corpus folder intake' : 'Agent corpus file intake'
              : mode === 'folder' ? 'Folder import' : 'File import',
            options: {
              preserveDuplicates,
              runAiAnalysis,
              generateEmbeddings,
              createReviewItems: true,
            },
          },
        });

        if (error) throw error;

        const importedNotes = (data.notes || []) as ProcessedNote[];
        setResults(importedNotes);
        setBatch(data.batch || null);
        setReportMarkdown(data.reportMarkdown || '');
        const brief = createAgentBrief(data.batch || null, importedNotes, data.reportMarkdown || '');
        setAgentBrief(brief);
        setProgress(100);
        await onImported?.();
        await loadAuditTrail();
        if (isAgentTool) onAgentBrief?.(brief);

        toast({
          title: isAgentTool ? 'Corpus Intake Complete' : 'Import Complete',
          description: `${data.batch?.importedCount || 0} imported, ${data.batch?.duplicateCount || 0} duplicates, ${data.batch?.reviewCount || 0} review items.`,
        });
      } catch (error) {
        console.error('Bulk import error:', error);
        toast({
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Could not complete import.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (folderInputRef.current) folderInputRef.current.value = '';
      }
    },
    [generateEmbeddings, isAgentTool, isProcessing, loadAuditTrail, onAgentBrief, onImported, prepareFiles, preserveDuplicates, runAiAnalysis],
  );

  const copyReport = async () => {
    if (!reportMarkdown) return;
    await navigator.clipboard.writeText(reportMarkdown);
    toast({ title: 'Report Copied', description: 'The import report Markdown is on your clipboard.' });
  };

  const stageAgentBrief = () => {
    if (!agentBrief) return;
    onAgentBrief?.(agentBrief);
    toast({ title: 'Agent Brief Staged', description: 'The corpus brief is ready in the Nihiltheism agent prompt.' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {isAgentTool ? 'Corpus Intake Tool' : 'File Ingestion'}
        </CardTitle>
        <CardDescription>
          {isAgentTool
            ? 'Feed source material into the agent context with provenance, chunks, labels, and review signals.'
            : 'Import files into Supabase with source hashes, canonical documents, chunks, tags, embeddings, and review queues.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          id="bulk-upload"
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={(event) => importFiles(event.target.files, 'files')}
          disabled={isProcessing}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          id="folder-upload"
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={(event) => importFiles(event.target.files, 'folder')}
          disabled={isProcessing}
          className="hidden"
          {...folderInputProps}
        />

        <div className="flex flex-wrap gap-2">
          <Button disabled={isProcessing} onClick={() => fileInputRef.current?.click()}>
            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {isAgentTool ? 'Attach Sources' : 'Select Files'}
          </Button>
          <Button disabled={isProcessing} variant="outline" onClick={() => folderInputRef.current?.click()}>
            <FolderOpen className="h-4 w-4 mr-2" />
            {isAgentTool ? 'Attach Folder' : 'Select Folder'}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={runAiAnalysis} onCheckedChange={(checked) => setRunAiAnalysis(checked === true)} />
            AI metadata
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={generateEmbeddings} onCheckedChange={(checked) => setGenerateEmbeddings(checked === true)} />
            Embeddings
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={preserveDuplicates} onCheckedChange={(checked) => setPreserveDuplicates(checked === true)} />
            Preserve duplicates
          </label>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing import</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {batch && (
          <div className="grid gap-2 sm:grid-cols-5">
            <Badge variant="secondary">Imported {batch.importedCount}</Badge>
            <Badge variant="outline">Duplicates {batch.duplicateCount}</Badge>
            <Badge variant="outline">Review {batch.reviewCount}</Badge>
            <Badge variant={batch.quarantinedCount > 0 ? 'destructive' : 'outline'}>Quarantine {batch.quarantinedCount}</Badge>
            <Badge variant={batch.errorCount > 0 ? 'destructive' : 'outline'}>Errors {batch.errorCount}</Badge>
          </div>
        )}

        {reportMarkdown && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyReport}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Import Report
            </Button>
            {isAgentTool && (
              <Button variant="secondary" size="sm" onClick={stageAgentBrief}>
                <Sparkles className="h-4 w-4 mr-2" />
                Stage Agent Brief
              </Button>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Import Results</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={`${result.sha256 || result.title}-${index}`} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  {result.status === 'imported' || result.status === 'needs_review' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : result.status === 'duplicate' || result.status === 'skipped' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm truncate">{result.title}</span>
                        <Badge variant={statusVariant(result.status)} className="text-xs">
                          {result.status || 'unknown'}
                        </Badge>
                      </div>
                    </div>
                    {result.path && <p className="text-xs text-muted-foreground mt-1 truncate">{result.path}</p>}
                    {result.error ? (
                      <p className="text-xs text-destructive mt-1">{result.error}</p>
                    ) : (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {result.tags !== undefined && <Badge variant="secondary" className="text-xs">{result.tags} tags</Badge>}
                        {result.chunks !== undefined && <Badge variant="secondary" className="text-xs">{result.chunks} chunks</Badge>}
                        {result.reviewItems !== undefined && result.reviewItems > 0 && (
                          <Badge variant="outline" className="text-xs">{result.reviewItems} review</Badge>
                        )}
                        {result.relatedNotes !== undefined && result.relatedNotes > 0 && (
                          <Badge variant="secondary" className="text-xs">{result.relatedNotes} links</Badge>
                        )}
                        {result.voidResonanceScore !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            Resonance: {result.voidResonanceScore.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">Ingestion Audit</h3>
            <Button variant="outline" size="sm" onClick={() => void loadAuditTrail()} disabled={isLoadingAudit}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAudit ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {auditBatches.length > 0 ? (
            <div className="space-y-2">
              {auditBatches.map((auditBatch) => (
                <div key={auditBatch.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{auditBatch.source_label || auditBatch.import_mode}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(auditBatch.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={auditBatch.status === 'completed_with_errors' || auditBatch.status === 'failed' ? 'destructive' : 'secondary'}>
                      {auditBatch.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{auditBatch.file_count} files</Badge>
                    <Badge variant="outline">{auditBatch.imported_count} imported</Badge>
                    <Badge variant="outline">{auditBatch.duplicate_count} duplicates</Badge>
                    <Badge variant={auditBatch.review_count > 0 ? 'secondary' : 'outline'}>{auditBatch.review_count} review</Badge>
                    {auditBatch.quarantined_count > 0 && <Badge variant="destructive">{auditBatch.quarantined_count} quarantined</Badge>}
                    {auditBatch.error_count > 0 && <Badge variant="destructive">{auditBatch.error_count} errors</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No ingestion batches recorded yet.</p>
          )}

          {reviewItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Open Review Items</h4>
              <div className="space-y-2">
                {reviewItems.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={severityVariant(item.severity)}>{item.severity}</Badge>
                      <Badge variant="outline">{item.review_type.replace(/_/g, ' ')}</Badge>
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {item.source_files?.original_path || item.source_files?.original_filename || new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
