import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProcessedNote {
  id?: string;
  title: string;
  tags?: number;
  relatedNotes?: number;
  voidResonanceScore?: number;
  error?: string;
}

export const BulkImport = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessedNote[]>([]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const notes = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();
        
        // Extract title from filename or first line
        let title = file.name.replace(/\.(txt|md|markdown)$/i, '');
        const firstLine = content.split('\n')[0];
        if (firstLine.startsWith('#')) {
          title = firstLine.replace(/^#+\s*/, '').trim();
        }

        notes.push({
          title,
          content,
          filename: file.name
        });

        setProgress(((i + 1) / files.length) * 50); // First 50% for reading files
      }

      // Call bulk import edge function
      const { data, error } = await supabase.functions.invoke('bulk-import', {
        body: { notes }
      });

      if (error) throw error;

      setResults(data.notes || []);
      setProgress(100);

      const successCount = data.notes.filter((n: ProcessedNote) => !n.error).length;
      const errorCount = data.notes.filter((n: ProcessedNote) => n.error).length;

      toast({
        title: 'Bulk Import Complete',
        description: `Successfully imported ${successCount} notes. ${errorCount} errors.`,
      });

    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      event.target.value = ''; // Reset input
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import Notes
        </CardTitle>
        <CardDescription>
          Upload multiple text or Markdown files. AI will automatically tag, categorize, link related notes, and calculate void resonance scores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="bulk-upload" className="cursor-pointer">
            <input
              id="bulk-upload"
              type="file"
              multiple
              accept=".txt,.md,.markdown"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
            <Button 
              disabled={isProcessing}
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('bulk-upload')?.click()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </>
              )}
            </Button>
          </label>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing notes...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Import Results</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  {result.error ? (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm truncate">{result.title}</span>
                      </div>
                    </div>
                    {result.error ? (
                      <p className="text-xs text-destructive mt-1">{result.error}</p>
                    ) : (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {result.tags !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {result.tags} tags
                          </Badge>
                        )}
                        {result.relatedNotes !== undefined && result.relatedNotes > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {result.relatedNotes} links
                          </Badge>
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
      </CardContent>
    </Card>
  );
};
