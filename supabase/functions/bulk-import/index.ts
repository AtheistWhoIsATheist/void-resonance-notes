import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportedNote {
  title: string;
  content: string;
  filename: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { notes } = await req.json() as { notes: ImportedNote[] };

    if (!notes || notes.length === 0) {
      return new Response(JSON.stringify({ error: 'No notes provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${notes.length} notes for user ${user.id}`);

    // Get user preferences for AI provider
    const { data: prefs } = await supabaseClient
      .from('user_preferences')
      .select('preferred_ai_provider, default_model, openai_api_key, anthropic_api_key')
      .eq('user_id', user.id)
      .single();

    // Get all existing notes, tags, and collections for the user
    const [notesRes, tagsRes, collectionsRes] = await Promise.all([
      supabaseClient.from('notes').select('id, title, content, detected_concepts').eq('user_id', user.id),
      supabaseClient.from('tags').select('id, name, category, color').eq('user_id', user.id),
      supabaseClient.from('collections').select('id, name, description').eq('user_id', user.id)
    ]);

    const existingNotes = notesRes.data || [];
    const existingTags = tagsRes.data || [];
    const existingCollections = collectionsRes.data || [];

    const processedNotes = [];

    for (const note of notes) {
      try {
        // Analyze note with AI
        const analysisResult = await analyzeNoteWithAI(
          note.content,
          note.title,
          existingNotes,
          existingTags,
          existingCollections,
          prefs
        );

        // Create the note in database
        const { data: createdNote, error: noteError } = await supabaseClient
          .from('notes')
          .insert({
            user_id: user.id,
            title: note.title,
            content: note.content,
            source: `bulk-import:${note.filename}`,
            detected_concepts: analysisResult.concepts,
            void_resonance_score: analysisResult.voidResonanceScore,
            custom_metadata: {
              backlinks: analysisResult.relatedNoteIds,
              import_date: new Date().toISOString(),
              original_filename: note.filename
            }
          })
          .select()
          .single();

        if (noteError) throw noteError;

        // Handle tags
        for (const tagSuggestion of analysisResult.tags) {
          let tagId = existingTags.find(t => t.name.toLowerCase() === tagSuggestion.name.toLowerCase())?.id;
          
          if (!tagId) {
            // Create new tag
            const { data: newTag } = await supabaseClient
              .from('tags')
              .insert({
                user_id: user.id,
                name: tagSuggestion.name,
                category: tagSuggestion.category,
                color: tagSuggestion.color
              })
              .select()
              .single();
            
            if (newTag) {
              tagId = newTag.id;
              existingTags.push(newTag);
            }
          }

          // Link tag to note
          if (tagId) {
            await supabaseClient.from('note_tags').insert({
              note_id: createdNote.id,
              tag_id: tagId
            });
          }
        }

        // Assign collection
        if (analysisResult.collectionId) {
          await supabaseClient
            .from('notes')
            .update({ collection_id: analysisResult.collectionId })
            .eq('id', createdNote.id);
        }

        // Create backlinks in related notes
        for (const relatedNoteId of analysisResult.relatedNoteIds) {
          const relatedNote = existingNotes.find(n => n.id === relatedNoteId);
          if (relatedNote) {
            const currentBacklinks = (relatedNote as any).custom_metadata?.backlinks || [];
            await supabaseClient
              .from('notes')
              .update({
                custom_metadata: {
                  ...(relatedNote as any).custom_metadata,
                  backlinks: [...currentBacklinks, createdNote.id]
                }
              })
              .eq('id', relatedNoteId);
          }
        }

        // Generate embedding for semantic search
        await supabaseClient.functions.invoke('generate-embeddings', {
          body: { noteId: createdNote.id, content: note.content }
        });

        processedNotes.push({
          id: createdNote.id,
          title: note.title,
          tags: analysisResult.tags.length,
          relatedNotes: analysisResult.relatedNoteIds.length,
          voidResonanceScore: analysisResult.voidResonanceScore
        });

      } catch (error) {
        console.error(`Error processing note "${note.title}":`, error);
        processedNotes.push({
          error: error.message,
          title: note.title
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedNotes.length,
        notes: processedNotes
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Bulk import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function analyzeNoteWithAI(
  content: string,
  title: string,
  existingNotes: any[],
  existingTags: any[],
  existingCollections: any[],
  prefs: any
) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  const systemPrompt = `You are an AI assistant specializing in Nihiltheistic philosophy and knowledge organization. Analyze the provided note and return a JSON response with the following structure:

{
  "concepts": ["concept1", "concept2"],
  "voidResonanceScore": 0.0-1.0,
  "tags": [{"name": "tag name", "category": "philosophy|concept|tradition", "color": "#hex"}],
  "collectionSuggestion": "collection name or null",
  "relatedNoteIds": ["note-id-1", "note-id-2"],
  "reasoning": "brief explanation"
}

Existing tags: ${existingTags.map(t => t.name).join(', ')}
Existing collections: ${existingCollections.map(c => `${c.name} (${c.description})`).join('; ')}

Calculate void_resonance_score based on themes of: despair, meaninglessness, transcendence, unknowing, paradox.
Suggest tags from existing ones or propose new ones.
Find conceptually related notes from the existing corpus.`;

  const notesContext = existingNotes.slice(0, 50).map(n => 
    `ID: ${n.id}, Title: ${n.title}, Concepts: ${JSON.stringify(n.detected_concepts)}`
  ).join('\n');

  const userPrompt = `Analyze this note:
Title: ${title}
Content: ${content}

Existing notes for backlink analysis:
${notesContext}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: prefs?.default_model || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      concepts: [],
      voidResonanceScore: 0,
      tags: [],
      collectionSuggestion: null,
      relatedNoteIds: []
    };

    // Find collection ID if suggested
    let collectionId = null;
    if (analysis.collectionSuggestion) {
      const matchingCollection = existingCollections.find(c => 
        c.name.toLowerCase() === analysis.collectionSuggestion.toLowerCase()
      );
      collectionId = matchingCollection?.id || null;
    }

    return {
      concepts: analysis.concepts || [],
      voidResonanceScore: analysis.voidResonanceScore || 0,
      tags: analysis.tags || [],
      collectionId,
      relatedNoteIds: analysis.relatedNoteIds || []
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    // Return defaults if AI fails
    return {
      concepts: [],
      voidResonanceScore: 0,
      tags: [],
      collectionId: null,
      relatedNoteIds: []
    };
  }
}
