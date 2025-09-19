import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Tag,
  Brain,
  Zap,
  Eye
} from 'lucide-react';
import { nihiltheismFramework, Note } from '@/lib/nihiltheism-framework';
import { toast } from '@/hooks/use-toast';

export const NotesInterface = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConcepts, setFilterConcepts] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    loadNotes();
    
    // Listen for vault-note-added events
    const handleVaultNoteAdded = (event: any) => {
      const note = event.detail;
      setNotes(prev => [note, ...prev]);
      toast({
        title: "Note Added to Vault",
        description: `"${note.title}" has been added to your collection.`
      });
    };
    
    window.addEventListener('vault-note-added', handleVaultNoteAdded);
    return () => window.removeEventListener('vault-note-added', handleVaultNoteAdded);
  }, []);

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('infinity-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(parsedNotes);
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('infinity-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNote = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Incomplete Note",
        description: "Please provide both title and content.",
        variant: "destructive"
      });
      return;
    }

    const concepts = nihiltheismFramework.detectConcepts(content);
    const voidResonanceScore = nihiltheismFramework.calculateVoidResonanceScore(content, concepts);

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      concepts,
      createdAt: new Date(),
      updatedAt: new Date(),
      densificationLevel: 1,
      voidResonanceScore
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    
    // Clear form
    setTitle('');
    setContent('');
    setTags('');
    setIsEditing(false);

    toast({
      title: "Note Created",
      description: `Detected ${concepts.length} philosophical concepts. Void-Resonance Score: ${voidResonanceScore}/100`
    });
  };

  const updateNote = () => {
    if (!selectedNote || !title.trim() || !content.trim()) return;

    const concepts = nihiltheismFramework.detectConcepts(content);
    const voidResonanceScore = nihiltheismFramework.calculateVoidResonanceScore(content, concepts);

    const updatedNote: Note = {
      ...selectedNote,
      title: title.trim(),
      content: content.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      concepts,
      updatedAt: new Date(),
      voidResonanceScore
    };

    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    );
    
    saveNotes(updatedNotes);
    setSelectedNote(updatedNote);
    setIsEditing(false);

    toast({
      title: "Note Updated",
      description: `Void-Resonance Score: ${voidResonanceScore}/100`
    });
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }

    toast({
      title: "Note Deleted",
      description: "Note removed from your collection."
    });
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(', '));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setTitle('');
    setContent('');
    setTags('');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesConcepts = filterConcepts.length === 0 ||
      filterConcepts.some(concept => note.concepts.includes(concept));

    return matchesSearch && matchesConcepts;
  });

  const getResonanceScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score < 30) return 'resonance-low';
    if (score < 70) return 'resonance-medium';
    return 'resonance-high';
  };

  const allConcepts = nihiltheismFramework.getConcepts();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        
        {/* Notes List Panel */}
        <div className="lg:w-1/3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Notes</h2>
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {allConcepts.slice(0, 6).map((concept) => (
                <Badge
                  key={concept.id}
                  variant={filterConcepts.includes(concept.id) ? "default" : "outline"}
                  className={`cursor-pointer text-xs transition-swift ${
                    concept.category === 'core' ? 'concept-void' :
                    concept.category === 'cross-cultural' ? 'concept-synthesis' :
                    'concept-resonance'
                  }`}
                  onClick={() => {
                    setFilterConcepts(prev => 
                      prev.includes(concept.id) 
                        ? prev.filter(id => id !== concept.id)
                        : [...prev, concept.id]
                    );
                  }}
                >
                  {concept.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id}
                  className={`cursor-pointer transition-contemplative hover:shadow-contemplative ${
                    selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground truncate flex-1">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-2">
                        {note.voidResonanceScore !== undefined && (
                          <Badge variant="outline" className={getResonanceScoreColor(note.voidResonanceScore)}>
                            <Zap className="h-3 w-3 mr-1" />
                            {note.voidResonanceScore}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {note.content}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.concepts.slice(0, 3).map((conceptId) => {
                        const concept = nihiltheismFramework.getConcept(conceptId);
                        return concept ? (
                          <Badge key={conceptId} variant="secondary" className="text-xs">
                            {concept.name}
                          </Badge>
                        ) : null;
                      })}
                      {note.concepts.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.concepts.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{note.updatedAt.toLocaleDateString()}</span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(note);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredNotes.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No notes found</p>
                      <p className="text-sm">
                        {notes.length === 0 
                          ? "Start your philosophical journey by creating your first note."
                          : "Try adjusting your search or filters."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Note Detail/Editor Panel */}
        <div className="lg:w-2/3">
          {isEditing ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedNote ? 'Edit Note' : 'Create New Note'}</span>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={cancelEditing}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={selectedNote ? updateNote : createNote}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {selectedNote ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium"
                />
                <Textarea
                  placeholder="Write your philosophical insights..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] resize-none"
                />
                <Input
                  placeholder="Tags (comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </CardContent>
            </Card>
          ) : selectedNote ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{selectedNote.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Created: {selectedNote.createdAt.toLocaleDateString()}</span>
                      <span>Updated: {selectedNote.updatedAt.toLocaleDateString()}</span>
                      {selectedNote.voidResonanceScore !== undefined && (
                        <Badge className={getResonanceScoreColor(selectedNote.voidResonanceScore)}>
                          <Zap className="h-3 w-3 mr-1" />
                          Resonance: {selectedNote.voidResonanceScore}/100
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => startEditing(selectedNote)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] mb-4">
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {selectedNote.content}
                    </p>
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-3">
                  {selectedNote.concepts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        Detected Concepts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.concepts.map((conceptId) => {
                          const concept = nihiltheismFramework.getConcept(conceptId);
                          return concept ? (
                            <Badge 
                              key={conceptId} 
                              variant="secondary"
                              className={
                                concept.category === 'core' ? 'concept-void' :
                                concept.category === 'cross-cultural' ? 'concept-synthesis' :
                                'concept-resonance'
                              }
                            >
                              {concept.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {selectedNote.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <div className="text-muted-foreground">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl mb-2">Select a Note</h3>
                  <p className="text-sm">
                    Choose a note from the list to view its content and philosophical analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};