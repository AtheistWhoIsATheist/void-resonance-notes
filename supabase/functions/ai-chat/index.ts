import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_ROLES = new Set(["user", "assistant"]);
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_SYSTEM_PROMPT_CHARS = 8_000;

type IncomingMessage = {
  role?: string;
  content?: string;
};

const normalizeMessages = (messages: unknown): Array<{ role: string; content: string }> => {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((item): item is IncomingMessage => Boolean(item && typeof item === "object"))
    .map((item) => ({
      role: ALLOWED_ROLES.has(item.role ?? "") ? (item.role as string) : "user",
      content: typeof item.content === "string" ? item.content.trim().slice(0, MAX_MESSAGE_CHARS) : "",
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_MESSAGES);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      messages,
      model = 'google/gemini-2.5-flash',
      includeContext = false,
      systemPrompt: customSystemPrompt,
    } = await req.json();
    const safeMessages = normalizeMessages(messages);

    if (!safeMessages.length) {
      return new Response(
        JSON.stringify({ error: 'No valid messages were provided.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt with optional context
    let systemPrompt = (typeof customSystemPrompt === 'string' ? customSystemPrompt : '') ||
      'You are a philosophical AI assistant specializing in nihilism, existentialism, and void-resonance theory. Provide thoughtful, nuanced insights.';
    systemPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT_CHARS);
    
    if (includeContext) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.4');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && !userError) {
        console.log('Fetching user context for AI chat...');
        
        // Fetch recent notes for context
        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select('title, content, detected_concepts, void_resonance_score')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (!notesError && notes && notes.length > 0) {
          const notesContext = notes.map(note => 
            `- ${note.title}: ${note.content.substring(0, 200)}... (Concepts: ${(note.detected_concepts || []).join(', ')}, Resonance: ${note.void_resonance_score || 'N/A'})`
          ).join('\n');
          
          systemPrompt += `\n\nYou have access to the user's recent philosophical notes:\n${notesContext}\n\nUse this context to provide more personalized and contextually relevant responses.`;
          systemPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT_CHARS);
        }

        // Fetch user's tags for additional context
        const { data: tags, error: tagsError } = await supabase
          .from('tags')
          .select('name, category')
          .eq('user_id', user.id)
          .limit(20);

        if (!tagsError && tags && tags.length > 0) {
          const tagsContext = tags.map(tag => tag.name).join(', ');
          systemPrompt += `\n\nUser's philosophical interests/tags: ${tagsContext}`;
          systemPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT_CHARS);
        }
      }
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...safeMessages,
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
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
