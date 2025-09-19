import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { nihiltheismFramework, Note } from '@/lib/nihiltheism-framework';
import { generateIdempotencyKey, exportNoteMarkdown } from '@/lib/markdown/exportMarkdown';
import { FEATURES, COLLECTIONS } from '@/lib/config';

interface SaveToVaultButtonProps {
  prompt: string;
  response: string;
  presetName?: string;
  model?: string;
  source: "PhilosophyLab" | "Enhancer" | "Generator" | "Library";
  onSaved?: (id: string) => void;
  className?: string;
}

export const SaveToVaultButton: React.FC<SaveToVaultButtonProps> = ({
  prompt,
  response,
  presetName,
  model,
  source,
  onSaved,
  className = ""
}) => {
  const handleSave = () => {
    try {
      if (!FEATURES.enableMarkdownExport) {
        toast({
          title: "Feature Disabled",
          description: "Save to Vault feature is currently disabled.",
          variant: "destructive"
        });
        return;
      }

      // Generate idempotency key
      const timestamp = Date.now();
      const idempotencyKey = generateIdempotencyKey(prompt, response, timestamp);

      // Check for duplicates if enforced
      if (FEATURES.enforceIdempotency) {
        const existingNotes = JSON.parse(localStorage.getItem('infinity-notes') || '[]');
        const duplicate = existingNotes.find((note: any) => 
          note.idempotencyKey === idempotencyKey
        );
        
        if (duplicate) {
          toast({
            title: "Already Saved",
            description: "This prompt and response combination has already been saved to the vault.",
          });
          return;
        }
      }

      // Detect concepts using existing framework
      const combinedContent = `${prompt} ${response}`;
      const concepts = nihiltheismFramework.detectConcepts(combinedContent);
      const voidResonanceScore = nihiltheismFramework.calculateVoidResonanceScore(combinedContent, concepts);

      // Determine framework and auto-tag
      const { framework, tags } = determineFrameworkAndTags(concepts, combinedContent);

      // Create note
      const newNote: Note = {
        id: `vault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: prompt.slice(0, 80) + (prompt.length > 80 ? '...' : ''),
        content: `## Original Prompt\n${prompt}\n\n## AI Response\n${response}`,
        tags: [...tags, 'theme-dark', source.toLowerCase()],
        concepts,
        createdAt: new Date(),
        updatedAt: new Date(),
        densificationLevel: 1,
        voidResonanceScore,
        metadata: {
          prompt,
          response,
          presetName,
          model,
          framework,
          source,
          idempotencyKey
        }
      };

      // Save to localStorage (mimicking NotesInterface behavior)
      const existingNotes = JSON.parse(localStorage.getItem('infinity-notes') || '[]');
      const updatedNotes = [newNote, ...existingNotes];
      localStorage.setItem('infinity-notes', JSON.stringify(updatedNotes));

      // Trigger custom event to notify NotesInterface if it's listening
      window.dispatchEvent(new CustomEvent('vault-note-added', { detail: newNote }));

      onSaved?.(newNote.id);

      toast({
        title: "Saved to Vault ✓",
        description: `Detected ${concepts.length} concepts. Framework: ${framework}. Void-Resonance: ${voidResonanceScore}/100`,
      });

    } catch (error) {
      console.error('Failed to save to vault:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save to vault. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSave}
            className={`bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-9 px-3 ${className}`}
          >
            <Save className="h-4 w-4 mr-2" />
            Save to Vault
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Save prompt + response to PKM Vault</p>
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