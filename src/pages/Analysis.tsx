import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileQuestion, TrendingUp, Network, Users } from 'lucide-react';

const Analysis = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-accent mr-4" />
            <h1 className="text-4xl font-bold text-foreground">Philosophical Analysis</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Systematic exploration of Nihiltheistic concepts and methodologies
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Concept Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Network className="h-5 w-5 mr-2 text-synthesis" />
                Concept Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm concept-void">Core Concepts</span>
                    <span className="text-sm text-muted-foreground">28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm concept-synthesis">Cross-Cultural</span>
                    <span className="text-sm text-muted-foreground">43%</span>
                  </div>
                  <Progress value={43} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm concept-resonance">Methodology</span>
                    <span className="text-sm text-muted-foreground">21%</span>
                  </div>
                  <Progress value={21} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-primary">Phenomenological</span>
                    <span className="text-sm text-muted-foreground">8%</span>
                  </div>
                  <Progress value={8} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Void-Resonance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-resonance" />
                Resonance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-resonance/5 rounded-lg">
                  <div className="text-2xl font-bold text-resonance mb-1">73</div>
                  <div className="text-sm text-muted-foreground">Avg Void-Resonance Score</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded">
                    <div className="text-lg font-semibold text-foreground">42</div>
                    <div className="text-xs text-muted-foreground">High Resonance</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded">
                    <div className="text-lg font-semibold text-foreground">18</div>
                    <div className="text-xs text-muted-foreground">Void Indicators</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Cultural Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-synthesis" />
                Cultural Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <Badge variant="outline" className="concept-synthesis">Buddhist</Badge>
                  <span className="text-sm">śūnyatā, pratītyasamutpāda</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <Badge variant="outline" className="concept-synthesis">Sufi</Badge>
                  <span className="text-sm">fanā', baqā'</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <Badge variant="outline" className="concept-synthesis">Advaitic</Badge>
                  <span className="text-sm">māyā, brahman</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <Badge variant="outline" className="concept-synthesis">Christian</Badge>
                  <span className="text-sm">via negativa, kenosis</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis Sections */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Iterative Densification Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-void/5 border border-void/20 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">Level 1: Conceptual Mapping</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Identifies core Nihiltheistic concepts and their relationships within the philosophical framework.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Concept Detection Rate</span>
                      <span className="concept-void">94%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Cross-Reference Accuracy</span>
                      <span className="concept-void">87%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-synthesis/5 border border-synthesis/20 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">Level 2: Cross-Cultural Synthesis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrates insights from Buddhist, Sufi, Advaitic, and Christian mystical traditions.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Cultural Integration</span>
                      <span className="concept-synthesis">91%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Synthesis Coherence</span>
                      <span className="concept-synthesis">83%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-resonance/5 border border-resonance/20 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">Level 3: Phenomenological Architecture</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explores experiential structures of void-to-resonance transitions and transcendent encounter.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Phenomenological Depth</span>
                      <span className="concept-resonance">89%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Integration Synthesis</span>
                      <span className="concept-resonance">76%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Philosophical Framework Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 text-foreground">Strengths</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-resonance rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Successfully bridges nihilistic void-experience with transcendent possibility
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-resonance rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Provides systematic methodology for philosophical inquiry and contemplative practice
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-resonance rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Integrates diverse wisdom traditions while maintaining conceptual coherence
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-resonance rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Offers practical tools for transforming existential crisis into spiritual opportunity
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 text-foreground">Areas for Development</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-void rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Refinement of void-resonance scoring algorithm for greater precision
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-void rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Expansion of cross-cultural synthesis to include indigenous wisdom traditions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-void rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Development of more sophisticated phenomenological mapping tools
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-void rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">
                        Integration with contemporary neuroscience and consciousness research
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research Implications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed mb-6">
                  The Nihiltheistic framework opens several avenues for future philosophical and empirical research, 
                  bridging contemporary academic philosophy with contemplative traditions and practical spirituality.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold mb-3 text-foreground">Academic Philosophy</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Phenomenology of religious experience</li>
                      <li>• Comparative mysticism studies</li>
                      <li>• Post-secular philosophical discourse</li>
                      <li>• Existential psychotherapy integration</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold mb-3 text-foreground">Empirical Research</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Neuroscience of transcendent experience</li>
                      <li>• Psychology of meaning-making</li>
                      <li>• Meditation and contemplative practice studies</li>
                      <li>• Digital humanities and philosophy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analysis;