import { exportNoteMarkdown, generateIdempotencyKey, ExportNoteData } from '../exportMarkdown';

// Simple test data for verification
const testData: ExportNoteData = {
  prompt: "What is the nature of void-experience in contemplative practice?",
  response: "Void-experience represents a privileged phenomenological aperture where ordinary consciousness dissolves, allowing deeper dimensions of reality to emerge. This apparent emptiness functions not as mere absence but as foundational openness.",
  framework: "Nihiltheism",
  concepts: ["void-experience", "phenomenological-aperture", "foundational-openness"],
  tags: ["Nihiltheism", "contemplative", "theme-dark"],
  createdAt: new Date('2024-01-15T10:30:00Z'),
  voidResonanceScore: 85,
  densificationLevel: 1,
  source: "PhilosophyLab",
  idempotencyKey: "test-key-123"
};

// Test basic markdown generation
export const testMarkdownGeneration = () => {
  const markdown = exportNoteMarkdown(testData);
  
  // Verify frontmatter is present
  const hasFrontmatter = markdown.includes('---') && 
    markdown.includes('title:') && 
    markdown.includes('framework:') &&
    markdown.includes('void_resonance_score: 85');
  
  // Verify sections are present
  const hasSections = markdown.includes('## Prompt') && 
    markdown.includes('## Response') && 
    markdown.includes('## Doctrinal context');
  
  console.log('Markdown generation test:', hasFrontmatter && hasSections ? 'PASS' : 'FAIL');
  return hasFrontmatter && hasSections;
};

// Test idempotency key generation
export const testIdempotencyKey = () => {
  const key1 = generateIdempotencyKey("test prompt", "test response", 123456);
  const key2 = generateIdempotencyKey("test prompt", "test response", 123456);
  const key3 = generateIdempotencyKey("different prompt", "test response", 123456);
  
  const sameInputsSameKey = key1 === key2;
  const differentInputsDifferentKey = key1 !== key3;
  
  console.log('Idempotency key test:', sameInputsSameKey && differentInputsDifferentKey ? 'PASS' : 'FAIL');
  return sameInputsSameKey && differentInputsDifferentKey;
};

// Test REN framework detection
export const testRENFramework = () => {
  const renData: ExportNoteData = {
    ...testData,
    prompt: "How can recursive enhancement patterns amplify learning?",
    response: "Recursive enhancement involves iterative feedback loops that progressively amplify capabilities.",
    framework: "REN",
    concepts: ["recursive-enhancement", "feedback-loops"],
    tags: ["REN", "recursive", "theme-dark"]
  };
  
  const markdown = exportNoteMarkdown(renData);
  const hasRENContext = markdown.includes('framework: "REN"') && 
    markdown.includes('REN framework analysis');
  
  console.log('REN framework test:', hasRENContext ? 'PASS' : 'FAIL');
  return hasRENContext;
};

// Test Journal314 framework detection  
export const testJournal314Framework = () => {
  const j314Data: ExportNoteData = {
    ...testData,
    prompt: "What mapping strategies work best for complex systems?",
    response: "Journal314 methodology employs structural correlation analysis to map complex relationships.",
    framework: "Journal314",
    concepts: ["mapping-strategies", "structural-correlation"],
    tags: ["Journal314", "mapping", "theme-dark"]
  };
  
  const markdown = exportNoteMarkdown(j314Data);
  const hasJ314Context = markdown.includes('framework: "Journal314"') && 
    markdown.includes('Journal314 methodology');
  
  console.log('Journal314 framework test:', hasJ314Context ? 'PASS' : 'FAIL');
  return hasJ314Context;
};

// Run all tests
export const runAllTests = () => {
  console.log('Running Save to Vault export tests...');
  const results = [
    testMarkdownGeneration(),
    testIdempotencyKey(), 
    testRENFramework(),
    testJournal314Framework()
  ];
  
  const passCount = results.filter(Boolean).length;
  console.log(`Tests completed: ${passCount}/${results.length} passed`);
  
  return passCount === results.length;
};