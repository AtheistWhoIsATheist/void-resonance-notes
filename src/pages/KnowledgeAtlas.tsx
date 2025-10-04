import { Navigation } from '@/components/Navigation';
import { KnowledgeGraph } from '@/components/knowledge-atlas/KnowledgeGraph';

const KnowledgeAtlas = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <KnowledgeGraph />
    </div>
  );
};

export default KnowledgeAtlas;
