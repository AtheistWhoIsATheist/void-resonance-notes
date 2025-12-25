import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

export const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { 
          query: query.trim(),
          matchThreshold: 0.5,
          matchCount: 10
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      
      if (data.results.length === 0) {
        toast({
          title: "No Results",
          description: "No semantically similar notes found. Try a different query.",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${data.results.length} similar note(s).`,
        });
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to perform semantic search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Semantic Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by meaning, not just keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isSearching}
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-primary hover:bg-primary/90"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-contemplative transition-swift">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{result.title}</h4>
                      <Badge variant="secondary" className="ml-2">
                        {Math.round(result.similarity * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {result.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {results.length === 0 && !isSearching && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Search across your notes using AI-powered semantic understanding.
              <br />
              Find notes by meaning, not just exact words.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
