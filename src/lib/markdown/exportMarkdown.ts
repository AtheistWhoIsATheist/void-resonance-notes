import { createHash } from 'crypto';

export interface ExportNoteData {
  prompt: string;
  response: string;
  presetName?: string;
  model?: string;
  framework: "REN" | "Journal314" | "Nihiltheism" | "Mixed" | "General";
  concepts: string[];
  tags: string[];
  createdAt: Date;
  voidResonanceScore?: number;
  densificationLevel?: number;
  source: "PhilosophyLab" | "Enhancer" | "Generator" | "Library";
  idempotencyKey: string;
}

export const generateIdempotencyKey = (prompt: string, response: string, timestamp: number): string => {
  const content = `${prompt}${response}${timestamp}`;
  // Simple hash since crypto might not be available in browser
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

export const exportNoteMarkdown = (data: ExportNoteData): string => {
  const title = data.prompt.slice(0, 80).replace(/\n/g, ' ').trim();
  const titleSuffix = data.prompt.length > 80 ? '...' : '';
  
  const frontmatter = `---
title: "${title}${titleSuffix}"
date: "${data.createdAt.toISOString()}"
framework: "${data.framework}"
tags: [${data.tags.map(tag => `"${tag}"`).join(', ')}]
concepts: [${data.concepts.map(concept => `"${concept}"`).join(', ')}]
preset: "${data.presetName || ''}"
model: "${data.model || ''}"
void_resonance_score: ${data.voidResonanceScore || 'null'}
densification_level: ${data.densificationLevel || 'null'}
source: "${data.source}"
idempotency_key: "${data.idempotencyKey}"
---`;

  const doctrinalContext = `## Doctrinal context
- Framework: ${data.framework}
- Concepts: ${data.concepts.join(', ')}
- Notes: ${getFrameworkNotes(data.framework, data.concepts)}`;

  const ethicalImplications = `## Ethical/metaphysical implications
${getEthicalImplications(data.framework, data.concepts)}`;

  return `${frontmatter}

## Prompt
${data.prompt}

## Response
${data.response}

${doctrinalContext}

${ethicalImplications}`;
};

const getFrameworkNotes = (framework: string, concepts: string[]): string => {
  switch (framework) {
    case 'REN':
      return 'REN framework analysis applied. Consider recursive enhancement patterns and emergent properties.';
    case 'Journal314':
      return 'Journal314 methodology detected. Review mapping strategies and structural correlations.';
    case 'Mixed':
      return 'Mixed framework approach identified. Examine synthesis opportunities and methodological convergence.';
    case 'Nihiltheism':
      return 'Nihiltheistic concepts present. Observe void-to-resonance transitions and paradoxical structures.';
    default:
      return 'General philosophical analysis. Consider cross-framework applications and concept evolution.';
  }
};

const getEthicalImplications = (framework: string, concepts: string[]): string => {
  const implications = [];
  
  if (framework === 'REN' || concepts.some(c => c.toLowerCase().includes('recursive'))) {
    implications.push('- Recursive enhancement risks: Consider feedback loops and unintended amplification effects.');
  }
  
  if (framework === 'Journal314' || concepts.some(c => c.toLowerCase().includes('mapping'))) {
    implications.push('- Mapping accuracy concerns: Verify structural fidelity and representational limits.');
  }
  
  if (framework === 'Nihiltheism' || concepts.some(c => ['void', 'nothingness', 'transcendent'].includes(c.toLowerCase()))) {
    implications.push('- Void engagement precautions: Maintain grounding practices during deep contemplation.');
  }
  
  implications.push('- General safeguards: Regular reflection, peer review, and conceptual boundary awareness.');
  
  return implications.join('\n');
};