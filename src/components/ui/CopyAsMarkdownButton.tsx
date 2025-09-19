import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { nihiltheismFramework } from '@/lib/nihiltheism-framework';
import { generateIdempotencyKey, exportNoteMarkdown, ExportNoteData } from '@/lib/markdown/exportMarkdown';
import { FEATURES } from '@/lib/config';

interface CopyAsMarkdownButtonProps {
  prompt: string;
  response: string;
  presetName?: string;
  model?: string;
  source: "PhilosophyLab" | "Enhancer" | "Generator" | "Library";
  className?: string;
}

export const CopyAsMarkdownButton: React.FC<CopyAsMarkdownButtonProps> = ({
  prompt,
  response,
  presetName,
  model,
  source,
  className = ""
}) => {
  const handleCopyMarkdown = async () => {
    try {
      if (!FEATURES.enableMarkdownExport) {
        toast({
          title: "Feature Disabled",
          description: "Markdown export feature is currently disabled.",
          variant: "destructive"
        });
        return;
      }

      // Detect concepts and framework
      const combinedContent = `${prompt} ${response}`;
      const concepts = nihiltheismFramework.detectConcepts(combinedContent);
      const voidResonanceScore = nihiltheismFramework.calculateVoidResonanceScore(combinedContent, concepts);
      
      const { framework, tags } = determineFrameworkAndTags(concepts, combinedContent);
      const timestamp = Date.now();
      const idempotencyKey = generateIdempotencyKey(prompt, response, timestamp);

      // Build export data
      const exportData: ExportNoteData = {
        prompt,
        response,
        presetName,
        model,
        framework: framework as any,
        concepts,
        tags: [...tags, 'theme-dark', source.toLowerCase()],
        createdAt: new Date(),
        voidResonanceScore,
        densificationLevel: 1,
        source,
        idempotencyKey
      };

      // Generate markdown
      const markdown = exportNoteMarkdown(exportData);

      // Copy to clipboard
      await navigator.clipboard.writeText(markdown);

      toast({
        title: "Markdown Copied ✓",
        description: `Copied ${markdown.length} characters to clipboard with ${concepts.length} detected concepts.`,
      });

    } catch (error) {
      console.error('Failed to copy markdown:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy markdown. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCopyMarkdown}
            variant="outline"
            className={`rounded-md h-9 px-3 ${className}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Copy as Markdown
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy prompt + response as Markdown</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const determineFrameworkAndTags = (concepts: string[], content: string): { framework: string; tags: string[] } => {
  const contentLower = content.toLowerCase();
  const tags: string[] = [];
  
  // Check for framework indicators
  const hasREN = contentLower.includes('ren') || 
    concepts.some(c => c.toLowerCase().includes('recursive') || c.toLowerCase().includes('enhancement'));
  
  const hasJournal314 = contentLower.includes('journal314') || contentLower.includes('314') ||
    concepts.some(c => c.toLowerCase().includes('mapping') || c.toLowerCase().includes('structural'));
  
  const hasNihiltheism = concepts.length > 0; // If NT concepts detected

  if (hasREN && hasJournal314) {
    tags.push('REN', 'Journal314');
    return { framework: 'Mixed', tags };
  } else if (hasREN) {
    tags.push('REN');
    return { framework: 'REN', tags };
  } else if (hasJournal314) {
    tags.push('Journal314');
    return { framework: 'Journal314', tags };
  } else if (hasNihiltheism) {
    tags.push('Nihiltheism');
    return { framework: 'Nihiltheism', tags };
  } else {
    return { framework: 'General', tags };
  }
};