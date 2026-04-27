/**
 * Nihiltheism Framework Engine
 * Core philosophical reasoning and concept management system
 */

export interface NTConcept {
  id: string;
  name: string;
  category: 'core' | 'methodology' | 'cross-cultural' | 'phenomenological';
  description: string;
  keywords: string[];
  crossReferences: string[];
  voidWeight: number; // 0-1, how much this concept relates to void
  resonanceWeight: number; // 0-1, how much this concept relates to transcendence
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  concepts: string[];
  createdAt: Date;
  updatedAt: Date;
  densificationLevel: number;
  voidResonanceScore?: number;
  metadata?: {
    prompt?: string;
    response?: string;
    presetName?: string;
    model?: string;
    framework?: string;
    source?: string;
    idempotencyKey?: string;
    importSource?: 'obsidian';
    vaultFilePath?: string;
    wikiLinks?: string[];
    backlinks?: string[];
  };
}

export interface IterativeDensificationResult {
  original: string;
  iterations: Array<{
    level: number;
    title: string;
    content: string;
    conceptsIdentified: string[];
    crossReferences: string[];
  }>;
  synthesisInsight: string;
}

export class NihiltheismFramework {
  private concepts: Map<string, NTConcept> = new Map();

  constructor() {
    this.initializeConcepts();
  }

  private initializeConcepts() {
    const coreConceptsData: NTConcept[] = [
      {
        id: 'nothingness',
        name: 'Nothingness',
        category: 'core',
        description: 'The foundational void from which all emergence occurs',
        keywords: ['void', 'emptiness', 'nothingness', 'absence', 'nihil', 'zero'],
        crossReferences: ['sunyata', 'fana', 'maya'],
        voidWeight: 1.0,
        resonanceWeight: 0.3
      },
      {
        id: 'paradoxical-transcendence',
        name: 'Paradoxical Transcendence',
        category: 'core',
        description: 'The simultaneous presence and absence of the sacred',
        keywords: ['paradox', 'transcendent', 'sacred', 'both', 'neither', 'tension'],
        crossReferences: ['via-negativa', 'coincidentia-oppositorum'],
        voidWeight: 0.6,
        resonanceWeight: 1.0
      },
      {
        id: 'iterative-densification',
        name: 'Iterative Densification Process',
        category: 'methodology',
        description: 'Three-level recursive analysis methodology',
        keywords: ['iteration', 'densification', 'recursive', 'methodology', 'process'],
        crossReferences: ['conceptual-mapping', 'cross-cultural-synthesis'],
        voidWeight: 0.2,
        resonanceWeight: 0.7
      },
      {
        id: 'sunyata',
        name: 'Śūnyatā Integration',
        category: 'cross-cultural',
        description: 'Buddhist emptiness as void-resonance bridge',
        keywords: ['sunyata', 'emptiness', 'buddhist', 'madhyamaka', 'interdependence'],
        crossReferences: ['nothingness', 'dependent-origination'],
        voidWeight: 0.9,
        resonanceWeight: 0.8
      },
      {
        id: 'fana',
        name: 'Fanā\' Experience',
        category: 'cross-cultural',
        description: 'Sufi annihilation as transcendent void',
        keywords: ['fana', 'annihilation', 'sufi', 'extinction', 'mystical'],
        crossReferences: ['nothingness', 'paradoxical-transcendence'],
        voidWeight: 0.8,
        resonanceWeight: 0.9
      },
      {
        id: 'maya',
        name: 'Māyā Dissolution',
        category: 'cross-cultural',
        description: 'Advaitic illusion as void aperture',
        keywords: ['maya', 'illusion', 'advaita', 'dissolution', 'brahman'],
        crossReferences: ['nothingness', 'non-dual'],
        voidWeight: 0.7,
        resonanceWeight: 0.6
      },
      {
        id: 'void-to-resonance',
        name: 'Void-to-Resonance Bridge',
        category: 'phenomenological',
        description: 'Experiential transition from emptiness to transcendence',
        keywords: ['bridge', 'transition', 'aperture', 'awakening', 'resonance'],
        crossReferences: ['nothingness', 'paradoxical-transcendence'],
        voidWeight: 0.8,
        resonanceWeight: 0.9
      }
    ];

    coreConceptsData.forEach(concept => {
      this.concepts.set(concept.id, concept);
    });
  }

  getConcepts(): NTConcept[] {
    return Array.from(this.concepts.values());
  }

  getConcept(id: string): NTConcept | undefined {
    return this.concepts.get(id);
  }

  detectConcepts(text: string): string[] {
    const detectedConcepts: string[] = [];
    const lowerText = text.toLowerCase();

    this.concepts.forEach((concept, id) => {
      const hasKeyword = concept.keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        detectedConcepts.push(id);
      }
    });

    return detectedConcepts;
  }

  calculateVoidResonanceScore(text: string, concepts: string[] = []): number {
    const lowerText = text.toLowerCase();
    let score = 0;

    // Base scoring from keywords
    const voidIndicators = ['void', 'emptiness', 'nothingness', 'absence', 'nihil'];
    const resonanceIndicators = ['transcendent', 'sacred', 'resonance', 'awakening', 'aperture'];
    const paradoxIndicators = ['paradox', 'tension', 'contradiction', 'both', 'neither'];

    // Count void indicators (10 points each)
    voidIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) {
        score += 10;
      }
    });

    // Count resonance indicators (15 points each)
    resonanceIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) {
        score += 15;
      }
    });

    // Count paradox indicators (20 points each)
    paradoxIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) {
        score += 20;
      }
    });

    // Concept combination bonus
    if (concepts.length >= 3) {
      score += 25;
    }

    // Calculate concept weights
    let conceptVoidWeight = 0;
    let conceptResonanceWeight = 0;

    concepts.forEach(conceptId => {
      const concept = this.concepts.get(conceptId);
      if (concept) {
        conceptVoidWeight += concept.voidWeight;
        conceptResonanceWeight += concept.resonanceWeight;
      }
    });

    // Add weighted concept bonus
    if (concepts.length > 0) {
      const avgVoidWeight = conceptVoidWeight / concepts.length;
      const avgResonanceWeight = conceptResonanceWeight / concepts.length;
      score += Math.round((avgVoidWeight + avgResonanceWeight) * 15);
    }

    return Math.min(score, 100); // Cap at 100
  }

  performIterativeDensification(text: string): IterativeDensificationResult {
    const concepts = this.detectConcepts(text);
    
    const iterations = [
      {
        level: 1,
        title: 'Conceptual Mapping',
        content: this.generateConceptualMapping(text, concepts),
        conceptsIdentified: concepts,
        crossReferences: this.getCrossReferences(concepts)
      },
      {
        level: 2,
        title: 'Cross-Cultural Synthesis',
        content: this.generateCrossCulturalSynthesis(text, concepts),
        conceptsIdentified: concepts,
        crossReferences: this.getCrossReferences(concepts)
      },
      {
        level: 3,
        title: 'Phenomenological Architecture',
        content: this.generatePhenomenologicalArchitecture(text, concepts),
        conceptsIdentified: concepts,
        crossReferences: this.getCrossReferences(concepts)
      }
    ];

    const synthesisInsight = this.generateSynthesisInsight(text, concepts, iterations);

    return {
      original: text,
      iterations,
      synthesisInsight
    };
  }

  private generateConceptualMapping(text: string, concepts: string[]): string {
    const mappedConcepts = concepts.map(id => {
      const concept = this.concepts.get(id);
      return concept ? `• **${concept.name}**: ${concept.description}` : '';
    }).filter(Boolean);

    return `**Conceptual Framework Analysis:**

${mappedConcepts.join('\n')}

**Primary Philosophical Tensions:**
The text reveals fundamental tensions between absence and presence, void and fullness, negation and affirmation. These tensions point toward the paradoxical nature of transcendent experience.`;
  }

  private generateCrossCulturalSynthesis(text: string, concepts: string[]): string {
    const crossCulturalConcepts = concepts.filter(id => {
      const concept = this.concepts.get(id);
      return concept && concept.category === 'cross-cultural';
    });

    return `**Cross-Cultural Resonances:**

**Buddhist Perspective**: The void-experience parallels śūnyatā (emptiness) - not mere nothingness but the absence of inherent existence that opens space for interdependent arising.

**Sufi Perspective**: The annihilation (fanā') aspect reflects the mystical dissolution of ego-boundaries, creating aperture for divine encounter.

**Advaitic Perspective**: The illusory nature (māyā) of apparent separateness dissolves, revealing the underlying non-dual awareness.

**Synthesis Bridge**: These traditions converge on void-experience as privileged site for transcendent encounter.`;
  }

  private generatePhenomenologicalArchitecture(text: string, concepts: string[]): string {
    return `**Experiential Structure:**

**Phase 1 - Void Recognition**: Initial encounter with emptiness, meaninglessness, or absence
**Phase 2 - Resonance Emergence**: Subtle shift from mere negation to pregnant void
**Phase 3 - Transcendent Aperture**: Opening of awareness to dimensions beyond ordinary experience

**Phenomenological Markers:**
- Dissolution of familiar reference points
- Emergence of spacious awareness  
- Recognition of void as generative rather than merely destructive
- Integration of emptiness and fullness as complementary rather than opposed`;
  }

  private generateSynthesisInsight(text: string, concepts: string[], iterations: any[]): string {
    const voidScore = this.calculateVoidResonanceScore(text, concepts);
    
    return `**Unified Understanding:**

This exploration reveals the Nihiltheistic insight that apparent meaninglessness or void-experience serves as a privileged phenomenological site for encountering transcendent dimensions. Rather than mere negation, the void becomes an aperture through which deeper realities may be glimpsed.

**Void-Resonance Score**: ${voidScore}/100

The integration of philosophical analysis with contemplative practice opens pathways for transforming existential crisis into spiritual opportunity.`;
  }

  private getCrossReferences(concepts: string[]): string[] {
    const crossRefs = new Set<string>();
    
    concepts.forEach(conceptId => {
      const concept = this.concepts.get(conceptId);
      if (concept) {
        concept.crossReferences.forEach(ref => crossRefs.add(ref));
      }
    });

    return Array.from(crossRefs);
  }
}

// Singleton instance
export const nihiltheismFramework = new NihiltheismFramework();
