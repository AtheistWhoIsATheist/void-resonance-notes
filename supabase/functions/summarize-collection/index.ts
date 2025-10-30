import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { collectionId } = await req.json();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Fetching collection and notes...');

    // Fetch collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single();

    if (collectionError || !collection) {
      throw new Error('Collection not found');
    }

    // Fetch all notes in collection
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('title, content, detected_concepts, void_resonance_score')
      .eq('collection_id', collectionId)
      .eq('user_id', user.id);

    if (notesError) {
      throw notesError;
    }

    if (!notes || notes.length === 0) {
      throw new Error('No notes found in collection');
    }

    console.log(`Summarizing ${notes.length} notes...`);

    // Prepare context for AI
    const notesContext = notes.map((note, idx) => 
      `Note ${idx + 1}: ${note.title}\n${note.content}\nConcepts: ${(note.detected_concepts || []).join(', ')}\nResonance: ${note.void_resonance_score || 'N/A'}`
    ).join('\n\n---\n\n');

    // Generate summary using Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a philosophical AI assistant. Analyze the provided collection of notes and create a comprehensive summary that captures the main themes, insights, and interconnections between concepts. Focus on philosophical depth and void-resonance theory if applicable.'
          },
          {
            role: 'user',
            content: `Please summarize this collection titled "${collection.name}":\n\n${notesContext}`
          }
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
    const summary = data.choices[0].message.content;

    // Update collection with summary
    const { error: updateError } = await supabase
      .from('collections')
      .update({ 
        ai_summary: summary,
        summary_generated_at: new Date().toISOString()
      })
      .eq('id', collectionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('Successfully generated collection summary');

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Collection summary error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
