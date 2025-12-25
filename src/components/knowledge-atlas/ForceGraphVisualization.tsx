import { useEffect, useRef, useState, useMemo } from 'react';
// @ts-ignore - react-force-graph-3d types
import ForceGraph3D from 'react-force-graph-3d';
// @ts-ignore - three types
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Orbit, ZoomIn, ZoomOut } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  detected_concepts?: any;
  void_resonance_score?: number;
}

interface ConceptLink {
  id: string;
  source_note_id: string;
  target_note_id: string;
  link_strength: number;
  link_type: string;
  shared_concepts?: any;
}

interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
}

interface NoteTags {
  note_id: string;
  tag_id: string;
}

interface GraphNode {
  id: string;
  name: string;
  type: 'note' | 'concept' | 'tag';
  val: number;
  color: string;
  resonance?: number;
  metadata?: any;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  type: string;
  color: string;
}

interface ForceGraphVisualizationProps {
  notes: Note[];
  conceptLinks: ConceptLink[];
  tags: Tag[];
  noteTags: NoteTags[];
}

export const ForceGraphVisualization = ({ 
  notes, 
  conceptLinks, 
  tags, 
  noteTags 
}: ForceGraphVisualizationProps) => {
  const fgRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();

    // Add note nodes
    notes.forEach(note => {
      const resonance = note.void_resonance_score || 0;
      const nodeId = `note-${note.id}`;
      nodeIds.add(nodeId);
      
      nodes.push({
        id: nodeId,
        name: note.title,
        type: 'note',
        val: 10 + (resonance * 20), // Size based on resonance
        color: resonance > 0.7 ? '#8b5cf6' : resonance > 0.4 ? '#3b82f6' : '#6b7280',
        resonance,
        metadata: note
      });

      // Extract concepts from detected_concepts
      if (note.detected_concepts && Array.isArray(note.detected_concepts)) {
        note.detected_concepts.forEach((concept: string) => {
          const conceptId = `concept-${concept}`;
          
          if (!nodeIds.has(conceptId)) {
            nodeIds.add(conceptId);
            nodes.push({
              id: conceptId,
              name: concept,
              type: 'concept',
              val: 8,
              color: '#f59e0b',
              metadata: { concept }
            });
          }

          // Link note to concept
          links.push({
            source: nodeId,
            target: conceptId,
            value: 2,
            type: 'has-concept',
            color: 'rgba(245, 158, 11, 0.3)'
          });
        });
      }
    });

    // Add concept links between notes
    conceptLinks.forEach(link => {
      const sourceId = `note-${link.source_note_id}`;
      const targetId = `note-${link.target_note_id}`;
      
      if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
        links.push({
          source: sourceId,
          target: targetId,
          value: link.link_strength * 5,
          type: link.link_type,
          color: link.link_type === 'resonance' ? 'rgba(139, 92, 246, 0.6)' : 
                 link.link_type === 'tension' ? 'rgba(239, 68, 68, 0.6)' :
                 'rgba(59, 130, 246, 0.4)'
        });
      }
    });

    // Add tag nodes
    tags.forEach(tag => {
      const tagId = `tag-${tag.id}`;
      nodeIds.add(tagId);
      
      nodes.push({
        id: tagId,
        name: tag.name,
        type: 'tag',
        val: 6,
        color: tag.color || '#10b981',
        metadata: tag
      });
    });

    // Link notes to tags
    noteTags.forEach(nt => {
      const noteId = `note-${nt.note_id}`;
      const tagId = `tag-${nt.tag_id}`;
      
      if (nodeIds.has(noteId) && nodeIds.has(tagId)) {
        links.push({
          source: noteId,
          target: tagId,
          value: 1,
          type: 'tagged-with',
          color: 'rgba(16, 185, 129, 0.3)'
        });
      }
    });

    return { nodes, links };
  }, [notes, conceptLinks, tags, noteTags]);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    
    // Highlight connected nodes
    const connectedNodes = new Set([node.id]);
    const connectedLinks = new Set();
    
    graphData.links.forEach(link => {
      const linkSource: any = link.source;
      const linkTarget: any = link.target;
      
      const sourceId = typeof linkSource === 'object' && linkSource ? linkSource.id : linkSource;
      const targetId = typeof linkTarget === 'object' && linkTarget ? linkTarget.id : linkTarget;
      
      if (sourceId === node.id) {
        connectedLinks.add(link);
        connectedNodes.add(targetId);
      }
      if (targetId === node.id) {
        connectedLinks.add(link);
        connectedNodes.add(sourceId);
      }
    });
    
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  };

  const zoomToFit = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomToFit}
          className="backdrop-blur-sm bg-background/80"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Fit
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="backdrop-blur-sm bg-background/80"
        >
          {isFullscreen ? (
            <><Minimize2 className="h-4 w-4 mr-2" />Exit</>
          ) : (
            <><Orbit className="h-4 w-4 mr-2" />Fullscreen</>
          )}
        </Button>
      </div>

      {selectedNode && (
        <Card className="absolute top-4 left-4 z-10 p-4 max-w-sm backdrop-blur-sm bg-background/95">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={
                selectedNode.type === 'note' ? 'default' : 
                selectedNode.type === 'concept' ? 'secondary' : 
                'outline'
              }>
                {selectedNode.type}
              </Badge>
              <h3 className="font-semibold text-sm">{selectedNode.name}</h3>
            </div>
            
            {selectedNode.type === 'note' && selectedNode.resonance !== undefined && (
              <div className="text-xs text-muted-foreground">
                Void Resonance: {(selectedNode.resonance * 100).toFixed(0)}%
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {graphData.links.filter(l => {
                const lSource: any = l.source;
                const lTarget: any = l.target;
                const sourceId = typeof lSource === 'object' && lSource ? lSource.id : lSource;
                const targetId = typeof lTarget === 'object' && lTarget ? lTarget.id : lTarget;
                return sourceId === selectedNode.id || targetId === selectedNode.id;
              }).length} connections
            </div>
          </div>
        </Card>
      )}

      <div className={isFullscreen ? 'h-screen' : 'h-[600px]'}>
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="name"
          nodeAutoColorBy="type"
          nodeVal="val"
          nodeColor={(node: any) => {
            if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) {
              return 'rgba(100, 100, 100, 0.3)';
            }
            return node.color;
          }}
          nodeOpacity={1}
          linkColor={(link: any) => {
            if (highlightLinks.size > 0 && !highlightLinks.has(link)) {
              return 'rgba(100, 100, 100, 0.1)';
            }
            return link.color;
          }}
          linkWidth={(link: any) => link.value}
          linkOpacity={0.6}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) ? 2 : 0}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          backgroundColor="rgba(0,0,0,0)"
          nodeThreeObject={(node: any) => {
            const sprite = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(
                  generateNodeTexture(node.name, node.type)
                ),
                transparent: true,
                opacity: highlightNodes.size > 0 && !highlightNodes.has(node.id) ? 0.3 : 1
              })
            );
            sprite.scale.set(12, 12, 1);
            return sprite;
          }}
          enableNavigationControls={true}
          showNavInfo={false}
        />
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex gap-4">
        <Card className="p-3 backdrop-blur-sm bg-background/90">
          <div className="text-xs space-y-1">
            <div className="font-semibold mb-2">Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>High Resonance Note</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Medium Resonance Note</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Low Resonance Note</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Concept</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Tag</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

function generateNodeTexture(label: string, type: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 256;
  canvas.height = 256;

  // Background circle
  ctx.fillStyle = type === 'note' ? '#1e293b' : 
                  type === 'concept' ? '#451a03' : '#064e3b';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, 2 * Math.PI);
  ctx.fill();

  // Border
  ctx.strokeStyle = type === 'note' ? '#3b82f6' : 
                    type === 'concept' ? '#f59e0b' : '#10b981';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Truncate long labels
  const maxLength = 12;
  const displayLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
  
  ctx.fillText(displayLabel, 128, 128);

  return canvas;
}
