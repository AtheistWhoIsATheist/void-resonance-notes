import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Network, Zap, AlertCircle, ArrowRight, GitBranch } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ForceGraphVisualization } from './ForceGraphVisualization';

interface Note {
  id: string;
  title: string;
  void_resonance_score: number;
}

interface Link {
  id: string;
  source_note_id: string;
  target_note_id: string;
  shared_concepts: any;
  link_strength: number;
  link_type: string;
}

interface Lacuna {
  id: string;
  missing_concept_id: string;
  related_concepts: any;
  suggested_traditions: any;
  priority_score: number;
}

interface Bridge {
  id: string;
  tradition_a: string;
  tradition_b: string;
  bridge_concept: string;
  description: string;
  supporting_note_ids: any;
  resonance_score: number;
}

export const KnowledgeGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [lacunae, setLacunae] = useState<Lacuna[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [noteTags, setNoteTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  useEffect(() => {
    loadGraphData();
  }, []);

  useEffect(() => {
    if (viewMode === '2d' && notes.length > 0 && canvasRef.current) {
      renderGraph();
    }
  }, [notes, links, selectedNode, viewMode]);

  const loadGraphData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [notesRes, linksRes, lacunaeRes, bridgesRes, tagsRes, noteTagsRes] = await Promise.all([
        supabase.from('notes').select('id, title, void_resonance_score, detected_concepts').eq('user_id', user.id),
        supabase.from('note_concept_links').select('*').eq('user_id', user.id),
        supabase.from('conceptual_lacunae').select('*').eq('user_id', user.id).order('priority_score', { ascending: false }),
        supabase.from('cross_tradition_bridges').select('*').eq('user_id', user.id).order('resonance_score', { ascending: false }),
        supabase.from('tags').select('*').eq('user_id', user.id),
        supabase.from('note_tags').select('*')
      ]);

      if (notesRes.data) setNotes(notesRes.data);
      if (linksRes.data) setLinks(linksRes.data);
      if (lacunaeRes.data) setLacunae(lacunaeRes.data);
      if (bridgesRes.data) setBridges(bridgesRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
      if (noteTagsRes.data) setNoteTags(noteTagsRes.data);
    } catch (error) {
      console.error('Error loading graph data:', error);
      toast({
        title: "Error Loading Graph",
        description: "Could not load knowledge graph data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeKnowledgeGraph = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('maintain-knowledge-graph');

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Created ${data.stats.links_created} links, identified ${data.stats.lacunae_identified} gaps, and proposed ${data.stats.bridges_proposed} bridges.`
      });

      await loadGraphData();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze knowledge graph.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    // Simple force-directed layout
    const nodePositions = new Map<string, { x: number; y: number }>();
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.7;

    notes.forEach((note, i) => {
      const angle = (i / notes.length) * 2 * Math.PI;
      nodePositions.set(note.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    });

    // Draw links
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    links.forEach(link => {
      const source = nodePositions.get(link.source_note_id);
      const target = nodePositions.get(link.target_note_id);
      if (source && target) {
        ctx.lineWidth = link.link_strength * 3;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    notes.forEach(note => {
      const pos = nodePositions.get(note.id);
      if (!pos) return;

      const isSelected = selectedNode === note.id;
      const nodeRadius = isSelected ? 12 : 8;
      const score = note.void_resonance_score || 0;

      ctx.fillStyle = score > 70 ? '#8b5cf6' : score > 40 ? '#6366f1' : '#64748b';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw title
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(note.title.substring(0, 20), pos.x, pos.y - 15);
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Void-Resonance Knowledge Atlas</h1>
          <p className="text-muted-foreground">AI-maintained conceptual graph of your philosophical archive</p>
        </div>
        <Button
          onClick={analyzeKnowledgeGraph}
          disabled={isAnalyzing || notes.length === 0}
          className="bg-primary hover:bg-primary/90"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Network className="h-4 w-4 mr-2" />
              Analyze Graph
            </>
          )}
        </Button>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as '3d' | '2d')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="3d">3D Interactive Graph</TabsTrigger>
          <TabsTrigger value="2d">2D Network View</TabsTrigger>
        </TabsList>

        <TabsContent value="3d" className="space-y-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                3D Knowledge Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                  <Network className="h-16 w-16 mb-4 opacity-50" />
                  <p>No notes yet. Create some notes to build your knowledge graph.</p>
                </div>
              ) : (
                <ForceGraphVisualization
                  notes={notes}
                  conceptLinks={links}
                  tags={tags}
                  noteTags={noteTags}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2d" className="space-y-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                2D Conceptual Network
              </CardTitle>
            </CardHeader>
            <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <Network className="h-16 w-16 mb-4 opacity-50" />
                <p>No notes yet. Create some notes to build your knowledge graph.</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-96 bg-background/50 rounded-lg cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  // Simple click detection (would need proper implementation)
                  console.log('Canvas clicked at:', x, y);
                }}
              />
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>High Resonance (&gt;70)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>Medium Resonance (40-70)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span>Low Resonance (&lt;40)</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Insights Panel */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conceptual Lacunae */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                Conceptual Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {lacunae.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No gaps identified yet. Run analysis to discover missing concepts.</p>
                ) : (
                  <div className="space-y-3">
                    {lacunae.slice(0, 5).map((lacuna) => (
                      <div key={lacuna.id} className="p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-foreground">
                            {lacuna.missing_concept_id.replace(/-/g, ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(lacuna.priority_score * 100)}% priority
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(lacuna.suggested_traditions) ? lacuna.suggested_traditions : []).map((tradition: string) => (
                            <Badge key={tradition} variant="secondary" className="text-xs">
                              {tradition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Cross-Tradition Bridges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <ArrowRight className="h-4 w-4 mr-2 text-emerald-500" />
                Cross-Tradition Bridges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {bridges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bridges identified yet. Run analysis to discover connections.</p>
                ) : (
                  <div className="space-y-3">
                    {bridges.slice(0, 5).map((bridge) => (
                      <div key={bridge.id} className="p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-foreground font-medium">{bridge.tradition_a}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground font-medium">{bridge.tradition_b}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {Math.round(bridge.resonance_score * 100)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">{bridge.bridge_concept}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{bridge.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{notes.length}</div>
                  <div className="text-xs text-muted-foreground">Notes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-500">{links.length}</div>
                  <div className="text-xs text-muted-foreground">Links</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-500">{lacunae.length}</div>
                  <div className="text-xs text-muted-foreground">Gaps</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-500">{bridges.length}</div>
                  <div className="text-xs text-muted-foreground">Bridges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
