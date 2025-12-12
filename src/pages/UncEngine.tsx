import { Navigation } from '@/components/Navigation';
import { UncEngine } from '@/components/unc-engine/UncEngine';

const UncEnginePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <UncEngine />
      </div>
    </div>
  );
};

export default UncEnginePage;
