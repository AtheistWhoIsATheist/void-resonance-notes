import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Circle, Brain, Search } from 'lucide-react';

const Nihilism = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Circle className="h-12 w-12 text-void mr-4" />
            <h1 className="text-4xl font-bold text-foreground">Nihilism</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Exploring the philosophical foundations of void-experience
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-void" />
                Philosophical Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                Nihilism (from Latin <em>nihil</em>, "nothing") is the philosophical position that life lacks 
                objective meaning, purpose, or intrinsic value. It suggests that moral values have no 
                foundation in the nature of the world and that existence itself is fundamentally without purpose.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Core Characteristics</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Rejection of objective moral values</li>
                    <li>• Denial of inherent meaning in existence</li>
                    <li>• Critique of traditional belief systems</li>
                    <li>• Emphasis on the absence of ultimate purpose</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Historical Context</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Emerged in 19th-century European philosophy</li>
                    <li>• Response to the decline of religious authority</li>
                    <li>• Reaction to rapid social and scientific change</li>
                    <li>• Precursor to existentialist movements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Thinkers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Friedrich Nietzsche</h4>
                    <p className="text-sm text-muted-foreground">
                      Though often mischaracterized as a nihilist, Nietzsche diagnosed nihilism as 
                      a cultural crisis and sought to overcome it through the creation of new values.
                    </p>
                    <Badge variant="outline" className="mt-2 concept-void">Diagnostic Nihilism</Badge>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Max Stirner</h4>
                    <p className="text-sm text-muted-foreground">
                      Radical individualist who rejected all social institutions and abstract concepts 
                      as "spooks" that constrain individual freedom.
                    </p>
                    <Badge variant="outline" className="mt-2 concept-void">Egoistic Nihilism</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Ivan Turgenev</h4>
                    <p className="text-sm text-muted-foreground">
                      Coined the term "nihilist" in his novel "Fathers and Sons" to describe 
                      those who reject traditional values and authorities.
                    </p>
                    <Badge variant="outline" className="mt-2 concept-void">Literary Nihilism</Badge>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Dmitri Pisarev</h4>
                    <p className="text-sm text-muted-foreground">
                      Russian critic who embraced nihilism as a necessary destruction of 
                      false beliefs to make way for genuine knowledge.
                    </p>
                    <Badge variant="outline" className="mt-2 concept-void">Destructive Nihilism</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types of Nihilism</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Metaphysical Nihilism</h4>
                  <p className="text-muted-foreground text-sm">
                    The view that nothing exists or that existence itself is an illusion. 
                    This extreme position questions the very reality of the world we experience.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Epistemological Nihilism</h4>
                  <p className="text-muted-foreground text-sm">
                    Skepticism about the possibility of knowledge or truth. Suggests that 
                    we cannot know anything with certainty about reality.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Moral Nihilism</h4>
                  <p className="text-muted-foreground text-sm">
                    The position that moral values have no objective basis and that 
                    ethical statements are neither true nor false.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Existential Nihilism</h4>
                  <p className="text-muted-foreground text-sm">
                    The belief that life has no inherent meaning or purpose. This is often 
                    what people mean when they speak of nihilism in general terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contemporary Relevance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed mb-4">
                  Nihilism remains philosophically significant as both a diagnostic tool for understanding 
                  modern existential crises and as a necessary stage in the development of authentic meaning-making.
                </p>
                
                <Separator className="my-6" />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Cultural Manifestations</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Post-modern skepticism of grand narratives</li>
                      <li>• Contemporary art and literature themes</li>
                      <li>• Mental health and existential depression</li>
                      <li>• Social media and meaning-making challenges</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Philosophical Responses</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Existentialist emphasis on self-creation</li>
                      <li>• Absurdist acceptance and revolt</li>
                      <li>• Postmodern deconstruction and reconstruction</li>
                      <li>• <strong>Nihiltheistic transcendence through void</strong></li>
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

export default Nihilism;