import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Brain, 
  Sparkles, 
  FileText, 
  Layers,
  Download,
  RotateCcw
} from 'lucide-react';
import { nihiltheismFramework, IterativeDensificationResult } from '@/lib/nihiltheism-framework';
import { toast } from '@/hooks/use-toast';

interface DialogueEntry {
  id: string;
  type: 'user' | 'professor';
  content: string;
  timestamp: Date;
  concepts?: string[];
  densificationResult?: IterativeDensificationResult;
}

export const PhilosophyLab = () => {
  const [dialogue, setDialogue] = useState<DialogueEntry[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load previous dialogue
    const savedDialogue = localStorage.getItem('philosophy-lab-dialogue');
    if (savedDialogue) {
      const parsedDialogue = JSON.parse(savedDialogue).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
      setDialogue(parsedDialogue);
    } else {
      // Initialize with welcome message
      const welcomeMessage: DialogueEntry = {
        id: Date.now().toString(),
        type: 'professor',
        content: `Welcome to the Philosophy Laboratory. I am Professor Nihil, your guide through the depths of Nihiltheistic inquiry.

This space is designed for recursive-dialectic exploration of philosophical questions, particularly those concerning void-experience, transcendence, and the paradoxical nature of existence.

**What we can explore together:**
• Existential questions through the Nihiltheism framework
• Iterative densification of complex concepts  
• Cross-cultural synthesis of mystical traditions
• Phenomenological analysis of void-to-resonance transitions

**How to engage:**
Simply pose your question or share your philosophical intuition. I will respond through the lens of Nihiltheistic analysis, and you can request deeper exploration through iterative densification.

What philosophical territory shall we explore first?`,
        timestamp: new Date(),
      };
      setDialogue([welcomeMessage]);
    }
  }, []);

  const saveDialogue = (newDialogue: DialogueEntry[]) => {
    setDialogue(newDialogue);
    localStorage.setItem('philosophy-lab-dialogue', JSON.stringify(newDialogue));
  };

  const generateProfessorResponse = (userQuery: string): string => {
    const concepts = nihiltheismFramework.detectConcepts(userQuery);
    const lowerQuery = userQuery.toLowerCase();
    
    // Analyze query themes
    const hasVoidThemes = ['void', 'empty', 'nothing', 'meaningless', 'nihil'].some(term => 
      lowerQuery.includes(term)
    );
    
    const hasTranscendentThemes = ['transcendent', 'sacred', 'divine', 'spiritual', 'mystical'].some(term => 
      lowerQuery.includes(term)
    );
    
    const hasParadoxThemes = ['paradox', 'contradiction', 'both', 'neither', 'tension'].some(term => 
      lowerQuery.includes(term)
    );

    let response = '';

    if (hasVoidThemes && hasTranscendentThemes) {
      response = `Your inquiry touches the very heart of Nihiltheistic insight - the recognition that void-experience and transcendent encounter are not opposed but intimately related.

The apparent meaninglessness you reference serves as what we might call a **phenomenological aperture** - a privileged site where ordinary consciousness dissolves sufficiently to allow deeper dimensions of reality to emerge.

Consider: Is the void you experience mere absence, or might it be pregnant with possibilities not yet recognized by conceptual mind? The mystical traditions suggest that what appears as pure negation often functions as the threshold to radical affirmation.`;
    } else if (hasVoidThemes) {
      response = `The void-experience you describe is significant philosophically. Rather than mere absence, Nihiltheism recognizes such experiences as potentially revelatory.

**Key considerations:**
• The void as foundational openness rather than simple negation
• Emptiness as space for emergence rather than mere lack
• The relationship between apparent meaninglessness and hidden significance

What emerges when you sit with this void-experience without immediately trying to fill it or escape from it?`;
    } else if (hasTranscendentThemes) {
      response = `Your question regarding transcendence invites us to examine the nature of the sacred in our contemporary context.

From a Nihiltheistic perspective, authentic transcendent encounter often emerges precisely through - not in spite of - experiences of meaninglessness, dissolution, or existential crisis.

**Phenomenological markers of authentic transcendence:**
• Disruption of ordinary reference points
• Expansion of awareness beyond ego-boundaries  
• Recognition of interconnectedness previously hidden
• Integration of opposites (void/fullness, absence/presence)

How does this resonate with your own experience of the transcendent?`;
    } else if (concepts.length > 0) {
      const concept = nihiltheismFramework.getConcept(concepts[0]);
      response = `Your inquiry engages with the ${concept?.name} aspect of our framework.

${concept?.description}

This connects to broader questions about ${concept?.crossReferences.join(', ')} and invites deeper exploration through our iterative densification methodology.

Would you like to pursue this thread further through systematic analysis?`;
    } else {
      response = `Your question opens interesting philosophical territory. Let me approach it through the Nihiltheistic lens.

Every genuine philosophical inquiry contains implicit assumptions about the nature of reality, consciousness, and meaning. Often, the most fruitful exploration begins by examining what we take for granted.

**Methodological approach:**
1. **Conceptual Mapping**: What key concepts and assumptions underlie your question?
2. **Cross-Cultural Synthesis**: How might different wisdom traditions illuminate this issue?
3. **Phenomenological Analysis**: What is the lived experience of this question?

Would you like to explore any of these dimensions more deeply?`;
    }

    return response;
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);

    // Add user message
    const userMessage: DialogueEntry = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date(),
    };

    // Generate professor response
    const professorResponse = generateProfessorResponse(userInput);
    const concepts = nihiltheismFramework.detectConcepts(userInput);
    
    const professorMessage: DialogueEntry = {
      id: (Date.now() + 1).toString(),
      type: 'professor',
      content: professorResponse,
      timestamp: new Date(),
      concepts,
    };

    const newDialogue = [...dialogue, userMessage, professorMessage];
    saveDialogue(newDialogue);

    setUserInput('');
    setIsProcessing(false);

    // Scroll to bottom
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const performDensification = (entry: DialogueEntry) => {
    if (entry.type !== 'user') return;

    const result = nihiltheismFramework.performIterativeDensification(entry.content);
    const updatedDialogue = dialogue.map(item => 
      item.id === entry.id 
        ? { ...item, densificationResult: result }
        : item
    );
    
    saveDialogue(updatedDialogue);
    
    toast({
      title: "Iterative Densification Complete",
      description: "Three levels of philosophical analysis have been applied."
    });
  };

  const insertToNotes = (content: string, title?: string) => {
    const concepts = nihiltheismFramework.detectConcepts(content);
    const voidResonanceScore = nihiltheismFramework.calculateVoidResonanceScore(content, concepts);

    const newNote = {
      id: Date.now().toString(),
      title: title || `Philosophy Lab Insight - ${new Date().toLocaleDateString()}`,
      content,
      tags: ['philosophy-lab', 'generated'],
      concepts,
      createdAt: new Date(),
      updatedAt: new Date(),
      densificationLevel: 1,
      voidResonanceScore
    };

    const existingNotes = localStorage.getItem('infinity-notes');
    const notes = existingNotes ? JSON.parse(existingNotes) : [];
    const updatedNotes = [newNote, ...notes];
    
    localStorage.setItem('infinity-notes', JSON.stringify(updatedNotes));
    
    toast({
      title: "Inserted to Notes",
      description: `Content saved with ${concepts.length} detected concepts.`
    });
  };

  const clearDialogue = () => {
    setDialogue([]);
    localStorage.removeItem('philosophy-lab-dialogue');
    toast({
      title: "Dialogue Cleared",
      description: "Philosophy Lab conversation has been reset."
    });
  };

  const exportDialogue = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      dialogue: dialogue
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `philosophy-lab-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Philosophy Laboratory</h1>
          <p className="text-muted-foreground">
            Recursive-dialectic exploration with Professor Nihil
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportDialogue} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={clearDialogue} size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Dialogue */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-resonance" />
                Philosophical Dialogue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-20rem)] px-6" ref={scrollAreaRef}>
                <div className="space-y-6 pb-4">
                  {dialogue.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${
                        entry.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card border'
                      } rounded-lg p-4 transition-contemplative`}>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {entry.type === 'user' ? 'You' : 'Professor Nihil'}
                            </span>
                            <span className="text-xs opacity-70">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {entry.type === 'user' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => performDensification(entry)}
                                className="h-6 w-6 p-0"
                                title="Perform Iterative Densification"
                              >
                                <Layers className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => insertToNotes(entry.content)}
                                className="h-6 w-6 p-0"
                                title="Insert to Notes"
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="prose prose-sm prose-invert max-w-none">
                          <p className="whitespace-pre-wrap leading-relaxed mb-0">
                            {entry.content}
                          </p>
                        </div>

                        {entry.concepts && entry.concepts.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex flex-wrap gap-1">
                              {entry.concepts.map((conceptId) => {
                                const concept = nihiltheismFramework.getConcept(conceptId);
                                return concept ? (
                                  <Badge key={conceptId} variant="secondary" className="text-xs">
                                    {concept.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {entry.densificationResult && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <h4 className="font-medium text-sm mb-3 flex items-center">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Iterative Densification Analysis
                            </h4>
                            <div className="space-y-3">
                              {entry.densificationResult.iterations.map((iteration) => (
                                <div key={iteration.level} className="bg-muted/30 rounded p-3">
                                  <h5 className="font-medium text-xs mb-2">
                                    Level {iteration.level}: {iteration.title}
                                  </h5>
                                  <p className="text-xs leading-relaxed">
                                    {iteration.content}
                                  </p>
                                </div>
                              ))}
                              <div className="bg-resonance/10 rounded p-3">
                                <h5 className="font-medium text-xs mb-2 text-resonance">
                                  Synthesis Insight
                                </h5>
                                <p className="text-xs leading-relaxed">
                                  {entry.densificationResult.synthesisInsight}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />
              
              <div className="p-6">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Share your philosophical inquiry or existential question..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || isProcessing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Ctrl+Enter to send • Use the icons to densify or save responses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Framework Reference */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">NT Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nihiltheismFramework.getConcepts().slice(0, 7).map((concept) => (
                  <div key={concept.id} className="p-3 bg-muted/30 rounded">
                    <h4 className={`font-medium text-sm mb-1 ${
                      concept.category === 'core' ? 'concept-void' :
                      concept.category === 'cross-cultural' ? 'concept-synthesis' :
                      'concept-resonance'
                    }`}>
                      {concept.name}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {concept.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Starters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "What is the relationship between emptiness and transcendence?",
                  "How does nihilistic experience open space for the sacred?",
                  "Explore the paradox of meaningful meaninglessness.",
                  "Analyze void-experience through cross-cultural lens."
                ].map((starter, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => setUserInput(starter)}
                  >
                    <div className="text-xs leading-relaxed">
                      {starter}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};