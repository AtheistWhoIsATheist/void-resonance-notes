import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useEmbeddings = () => {
  const generateEmbedding = async (noteId: string, content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { noteId, content }
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Embedding generation error:', error);
      toast({
        title: "Embedding Failed",
        description: "Could not generate semantic embedding for this note.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  return { generateEmbedding };
};
