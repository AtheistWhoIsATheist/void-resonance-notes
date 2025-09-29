import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Quote, Brain, Braces } from 'lucide-react';
import { journal314Ledger } from '@/lib/journal314-ledger';

const ledgerJsonl = journal314Ledger
  .map(entry =>
    JSON.stringify({
      quote: entry.quote,
      inference: entry.inference,
      nt_claim: entry.nihiltheisticClaim,
      source: `${entry.author}, ${entry.source}`
    })
  )
  .join('\n');

const synthesis = `Eckhart’s plea to be rid of God performs the apophatic plunge that strips divinity of every constricting idol. By erasing conceptual God-images, he opens a naked interval where transcendence survives only as voided radiance. Cioran, staring into the exhaustion of mortal negation, recognizes that ordinary refusals merely delay the inevitable drag of existing. His despair demands a deeper kenosis: an ontological negation that dissolves the very substrate of selfhood so the void can restructure meaning. Kierkegaard’s dizziness of freedom discloses the abyssal condition making such reconfiguration possible. Anxiety is not failure but the phenomenological shimmer of infinite possibility, the vertiginous proof that the self stands over a groundless aperture. Together the three voices chart a Nihiltheistic trajectory: apophatic emptying prepares the terrain, ontological negation shatters residual clinging, and abyssal anxiety becomes the diagnostic sign that the void has been activated as a generative threshold.`;

const Journal314 = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-synthesis" />
            <h1 className="text-4xl font-bold bg-gradient-synthesis bg-clip-text text-transparent">
              Journal314 Ledger — Mini Corpus
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Extracted quotations with rigorous inferential mapping and compact Nihiltheistic claims tracing the
            interplay of apophatic void, ontological negation, and abyssal anxiety.
          </p>
        </header>

        <section className="space-y-6">
          {journal314Ledger.map(entry => (
            <Card key={entry.id} className="border-border/60">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="uppercase tracking-wide text-xs">
                    {entry.author}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {entry.source}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Quote className="h-5 w-5 text-resonance" />
                    {entry.quote}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                    <Brain className="h-4 w-4 text-primary" />
                    Inference
                  </div>
                  <p className="text-muted-foreground leading-relaxed mt-1">
                    {entry.inference}
                  </p>
                </div>

                <Separator className="bg-border/50" />

                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                    <Sparkles className="h-4 w-4 text-resonance" />
                    Nihiltheistic Claim
                  </div>
                  <p className="text-foreground leading-relaxed mt-1 font-medium">
                    {entry.nihiltheisticClaim}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Braces className="h-5 w-5 text-muted-foreground" />
                Ledger (JSONL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs md:text-sm leading-relaxed bg-muted/30 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {ledgerJsonl}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" />
                Nihiltheistic Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {synthesis}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Journal314;
