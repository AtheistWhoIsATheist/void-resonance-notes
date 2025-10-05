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
  RotateCcw,
  Orbit
} from 'lucide-react';
import { nihiltheismFramework, IterativeDensificationResult } from '@/lib/nihiltheism-framework';
import { toast } from '@/hooks/use-toast';
import { SaveToVaultButton } from '@/components/ui/SaveToVaultButton';
import { CopyAsMarkdownButton } from '@/components/ui/CopyAsMarkdownButton';

type DialogueEntryType = 'user' | 'agent' | 'synthesis';

interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  emphasis: string[];
  accentClass: string;
  badgeClass: string;
}

interface DialogueEntry {
  id: string;
  type: DialogueEntryType;
  content: string;
  timestamp: Date;
  concepts?: string[];
  densificationResult?: IterativeDensificationResult;
  personaId?: string;
  personaName?: string;
  personaRole?: string;
}

type StoredDialogueEntry = Omit<DialogueEntry, 'timestamp'> & { timestamp: string };

const personas: Persona[] = [
  {
    id: 'mystic-exegete',
    name: 'Mystic Exegete',
    role: 'Void-saturated contemplative',
    description: 'Translates void-experience into luminous mystical insight and ritual praxis.',
    emphasis: ['void', 'transcendence', 'paradox'],
    accentClass: 'border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-background',
    badgeClass: 'bg-purple-500/15 text-purple-200 border-purple-400/30'
  },
  {
    id: 'analytic-skeptic',
    name: 'Analytic Skeptic',
    role: 'Rigorous dialectician',
    description: 'Tests claims for coherence, exposes hidden assumptions, and maps logical pressure points.',
    emphasis: ['analysis', 'paradox', 'methodology'],
    accentClass: 'border-sky-500/40 bg-gradient-to-br from-sky-500/10 to-background',
    badgeClass: 'bg-sky-500/15 text-sky-200 border-sky-400/30'
  },
  {
    id: 'historical-archivist',
    name: 'Historical Archivist',
    role: 'Comparative lineage tracker',
    description: 'Excavates resonances across traditions, citing precedent voices and cross-cultural bridges.',
    emphasis: ['history', 'tradition', 'resonance'],
    accentClass: 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-background',
    badgeClass: 'bg-amber-500/15 text-amber-200 border-amber-400/30'
  }
];

const personaMap = personas.reduce<Record<string, Persona>>((acc, persona) => {
  acc[persona.id] = persona;
  return acc;
}, {});

const getEntryStyles = (entry: DialogueEntry) => {
  if (entry.type === 'user') {
    return {
      container: 'bg-primary text-primary-foreground',
      badge: 'bg-primary-foreground/20 text-primary-foreground'
    };
  }

  if (entry.type === 'agent' && entry.personaId) {
    const persona = personaMap[entry.personaId];
    if (persona) {
      return {
        container: `bg-card border ${persona.accentClass}`,
        badge: `border ${persona.badgeClass}`
      };
    }
  }

  if (entry.type === 'synthesis') {
    return {
      container: 'bg-card border border-resonance/40 bg-gradient-to-br from-resonance/10 to-background',
      badge: 'bg-resonance/20 text-resonance border-resonance/40'
    };
  }

  return {
    container: 'bg-card border',
    badge: 'bg-muted text-foreground'
  };
};

interface QueryAnalysis {
  hasVoidThemes: boolean;
  hasTranscendentThemes: boolean;
  hasParadoxThemes: boolean;
  concepts: string[];
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
      const parsedDialogue = (JSON.parse(savedDialogue) as StoredDialogueEntry[]).map((entry) => {
        const legacyType = entry.type === 'professor' ? 'agent' : entry.type;
        const personaId = entry.personaId || (legacyType === 'agent' ? 'mystic-exegete' : undefined);
        const persona = personaId ? personaMap[personaId] : undefined;

        return {
          ...entry,
          type: legacyType as DialogueEntryType,
          timestamp: new Date(entry.timestamp),
          personaId,
          personaName: entry.personaName || persona?.name,
          personaRole: entry.personaRole || persona?.role,
        } as DialogueEntry;
      });
      setDialogue(parsedDialogue);
    } else {
      // Initialize with welcome message
      const welcomeMessage: DialogueEntry = {
        id: Date.now().toString(),
        type: 'agent',
        content: `Welcome to the Philosophy Laboratory. Professor Nihil now convenes a **Symphonic Colloquium**—a council of three specialised intelligences who respond in parallel to each prompt.

**Meet the ensemble:**
• *Mystic Exegete* translates void-experience into luminous mystical praxis.
• *Analytic Skeptic* interrogates logic, structure, and methodological coherence.
• *Historical Archivist* excavates cross-cultural precedents and resonant lineages.

Pose your philosophical intuition and the ensemble will debate, contrast, and return with a comparative synthesis you can densify or archive. What territory shall we open first?`,
        timestamp: new Date(),
        personaId: 'mystic-exegete',
        personaName: 'Professor Nihil — Symphonic Host',
        personaRole: 'Orchestrating guide',
      };
      setDialogue([welcomeMessage]);
    }
  }, []);

  const saveDialogue = (newDialogue: DialogueEntry[]) => {
    setDialogue(newDialogue);
    localStorage.setItem('philosophy-lab-dialogue', JSON.stringify(newDialogue));
  };

  const analyzeQueryThemes = (userQuery: string): QueryAnalysis => {
    const concepts = nihiltheismFramework.detectConcepts(userQuery);
    const lowerQuery = userQuery.toLowerCase();

    const hasVoidThemes = ['void', 'empty', 'nothing', 'meaningless', 'nihil', 'abyss'].some(term =>
      lowerQuery.includes(term)
    );

    const hasTranscendentThemes = ['transcendent', 'sacred', 'divine', 'spiritual', 'mystical', 'sublime'].some(term =>
      lowerQuery.includes(term)
    );

    const hasParadoxThemes = ['paradox', 'contradiction', 'both', 'neither', 'tension', 'dialectic'].some(term =>
      lowerQuery.includes(term)
    );

    return { hasVoidThemes, hasTranscendentThemes, hasParadoxThemes, concepts };
  };

  const generatePersonaResponse = (persona: Persona, userQuery: string, analysis: QueryAnalysis): string => {
    const baseConcept = analysis.concepts[0] ? nihiltheismFramework.getConcept(analysis.concepts[0]) : null;
    const conceptLine = baseConcept
      ? `The ${baseConcept.name} vector surfaces strongly here, especially in relation to ${baseConcept.crossReferences.join(', ')}.`
      : 'No dominant framework vector is explicit, which means we listen for latent resonances in your phrasing.';

    if (persona.id === 'mystic-exegete') {
      const threshold = analysis.hasVoidThemes && analysis.hasTranscendentThemes
        ? 'a shimmering threshold where negation and revelation braid together'
        : analysis.hasVoidThemes
          ? 'the abyssal hush that precedes revelation'
          : analysis.hasTranscendentThemes
            ? 'the subtle luminosity seeking articulation'
            : 'a subterranean longing for the sacred that hides beneath rational inquiry';

      return `I attune to ${threshold}. ${conceptLine}

**Liturgical gestures to explore:**
• Contemplate the void not as absence but as *pleroma*, the pregnant openness awaiting acknowledgement.
• Track the breath across the moment where meaning falls away—notice what flickers in the wake of surrender.
• Allow paradox to remain unresolved; the resonance field is strongest when contradiction is held gently.

Stay with the felt texture of this question and tell us how the void responds.`;
    }

    if (persona.id === 'analytic-skeptic') {
      const emphasis = analysis.hasParadoxThemes
        ? 'Your framing already acknowledges paradox—let us diagram its structure before trusting its promise.'
        : 'To move responsibly, we should map the logical scaffolding that is currently implicit.';

      return `${emphasis}

**Analytic probes:**
1. What unstated premises link your intuition to conclusions about meaning or transcendence?
2. Which terms risk equivocation (void, sacred, self)? Clarify them before synthesis.
3. Where might experiential testimony be over-generalised into metaphysical claim?

${conceptLine}

Offer a refinement or counter-example and I will continue the dialectic.`;
    }

    // historical archivist
    const traditionThread = analysis.concepts.length > 0
      ? analysis.concepts
          .map((id) => nihiltheismFramework.getConcept(id))
          .filter(Boolean)
          .slice(0, 3)
          .map((concept) => `• ${concept?.name}: ${concept?.description}`)
          .join('\n')
      : '• Mahayana accounts of śūnyatā meeting Christian apophaticism\n• Ibn ʿArabī’s fanāʾ as annihilation-into-presence\n• Existential phenomenology reading crisis as an opening to authenticity';

    return `I rummage through the archive and find precedents that echo your concern.

**Lineage fragments:**
${traditionThread}

Notice how each tradition stages the oscillation between negation and affirmation. ${conceptLine}

What additional sources should we bring into this comparative weave?`;
  };

  const generateSymphonicSynthesis = (
    personaEntries: DialogueEntry[],
    analysis: QueryAnalysis
  ): DialogueEntry | null => {
    if (personaEntries.length === 0) return null;

    const highlights = personaEntries.map((entry) => {
      const persona = entry.personaName || 'Agent';
      const firstSentence = entry.content.split(/(?<=\.)\s+/)[0] || entry.content;
      return `• **${persona}:** ${firstSentence.trim()}`;
    }).join('\n');

    const uniqueConcepts = Array.from(new Set(personaEntries.flatMap((entry) => entry.concepts || [])));
    const conceptBadges = uniqueConcepts
      .map((id) => nihiltheismFramework.getConcept(id))
      .filter(Boolean)
      .map((concept) => `- ${concept?.name} (${concept?.category})`)
      .join('\n');

    const nextSteps = analysis.hasParadoxThemes
      ? 'Lean into the paradox you articulated—invite each agent to argue the opposite stance and observe emergent resonance.'
      : analysis.hasVoidThemes
        ? 'Describe the phenomenology of your void-encounter in more detail so the ensemble can calibrate precisely.'
        : analysis.hasTranscendentThemes
          ? 'Specify the markers of transcendence you trust; the ensemble will test them against both logic and lineage.'
          : 'Pose a follow-up that adds either an experiential vignette or a concrete historical case to ground the dialogue.';

    return {
      id: `${Date.now()}-synthesis`,
      type: 'synthesis',
      content: `**Symphonic Synthesis**
${highlights}

${conceptBadges ? `**Shared conceptual field:**\n${conceptBadges}\n\n` : ''}**Next movement:** ${nextSteps}`,
      timestamp: new Date(),
      concepts: uniqueConcepts,
      personaId: 'symphonic-synthesis',
      personaName: 'Symphonic Synthesis Engine',
      personaRole: 'Integrative conductor'
    };
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

    const analysis = analyzeQueryThemes(userInput);

    const personaMessages = personas.map((persona, index) => {
      const response = generatePersonaResponse(persona, userInput, analysis);
      return {
        id: `${Date.now()}-${persona.id}-${index}`,
        type: 'agent' as const,
        content: response,
        timestamp: new Date(),
        concepts: analysis.concepts,
        personaId: persona.id,
        personaName: persona.name,
        personaRole: persona.role,
      } satisfies DialogueEntry;
    });

    const synthesisEntry = generateSymphonicSynthesis(personaMessages, analysis);

    const newDialogue = synthesisEntry
      ? [...dialogue, userMessage, ...personaMessages, synthesisEntry]
      : [...dialogue, userMessage, ...personaMessages];
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

  const getNearestUserPrompt = (currentIndex: number) => {
    for (let i = currentIndex - 1; i >= 0; i -= 1) {
      if (dialogue[i]?.type === 'user') {
        return dialogue[i].content;
      }
    }
    return '';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Philosophy Laboratory</h1>
          <p className="text-muted-foreground">
            Symphonic multi-agent colloquium orchestrated by Professor Nihil
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
                  {dialogue.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${getEntryStyles(entry).container} rounded-lg p-4 transition-contemplative`}>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {entry.type === 'user'
                                ? 'You'
                                : entry.type === 'synthesis'
                                  ? 'Symphonic Synthesis'
                                  : entry.personaName || 'Agent'}
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

                        {entry.type !== 'user' && entry.personaRole && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <Badge variant="outline" className={`text-[10px] font-medium ${getEntryStyles(entry).badge}`}>
                              {entry.personaRole}
                            </Badge>
                          </div>
                        )}

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

                        {/* Save to Vault toolbar for Professor responses */}
                        {entry.type !== 'user' && dialogue.length > 1 && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <SaveToVaultButton
                                prompt={getNearestUserPrompt(index)}
                                response={entry.content}
                                source="PhilosophyLab"
                                className="text-xs h-7 px-2"
                                onSaved={(id) => console.log('Saved dialogue:', id)}
                              />
                              <CopyAsMarkdownButton
                                prompt={getNearestUserPrompt(index)}
                                response={entry.content}
                                source="PhilosophyLab"
                                className="text-xs h-7 px-2"
                              />
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Orbit className="h-4 w-4 text-resonance" />
                Symphonic Ensemble
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personas.map((persona) => (
                  <div key={persona.id} className={`p-3 rounded-lg border ${persona.accentClass}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-foreground">{persona.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{persona.role}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] border ${persona.badgeClass}`}>
                        {persona.emphasis.join(' • ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                      {persona.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};