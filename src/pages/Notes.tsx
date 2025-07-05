import { Navigation } from '@/components/Navigation';
import { NotesInterface } from '@/components/pkm/NotesInterface';

const Notes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <NotesInterface />
    </div>
  );
};

export default Notes;