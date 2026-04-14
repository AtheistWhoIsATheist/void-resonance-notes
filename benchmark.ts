const MAX_MESSAGES_PER_THREAD = 60;
const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  getItem(key: string) {
    return this.store[key] || null;
  }
};

const generateThreads = (numThreads: number) => {
  return Array.from({ length: numThreads }).map((_, i) => ({
    id: createId(),
    title: `Thread ${i}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: "openai/gpt-4o-mini",
    includeContext: true,
    systemPrompt: "You are a helpful assistant.",
    messages: Array.from({ length: MAX_MESSAGES_PER_THREAD }).map((_, j) => ({
      id: createId(),
      role: j % 2 === 0 ? "user" : "assistant",
      content: `This is a message content with some length to make the JSON stringification take some time. Message ${j}`,
      createdAt: new Date().toISOString(),
    })),
  }));
};

const threads = generateThreads(50); // 50 threads

const start = performance.now();
for (let i = 0; i < 100; i++) { // Simulate 100 updates
  const updatedThreads = [...threads];
  updatedThreads[0] = { ...updatedThreads[0], systemPrompt: updatedThreads[0].systemPrompt + "a" };
  // Current behavior: synchronous save
  mockLocalStorage.setItem("nihiltheism-ultra-chat-threads", JSON.stringify(updatedThreads));
}
const end = performance.now();

console.log(`Synchronous save took ${(end - start).toFixed(2)}ms for 100 updates`);

let debouncedTimeout: ReturnType<typeof setTimeout> | null = null;
const startDebounced = performance.now();
for (let i = 0; i < 100; i++) {
  const updatedThreads = [...threads];
  updatedThreads[0] = { ...updatedThreads[0], systemPrompt: updatedThreads[0].systemPrompt + "a" };
  // Debounced behavior:
  if (debouncedTimeout) clearTimeout(debouncedTimeout);
  debouncedTimeout = setTimeout(() => {
    mockLocalStorage.setItem("nihiltheism-ultra-chat-threads", JSON.stringify(updatedThreads));
  }, 500);
}
const endDebounced = performance.now();
console.log(`Debounced save dispatch took ${(endDebounced - startDebounced).toFixed(2)}ms for 100 updates`);
