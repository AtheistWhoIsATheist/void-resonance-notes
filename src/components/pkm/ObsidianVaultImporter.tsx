import { useCallback, useState } from 'react';
import { Upload, Loader2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Note, nihiltheismFramework } from '@/lib/nihiltheism-framework';

interface ObsidianVaultImporterProps {
  onImported: () => void;
}

interface ParsedVaultNote {
  filePath: string;
  title: string;
  content: string;
  tags: string[];
  wikiLinks: string[];
}

const normalizeWikiTarget = (value: string) =>
  value.trim().toLowerCase().replace(/\.md$/i, '');

const parseFrontmatter = (content: string): { frontmatter: Record<string, unknown>; body: string } => {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!frontmatterMatch) {
    return { frontmatter: {}, body: content };
  }

  const body = content.slice(frontmatterMatch[0].length);
  const lines = frontmatterMatch[1].split('\n');
  const frontmatter: Record<string, unknown> = {};

  for (const line of lines) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      frontmatter[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      continue;
    }

    frontmatter[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }

  return { frontmatter, body };
};

const extractTags = (frontmatter: Record<string, unknown>, content: string): string[] => {
  const hashtags = Array.from(content.matchAll(/(^|\s)#([A-Za-z0-9/_-]+)/g)).map((match) => match[2]);
  const fmTags = frontmatter.tags;
  const fromFrontmatter = Array.isArray(fmTags)
    ? fmTags.map((tag) => String(tag).trim().replace(/^#/, '')).filter(Boolean)
    : typeof fmTags === 'string'
      ? fmTags.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean)
      : [];

  return Array.from(new Set([...hashtags, ...fromFrontmatter]));
};

const extractWikiLinks = (content: string): string[] => {
  const matches = Array.from(content.matchAll(/\[\[([^[\]]+)\]\]/g));
  return Array.from(
    new Set(
      matches
        .map((match) => match[1].split('|')[0].split('#')[0])
        .map((link) => normalizeWikiTarget(link))
        .filter(Boolean),
    ),
  );
};

export const ObsidianVaultImporter = ({ onImported }: ObsidianVaultImporterProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleVaultUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const markdownFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith('.md'));
    if (markdownFiles.length === 0) {
      toast({
        title: 'No Markdown Files Found',
        description: 'Please upload Obsidian .md files from your vault.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    try {
      const parsedNotes: ParsedVaultNote[] = [];

      for (const [index, file] of markdownFiles.entries()) {
        const rawContent = await file.text();
        const { frontmatter, body } = parseFrontmatter(rawContent);
        const firstHeading = body.split('\n').find((line) => line.trim().startsWith('# '));
        const titleFromHeading = firstHeading?.replace(/^#\s+/, '').trim();
        const titleFromFrontmatter = typeof frontmatter.title === 'string' ? frontmatter.title : undefined;
        const title =
          titleFromFrontmatter ||
          titleFromHeading ||
          file.name.replace(/\.md$/i, '');

        parsedNotes.push({
          filePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
          title,
          content: body.trim(),
          tags: extractTags(frontmatter, body),
          wikiLinks: extractWikiLinks(body),
        });

        setProgress(((index + 1) / markdownFiles.length) * 45);
      }

      const slugToId = new Map<string, string>();
      const now = Date.now();

      const generatedNotes = parsedNotes.map((parsed, index) => {
        const id = `obsidian-${now}-${index}`;
        slugToId.set(normalizeWikiTarget(parsed.title), id);
        slugToId.set(normalizeWikiTarget(parsed.filePath), id);
        return {
          id,
          parsed,
        };
      });

      const backlinksById = new Map<string, Set<string>>();

      generatedNotes.forEach(({ id, parsed }) => {
        parsed.wikiLinks.forEach((target) => {
          const linkedId = slugToId.get(target);
          if (!linkedId) return;
          if (!backlinksById.has(linkedId)) {
            backlinksById.set(linkedId, new Set());
          }
          backlinksById.get(linkedId)?.add(parsed.title);
        });
      });

      const nextNotes: Note[] = generatedNotes.map(({ id, parsed }, index) => {
        const concepts = nihiltheismFramework.detectConcepts(parsed.content);
        const voidResonanceScore = nihiltheismFramework.calculateVoidResonanceScore(parsed.content, concepts);
        const resolvedLinks = parsed.wikiLinks
          .map((target) => {
            const linkedId = slugToId.get(target);
            if (!linkedId) return null;
            const linkedNote = generatedNotes.find((item) => item.id === linkedId);
            return linkedNote?.parsed.title;
          })
          .filter((value): value is string => Boolean(value));

        setProgress(45 + ((index + 1) / generatedNotes.length) * 45);

        return {
          id,
          title: parsed.title,
          content: parsed.content,
          tags: parsed.tags,
          concepts,
          createdAt: new Date(),
          updatedAt: new Date(),
          densificationLevel: 1,
          voidResonanceScore,
          metadata: {
            importSource: 'obsidian',
            source: 'obsidian',
            vaultFilePath: parsed.filePath,
            wikiLinks: resolvedLinks,
            backlinks: Array.from(backlinksById.get(id) || []),
          },
        };
      });

      const existingNotes = JSON.parse(localStorage.getItem('infinity-notes') || '[]') as Note[];
      const vaultPaths = new Set(
        nextNotes
          .map((note) => note.metadata?.vaultFilePath)
          .filter((value): value is string => Boolean(value)),
      );

      const dedupedExisting = existingNotes.filter(
        (note) => !(note.metadata?.importSource === 'obsidian' && note.metadata.vaultFilePath && vaultPaths.has(note.metadata.vaultFilePath)),
      );

      localStorage.setItem('infinity-notes', JSON.stringify([...nextNotes, ...dedupedExisting]));
      setProgress(100);
      onImported();

      const linkedCount = nextNotes.reduce((total, note) => total + (note.metadata?.wikiLinks?.length || 0), 0);
      toast({
        title: 'Obsidian Vault Imported',
        description: `Imported ${nextNotes.length} notes with ${linkedCount} wiki links.`,
      });
    } catch (error) {
      console.error('Obsidian import failed:', error);
      toast({
        title: 'Vault Import Failed',
        description: 'Could not process Obsidian files. Please verify markdown formatting and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  }, [onImported]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Obsidian Vault Wiki Import
        </CardTitle>
        <CardDescription>
          Upload your Obsidian vault markdown files to generate connected notes with wiki links and backlinks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label htmlFor="obsidian-upload" className="cursor-pointer inline-block">
          <input
            id="obsidian-upload"
            className="hidden"
            type="file"
            multiple
            accept=".md"
            onChange={handleVaultUpload}
            disabled={isImporting}
          />
          <Button
            type="button"
            disabled={isImporting}
            onClick={() => document.getElementById('obsidian-upload')?.click()}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing Vault...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Select Obsidian Files
              </>
            )}
          </Button>
        </label>

        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Building your personal wiki...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
