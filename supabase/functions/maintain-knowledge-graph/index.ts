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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Fetching user notes for knowledge graph analysis...');

    // Fetch all user notes with detected concepts
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, content, detected_concepts, void_resonance_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (notesError) throw notesError;

    if (!notes || notes.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No notes to analyze' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${notes.length} notes for conceptual relationships...`);

    // Prepare context for AI analysis
    const notesContext = notes.map(n => ({
      id: n.id,
      title: n.title,
      concepts: n.detected_concepts || [],
      resonance: n.void_resonance_score || 0
    }));

    const prompt = `You are a philosophical knowledge graph analyst specializing in Nihiltheism and cross-cultural philosophy.

Analyze these ${notes.length} scholarly notes and identify:

1. **Conceptual Links**: Which notes share deep conceptual resonances? Calculate link strength (0-1) based on shared concepts and thematic coherence.

2. **Conceptual Lacunae**: What important philosophical concepts are MISSING from this collection? Consider:
   - Core Nihiltheism concepts (void, resonance, paradox)
   - Cross-cultural bridges (Sunyata, Fana, Maya, etc.)
   - Methodological gaps (phenomenology, hermeneutics)

3. **Cross-Tradition Bridges**: What novel connections can be made between different philosophical traditions represented in these notes?

Notes data:
${JSON.stringify(notesContext, null, 2)}

Respond with a JSON object:
{
  "links": [
    {
      "source_note_id": "uuid",
      "target_note_id": "uuid",
      "shared_concepts": ["concept1", "concept2"],
      "link_strength": 0.85,
      "link_type": "conceptual" | "thematic" | "methodological"
    }
  ],
  "lacunae": [
    {
      "missing_concept_id": "concept-slug",
      "concept_name": "Concept Name",
      "related_concepts": ["existing-concept1", "existing-concept2"],
      "suggested_traditions": ["Buddhism", "Sufism"],
      "priority_score": 0.75,
      "reason": "Why this gap matters"
    }
  ],
  "bridges": [
    {
      "tradition_a": "Buddhism",
      "tradition_b": "Existentialism",
      "bridge_concept": "Void as Liberation",
      "description": "How these traditions connect",
      "supporting_note_ids": ["uuid1", "uuid2"],
      "resonance_score": 0.9
    }
  ]
}`;

    // Call Lovable AI for analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert philosophical knowledge graph analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to analyze knowledge graph');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;

    // Parse JSON from AI response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    console.log(`Analysis complete: ${analysis.links?.length || 0} links, ${analysis.lacunae?.length || 0} lacunae, ${analysis.bridges?.length || 0} bridges`);

    // Store concept links
    if (analysis.links && analysis.links.length > 0) {
      const linksToInsert = analysis.links.map((link: any) => ({
        source_note_id: link.source_note_id,
        target_note_id: link.target_note_id,
        user_id: user.id,
        shared_concepts: link.shared_concepts || [],
        link_strength: link.link_strength || 0.5,
        link_type: link.link_type || 'conceptual',
        ai_generated: true
      }));

      const { error: linksError } = await supabase
        .from('note_concept_links')
        .upsert(linksToInsert, { onConflict: 'source_note_id,target_note_id' });

      if (linksError) console.error('Error inserting links:', linksError);
    }

    // Store conceptual lacunae
    if (analysis.lacunae && analysis.lacunae.length > 0) {
      const lacunaeToInsert = analysis.lacunae.map((lacuna: any) => ({
        user_id: user.id,
        missing_concept_id: lacuna.missing_concept_id,
        related_concepts: lacuna.related_concepts || [],
        suggested_traditions: lacuna.suggested_traditions || [],
        priority_score: lacuna.priority_score || 0.5,
        notes_count: notes.length
      }));

      const { error: lacunaeError } = await supabase
        .from('conceptual_lacunae')
        .upsert(lacunaeToInsert, { onConflict: 'user_id,missing_concept_id' });

      if (lacunaeError) console.error('Error inserting lacunae:', lacunaeError);
    }

    // Store cross-tradition bridges
    if (analysis.bridges && analysis.bridges.length > 0) {
      const bridgesToInsert = analysis.bridges.map((bridge: any) => ({
        user_id: user.id,
        tradition_a: bridge.tradition_a,
        tradition_b: bridge.tradition_b,
        bridge_concept: bridge.bridge_concept,
        description: bridge.description,
        supporting_note_ids: bridge.supporting_note_ids || [],
        resonance_score: bridge.resonance_score || 0.5,
        ai_generated: true
      }));

      const { error: bridgesError } = await supabase
        .from('cross_tradition_bridges')
        .insert(bridgesToInsert);

      if (bridgesError) console.error('Error inserting bridges:', bridgesError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          notes_analyzed: notes.length,
          links_created: analysis.links?.length || 0,
          lacunae_identified: analysis.lacunae?.length || 0,
          bridges_proposed: analysis.bridges?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Knowledge graph maintenance error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
