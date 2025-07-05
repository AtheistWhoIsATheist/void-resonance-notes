import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Brain, 
  Infinity, 
  Sparkles, 
  Layers,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex items-center justify-center mb-8">
            <Infinity className="h-16 w-16 text-resonance mr-4 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-synthesis bg-clip-text text-transparent">
              Infinity Notes
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl text-foreground mb-6 font-light">
            Nihiltheism Explorer
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            A sophisticated PKM system that transforms note-taking into philosophical practice. 
            Explore the void-to-resonance paradigm through iterative densification methodology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
              <Link to="/notes">
                <BookOpen className="h-5 w-5 mr-2" />
                Start Taking Notes
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/philosophy-lab">
                <Brain className="h-5 w-5 mr-2" />
                Philosophy Lab
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Digital Philosophy Laboratory
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-contemplative hover:shadow-focus transition-contemplative">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold">Concept Detection</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Automatic identification of Nihiltheistic concepts with cross-cultural synthesis 
                  including Buddhist śūnyatā, Advaitic māyā, and Sufi fanā'.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-contemplative hover:shadow-focus transition-contemplative">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-resonance/10 rounded-lg mr-3">
                    <Sparkles className="h-6 w-6 text-resonance" />
                  </div>
                  <h4 className="text-lg font-semibold">Void Resonance Scoring</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Quantitative assessment of transcendent potential (0-100 scale) based on 
                  philosophical depth and conceptual integration.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-contemplative hover:shadow-focus transition-contemplative">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-synthesis/10 rounded-lg mr-3">
                    <Layers className="h-6 w-6 text-synthesis" />
                  </div>
                  <h4 className="text-lg font-semibold">Iterative Densification</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Three-level recursive analysis: Conceptual Mapping, Cross-Cultural Synthesis, 
                  and Phenomenological Architecture.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-contemplative hover:shadow-focus transition-contemplative">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-void/10 rounded-lg mr-3">
                    <Brain className="h-6 w-6 text-void" />
                  </div>
                  <h4 className="text-lg font-semibold">Professor Nihil AI</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Interactive dialogue system for recursive philosophical inquiry with 
                  contextual response generation and framework integration.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-contemplative hover:shadow-focus transition-contemplative">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-accent/10 rounded-lg mr-3">
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="text-lg font-semibold">Advanced PKM</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Sophisticated note management with automatic concept linking, 
                  tag-based organization, and philosophical intelligence.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-contemplative hover:shadow-focus transition-contemplative">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Infinity className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold">Contemplative Design</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Dark, minimalist interface optimized for deep focus and extended 
                  philosophical contemplation with meditative transitions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <blockquote className="text-2xl md:text-3xl font-light text-foreground mb-6 italic leading-relaxed">
            "The void is not mere absence, but the space of all possibilities - 
            the pregnant emptiness from which transcendence emerges."
          </blockquote>
          <p className="text-muted-foreground">— Core Nihiltheistic Insight</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-void">
        <div className="container mx-auto text-center max-w-2xl">
          <h3 className="text-3xl font-bold mb-6 text-foreground">
            Begin Your Philosophical Journey
          </h3>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your knowledge management into contemplative practice. 
            Explore the depths of existence through systematic philosophical inquiry.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
            <Link to="/notes">
              <span>Enter the Laboratory</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
