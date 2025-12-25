import { supabase } from '@/integrations/supabase/client';
import { nihiltheismFramework } from '@/lib/nihiltheism-framework';

export interface LocalStorageNote {
  id: string;
  title: string;
  content: string;
  detectedConcepts: string[];
  voidResonanceScore: number;
  timestamp: string;
  source?: string;
  framework?: string;
  tags?: string[];
}

export async function migrateLocalStorageToDatabase(userId: string): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    // Check if migration has already been done
    const migrationKey = `migration_completed_${userId}`;
    if (localStorage.getItem(migrationKey)) {
      return { success: true, migratedCount: 0, errors: [] };
    }

    // Get notes from localStorage
    const notesJson = localStorage.getItem('notes');
    if (!notesJson) {
      localStorage.setItem(migrationKey, 'true');
      return { success: true, migratedCount: 0, errors: [] };
    }

    const localNotes: LocalStorageNote[] = JSON.parse(notesJson);
    
    if (!Array.isArray(localNotes) || localNotes.length === 0) {
      localStorage.setItem(migrationKey, 'true');
      return { success: true, migratedCount: 0, errors: [] };
    }

    // Create a default collection for migrated notes
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .insert({
        user_id: userId,
        name: 'Migrated Notes',
        description: 'Notes migrated from local storage',
        color: '#8B5CF6',
        icon: 'Database',
      })
      .select()
      .single();

    if (collectionError) {
      errors.push(`Failed to create collection: ${collectionError.message}`);
    }

    // Migrate each note
    for (const note of localNotes) {
      try {
        const { error } = await supabase.from('notes').insert({
          user_id: userId,
          collection_id: collection?.id,
          title: note.title,
          content: note.content,
          source: note.source || 'local-storage',
          detected_concepts: note.detectedConcepts || [],
          void_resonance_score: note.voidResonanceScore || 0,
          custom_metadata: {
            framework: note.framework,
            original_timestamp: note.timestamp,
            migrated_at: new Date().toISOString(),
          },
        });

        if (error) {
          errors.push(`Failed to migrate note "${note.title}": ${error.message}`);
        } else {
          migratedCount++;
        }
      } catch (err: any) {
        errors.push(`Error migrating note "${note.title}": ${err.message}`);
      }
    }

    // Mark migration as complete
    localStorage.setItem(migrationKey, 'true');
    
    // Optionally backup original data
    localStorage.setItem('notes_backup', notesJson);

    return {
      success: errors.length === 0,
      migratedCount,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      migratedCount,
      errors: [...errors, `Migration failed: ${error.message}`],
    };
  }
}

export function hasLocalStorageNotes(): boolean {
  const notesJson = localStorage.getItem('notes');
  if (!notesJson) return false;
  
  try {
    const notes = JSON.parse(notesJson);
    return Array.isArray(notes) && notes.length > 0;
  } catch {
    return false;
  }
}
