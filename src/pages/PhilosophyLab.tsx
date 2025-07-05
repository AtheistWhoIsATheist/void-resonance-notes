import { Navigation } from '@/components/Navigation';
import { PhilosophyLab as PhilosophyLabComponent } from '@/components/philosophy-lab/PhilosophyLab';

const PhilosophyLab = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PhilosophyLabComponent />
    </div>
  );
};

export default PhilosophyLab;