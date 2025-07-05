import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, Brain, ArrowRight, Infinity } from 'lucide-react';

const Nihiltheism = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Infinity className="h-12 w-12 text-resonance mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-synthesis bg-clip-text text-transparent">
              Nihiltheism
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            The philosophical framework of void-to-resonance transcendence
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-resonance" />
                Core Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-resonance/10 p-6 rounded-lg mb-6">
                <p className="text-lg text-foreground leading-relaxed font-medium">
                  <strong>Nihiltheism</strong> represents a philosophical synthesis that recognizes void-experience 
                  not as mere negation, but as privileged phenomenological sites for encountering 
                  transcendent dimensions of reality.
                </p>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Unlike traditional nihilism which stops at the recognition of meaninglessness, 
                or conventional theism which bypasses the void-experience, Nihiltheism embraces 
                the paradoxical relationship between emptiness and transcendence as mutually constitutive 
                rather than opposed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fundamental Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-void/5 border border-void/20 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center">
                    <span className="w-2 h-2 bg-void rounded-full mr-2"></span>
                    Void as Aperture
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Experiences of meaninglessness, emptiness, or existential crisis serve as openings 
                    through which deeper dimensions of reality may be encountered, rather than endpoints to be avoided.
                  </p>
                </div>
                
                <div className="p-4 bg-resonance/5 border border-resonance/20 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center">
                    <span className="w-2 h-2 bg-resonance rounded-full mr-2"></span>
                    Paradoxical Transcendence
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The sacred emerges through - not in spite of - the dissolution of conventional 
                    meaning structures. Transcendence is discovered within immanence.
                  </p>
                </div>
                
                <div className="p-4 bg-synthesis/5 border border-synthesis/20 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center">
                    <span className="w-2 h-2 bg-synthesis rounded-full mr-2"></span>
                    Cross-Cultural Synthesis
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Integration of insights from Buddhist śūnyatā (emptiness), Advaitic māyā (illusion), 
                    Sufi fanā' (annihilation), and Western phenomenology.
                  </p>
                </div>
                
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Iterative Densification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Progressive deepening through systematic analysis: conceptual mapping, 
                    cross-cultural synthesis, and phenomenological architecture.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2 text-synthesis" />
                The Void-to-Resonance Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-void/20 rounded-full text-sm font-semibold text-void">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Void Recognition</h4>
                    <p className="text-sm text-muted-foreground">
                      Initial encounter with emptiness, meaninglessness, or absence. Rather than 
                      immediate escape or filling, this stage involves sitting with the void-experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-synthesis/20 rounded-full text-sm font-semibold text-synthesis">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Resonance Emergence</h4>
                    <p className="text-sm text-muted-foreground">
                      Subtle shift from mere negation to pregnant void. The emptiness reveals itself 
                      as space-for-emergence rather than simple absence.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-resonance/20 rounded-full text-sm font-semibold text-resonance">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Transcendent Aperture</h4>
                    <p className="text-sm text-muted-foreground">
                      Opening of awareness to dimensions beyond ordinary experience. Integration 
                      of emptiness and fullness as complementary rather than opposed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cross-Cultural Resonances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="concept-synthesis mr-2">Buddhist</Badge>
                      <h4 className="font-semibold text-foreground">Śūnyatā</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Emptiness as the absence of inherent existence, paradoxically revealing 
                      the interdependent nature of all phenomena.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="concept-synthesis mr-2">Sufi</Badge>
                      <h4 className="font-semibold text-foreground">Fanā'</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mystical annihilation of the ego-self, creating space for divine encounter 
                      through the dissolution of ordinary identity.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="concept-synthesis mr-2">Advaitic</Badge>
                      <h4 className="font-semibold text-foreground">Māyā</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The illusory nature of apparent separateness dissolves to reveal 
                      underlying non-dual awareness.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="concept-synthesis mr-2">Christian</Badge>
                      <h4 className="font-semibold text-foreground">Via Negativa</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The mystical path of negation that approaches the divine through 
                      the systematic removal of finite attributes and concepts.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phenomenological Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed mb-4">
                  The experiential structure of Nihiltheistic insight involves specific phenomenological 
                  markers that distinguish authentic void-to-resonance transitions from mere intellectual understanding.
                </p>
                
                <Separator className="my-6" />
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-void/5 rounded-lg">
                    <h4 className="font-semibold mb-2 concept-void">Dissolution</h4>
                    <p className="text-xs text-muted-foreground">
                      Breakdown of familiar reference points and meaning-structures
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-synthesis/5 rounded-lg">
                    <h4 className="font-semibold mb-2 concept-synthesis">Spaciousness</h4>
                    <p className="text-xs text-muted-foreground">
                      Emergence of open awareness beyond ordinary subject-object duality
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-resonance/5 rounded-lg">
                    <h4 className="font-semibold mb-2 concept-resonance">Integration</h4>
                    <p className="text-xs text-muted-foreground">
                      Recognition of void and fullness as complementary aspects of reality
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-void/20 border-primary/30">
            <CardContent className="text-center p-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Explore Nihiltheism in Practice
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Experience the framework through interactive philosophical inquiry and 
                systematic note-taking that transforms void-experience into contemplative practice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/philosophy-lab">
                    <Brain className="h-4 w-4 mr-2" />
                    Philosophy Lab
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/notes">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start Taking Notes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Nihiltheism;