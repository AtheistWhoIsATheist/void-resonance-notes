import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { promptForgeSpec } from '@/data/promptForge';

const {
  product,
  models,
  dataModel,
  preloadedProfiles,
  ui,
  automation,
  importExport,
  security,
  acceptanceTests,
  defaults,
  iterativeDensification,
} = promptForgeSpec;

const PromptForge = () => {
  const {
    metadata: ultraMetadata,
    executiveSynopsis,
    deliverable,
    visuals,
    decisionLog,
    metrics: ultraMetrics,
    maintenance: ultraMaintenance,
  } = iterativeDensification.ultraExpansion;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-12">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Local-first Prompt Engineering Studio
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Detailed product blueprint for a deterministic, automation-first enhancement environment anchored in Nihiltheistic methodology and the iterative densification protocol.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Mode: {product.mode}
            </Badge>
            <Badge variant="outline" className="tracking-wide">
              Principles: {product.principles.length}
            </Badge>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {product.principles.map((principle) => (
              <Badge key={principle} variant="default" className="bg-muted text-foreground">
                {principle}
              </Badge>
            ))}
          </div>
        </section>

        <section className="space-y-8 text-left">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-foreground">Iterative Densification Protocol</h2>
            <p className="text-muted-foreground max-w-3xl">
              This guide translates the iterative densification protocol into approachable steps so the entire team—especially newcomers—can improve Prompt Forge artefacts with confidence, keep improvements unbiased, and stay focused on increasing accuracy while optimising resource allocation.
            </p>
          </div>

          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Definition and Core Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm md:text-base">
              <div className="space-y-3">
                <p>{iterativeDensification.definition.overview}</p>
                <p>{iterativeDensification.definition.purpose}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {iterativeDensification.definition.objectives.map((objective) => (
                  <div key={objective.name} className="rounded-lg bg-background border border-primary/20 p-4 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{objective.name}</h3>
                    <p className="text-muted-foreground text-sm">{objective.detail}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Key Concepts</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {iterativeDensification.definition.keyConcepts.map((concept, index) => (
                    <li key={index}>{concept}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Success Indicators</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {iterativeDensification.definition.successIndicators.map((indicator, index) => (
                    <li key={index}>{indicator}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Key Entities for Granular Analysis</h3>
            <p className="text-muted-foreground max-w-3xl">
              These entities anchor every cycle of densification. By examining them in detail we can diagnose friction points early, respect user diversity, and double-check that automation keeps pace with growing demand.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {iterativeDensification.keyEntities.map((entity) => (
                <Card key={entity.name} className="h-full">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">{entity.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">{entity.description}</p>
                    <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
                      <h4 className="font-semibold text-foreground text-sm">Analysis Focus</h4>
                      <p className="text-muted-foreground">{entity.analysisFocus}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg bg-muted/30 border border-border/40 p-3 space-y-1">
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">Key Metrics</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {entity.metrics.map((metric: string, index: number) => (
                            <li key={index}>{metric}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-muted/30 border border-border/40 p-3 space-y-1">
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">Primary Data Sources</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {entity.dataSources.map((source: string, index: number) => (
                            <li key={index}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/20 border border-border/40 p-3 space-y-1">
                      <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">Guiding Questions</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {entity.keyQuestions.map((question: string, index: number) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Step-by-Step Methodology</h3>
            <p className="text-muted-foreground max-w-3xl">
              Follow these six stages in order. Each step provides concrete actions and expected outputs so the team can proceed methodically without skipping critical validation.
            </p>
            <div className="space-y-4">
              {iterativeDensification.methodology.map((step) => (
                <Card key={step.step} className="border border-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Step {step.step}: {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm md:text-base">
                    <p className="text-muted-foreground">{step.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/40 border border-border/40 p-4 space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Actions</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {step.actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-muted/20 border border-border/40 p-4 space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Expected Outputs</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {step.outputs.map((output, index) => (
                            <li key={index}>{output}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/20 border border-border/40 p-4 space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Preferred Tools</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {step.tools.map((tool: string, index: number) => (
                            <li key={index}>{tool}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-muted/20 border border-border/40 p-4 space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">Guardrails</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {step.guardrails.map((guardrail: string, index: number) => (
                            <li key={index}>{guardrail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Recursive Cycles for 96–98% Saturation</h3>
            <p className="text-muted-foreground max-w-3xl">
              Continue looping through these phases until metrics stabilise between 96% and 98% saturation. Treat each pass as an opportunity to deepen accuracy, eliminate bias, and re-balance resources.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {iterativeDensification.recursiveCycles.map((cycle) => (
                <Card key={cycle.name} className="h-full">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">{cycle.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{cycle.focus}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">Checkpoints</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {cycle.checkpoints.map((checkpoint, index) => (
                            <li key={index}>{checkpoint}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">Core Activities</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {cycle.activities.map((activity: string, index: number) => (
                            <li key={index}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">Exit Criteria</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {cycle.exitCriteria.map((criteria: string, index: number) => (
                            <li key={index}>{criteria}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide">Saturation Signals</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {cycle.saturationSignals.map((signal: string, index: number) => (
                            <li key={index}>{signal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Practical Instructions for Every Cycle</h3>
            <p className="text-muted-foreground max-w-3xl">
              Use these reminders as a checklist. They clarify the expected outcomes, reinforce beginner-friendly communication, and ensure automation keeps documentation fresh.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {iterativeDensification.instructions.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.guidance}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground">Comprehensive Content Expansion (Master Prompt)</h3>
              <p className="text-muted-foreground max-w-3xl">
                This expansion fulfils the ultra-level brief dated {ultraMetadata.date}. It serves a mixed audience by blending
                executive clarity with practitioner depth while staying aligned to Prompt Forge&apos;s local-first constraints and
                automation-first ethos.
              </p>
            </div>

            <Card className="bg-muted/30 border border-border/40">
              <CardHeader>
                <CardTitle className="text-xl">Metadata & Weights</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <span className="font-semibold text-foreground">Topic:</span> {ultraMetadata.topic}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Audience:</span> {ultraMetadata.audience}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Purpose:</span> {ultraMetadata.purpose}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Coverage Weights (Foundational/Core/Peripheral):</span>{' '}
                  {ultraMetadata.coverageWeights.foundational}/{ultraMetadata.coverageWeights.core}/
                  {ultraMetadata.coverageWeights.peripheral}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl">Executive Synopsis Bullets</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  {executiveSynopsis.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {deliverable.map((section) => (
                <Card key={section.section} className="border border-secondary/30">
                  <CardHeader className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className="text-xl">
                        §{section.section}. {section.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                        <Badge variant="outline">{section.level}</Badge>
                        <Badge variant="secondary">Weight {section.weight}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    {section.elements && (
                      <ul className="list-disc list-inside space-y-2">
                        {section.elements.map((element, index) => (
                          <li key={index}>{element}</li>
                        ))}
                      </ul>
                    )}

                    {section.matrix && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground text-sm">Contextual Variation Matrix</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Dimension</TableHead>
                              {section.matrix.columns.map((column: string) => (
                                <TableHead key={column}>{column}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {section.matrix.rows.map((row: { label: string; values: string[] }) => (
                              <TableRow key={row.label}>
                                <TableCell className="font-semibold text-foreground">{row.label}</TableCell>
                                {row.values.map((value, index) => (
                                  <TableCell key={index}>{value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {section.appendices && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">Glossary</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {section.appendices.glossary.map((term, index) => (
                              <li key={index}>{term}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">Artifacts</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {section.appendices.artifacts.map((artifact, index) => (
                              <li key={index}>{artifact}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground text-sm">Saturation Report</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="rounded-lg bg-muted/30 p-3">
                              <p className="font-semibold text-foreground text-xs uppercase">Cycle Count</p>
                              <p>{section.appendices.saturationReport.cycleCount}</p>
                            </div>
                            <div className="rounded-lg bg-muted/30 p-3">
                              <p className="font-semibold text-foreground text-xs uppercase">Coverage Index</p>
                              <p>{section.appendices.saturationReport.coverageIndex}</p>
                            </div>
                            <div className="rounded-lg bg-muted/30 p-3">
                              <p className="font-semibold text-foreground text-xs uppercase">Rolling Novelty Delta (last two)</p>
                              <p>
                                {section.appendices.saturationReport.rollingNoveltyDelta.join(', ')}
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/30 p-3">
                              <p className="font-semibold text-foreground text-xs uppercase">Review Ratio</p>
                              <p>{section.appendices.saturationReport.reviewRatio}</p>
                            </div>
                            <div className="rounded-lg bg-muted/30 p-3">
                              <p className="font-semibold text-foreground text-xs uppercase">Weighted Coverage Score</p>
                              <p>{section.appendices.saturationReport.weightedCoverageScore}</p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-xs uppercase tracking-wide mt-3">Residual Gaps</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {section.appendices.saturationReport.residualGaps.map((gap, index) => (
                                <li key={index}>{gap}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-xs uppercase tracking-wide mt-3">Maintenance Plan</h5>
                            <p>
                              <span className="font-semibold text-foreground">Cadence:</span> {section.appendices.saturationReport.maintenancePlan.cadence}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold text-foreground">Triggers:</span> {section.appendices.saturationReport.maintenancePlan.triggers.join('; ')}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold text-foreground">Owners:</span> {section.appendices.saturationReport.maintenancePlan.owners.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-border/40">
              <CardHeader>
                <CardTitle className="text-xl">Visuals & Diagnostics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                {visuals.map((visual, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-semibold text-foreground">{visual.title}</h4>
                      <Badge variant="outline" className="text-xs uppercase tracking-wide">
                        {visual.type}
                      </Badge>
                    </div>
                    <pre className="whitespace-pre-wrap bg-muted/30 border border-border/40 rounded-lg p-4">
                      {visual.content}
                    </pre>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border/40">
              <CardHeader>
                <CardTitle className="text-xl">Decision Log (Cycles)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Gap Targeted</TableHead>
                      <TableHead>Additions</TableHead>
                      <TableHead>Metrics Δ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decisionLog.map((entry) => (
                      <TableRow key={entry.cycle}>
                        <TableCell className="font-semibold text-foreground">{entry.cycle}</TableCell>
                        <TableCell>{entry.goal}</TableCell>
                        <TableCell>{entry.gapTargeted}</TableCell>
                        <TableCell>{entry.additions}</TableCell>
                        <TableCell>
                          CI {entry.metricsDelta.coverageIndex.toFixed(3)} / ND {entry.metricsDelta.noveltyDelta.toFixed(3)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">KPI Board</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-4 space-y-1">
                    <p className="text-xs uppercase font-semibold text-foreground">Coverage Index</p>
                    <p className="text-2xl font-bold text-foreground">{ultraMetrics.coverageIndex.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Target ≥ 0.96</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-4 space-y-1">
                    <p className="text-xs uppercase font-semibold text-foreground">Rolling Novelty Delta</p>
                    <p className="text-2xl font-bold text-foreground">{ultraMetrics.rollingNoveltyDelta.toFixed(3)}</p>
                    <p className="text-xs text-muted-foreground">Target ≤ 0.02</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-4 space-y-1">
                    <p className="text-xs uppercase font-semibold text-foreground">Review Ratio</p>
                    <p className="text-2xl font-bold text-foreground">{ultraMetrics.reviewRatio.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Band 0.2 – 0.35</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-4 space-y-1">
                    <p className="text-xs uppercase font-semibold text-foreground">Weighted Coverage Score</p>
                    <p className="text-2xl font-bold text-foreground">{ultraMetrics.weightedCoverageScore.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Monitors depth of validated items</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-foreground text-sm">Novelty History</h4>
                  <p className="text-muted-foreground text-sm">{ultraMetrics.rollingNoveltyHistory.join(' → ')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/40">
              <CardHeader>
                <CardTitle className="text-xl">Maintenance & Escalation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Cadence:</span> {ultraMaintenance.cadence}
                </p>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Dashboards to Monitor</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {ultraMaintenance.dashboards.map((dashboard, index) => (
                      <li key={index}>{dashboard}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Triggers</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {ultraMaintenance.triggers.map((trigger, index) => (
                      <li key={index}>{trigger}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Escalation Path</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {ultraMaintenance.escalationPath.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Models</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {models.supported.map((model) => (
                <Badge key={model} variant="outline" className="px-3 py-1">
                  {model}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Routing Defaults</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pipeline Step</TableHead>
                    <TableHead>Model</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(models.routingDefaults).map(([step, model]) => (
                    <TableRow key={step}>
                      <TableCell className="capitalize">{step}</TableCell>
                      <TableCell className="font-mono text-sm">{model}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Data Model Overview</h2>
            <p className="text-muted-foreground max-w-3xl">
              Schema fragments for Prompt Forge&apos;s local-first persistence layer, covering prompts, enhancement profiles, execution traces, and system configuration.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(dataModel.types).map(([typeName, schema]) => (
              <Card key={typeName} className="bg-card/70">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{typeName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs md:text-sm whitespace-pre-wrap bg-muted/40 border border-border/50 rounded-lg p-4 font-mono">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Preloaded Enhancement Profiles</h2>
            <p className="text-muted-foreground max-w-3xl">
              Automation-first workflows that orchestrate deterministic prompt transformations with Nihiltheistic safeguards.
            </p>
          </div>
          <div className="space-y-6">
            {preloadedProfiles.map((profile) => (
              <Card key={profile.id} className="border border-resonance/20">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl">{profile.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {profile.id}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Pipeline</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Step</TableHead>
                          <TableHead>Kind</TableHead>
                          <TableHead>System Prompt</TableHead>
                          <TableHead className="w-24 text-right">Temp</TableHead>
                          <TableHead className="w-32 text-right">Max Tokens</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profile.pipeline.map((step) => (
                          <TableRow key={step.id}>
                            <TableCell className="font-mono text-xs">{step.id}</TableCell>
                            <TableCell className="capitalize">{step.kind}</TableCell>
                            <TableCell className="text-sm">{step.systemPrompt}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{step.temperature}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{step.maxTokens}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-muted/40 border border-border/40">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-semibold">Model Routing</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {profile.modelRouter?.map((rule, index) => (
                          <div key={index} className="space-y-1 text-xs">
                            <div className="font-mono text-muted-foreground">{rule.model}</div>
                            <div className="flex flex-wrap gap-1">
                              {rule.match.stepKinds.map((kind) => (
                                <Badge key={kind} variant="outline" className="text-[10px] uppercase tracking-wide">
                                  {kind}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40 border border-border/40">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-semibold">Scoring Weights</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(profile.scoring).map(([metric, weight]) => (
                          <div key={metric} className="flex items-center justify-between bg-background/60 rounded px-2 py-1">
                            <span className="capitalize">{metric}</span>
                            <span className="font-mono">{weight}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40 border border-border/40">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-semibold">Constraints</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        {profile.constraints?.map((constraint) => (
                          <div key={constraint.id} className="bg-background/60 rounded px-3 py-2 space-y-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono text-[11px] uppercase tracking-wide">{constraint.id}</span>
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                                {constraint.enforcement}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{constraint.description}</p>
                          </div>
                        )) || <p className="text-muted-foreground">No explicit constraints.</p>}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Interface Architecture</h2>
            <p className="text-muted-foreground max-w-3xl">
              Prompt Forge organises its single-user workspace across coordinated panels with rapid-access automation controls.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout & Sidebar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">Layout</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ui.layout.map((item) => (
                      <Badge key={item} variant="outline" className="uppercase tracking-wide text-[11px]">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Sidebar Collections</h4>
                  <p className="text-muted-foreground">{ui.sidebar.collections.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Filters</h4>
                  <p className="text-muted-foreground">{ui.sidebar.filters.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Watchers</h4>
                  <Badge variant={ui.sidebar.watchers ? 'default' : 'secondary'}>{ui.sidebar.watchers ? 'Enabled' : 'Disabled'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Main Panel Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">Editor</h4>
                  <Badge variant="secondary" className="uppercase tracking-wide text-[11px]">
                    {ui.mainPanel.editor}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Controls</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ui.mainPanel.controls.map((control) => (
                      <Badge key={control} variant="outline" className="text-[11px] uppercase tracking-wide">
                        {control}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Context Drawer</h4>
                  <p className="text-muted-foreground">{ui.mainPanel.contextDrawer.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Live Warnings</h4>
                  <p className="text-muted-foreground">{ui.mainPanel.liveWarnings.join(', ')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Output Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">Tabs</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ui.outputPanel.tabs.map((tab) => (
                      <Badge key={tab} variant="outline" className="text-[11px] uppercase tracking-wide">
                        {tab}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Quick Copy Targets</h4>
                  <p className="text-muted-foreground">{ui.outputPanel.quickCopy.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Re-run Per Step</h4>
                  <Badge variant={ui.outputPanel.rerunPerStep ? 'default' : 'secondary'}>
                    {ui.outputPanel.rerunPerStep ? 'Available' : 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(ui.shortcuts).map(([action, shortcut]) => (
                  <div key={action} className="flex items-center justify-between bg-muted/40 rounded px-3 py-2">
                    <span className="font-semibold text-foreground">{action}</span>
                    <span className="font-mono text-muted-foreground">{shortcut}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation & Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold">Automation Capabilities</h4>
                <ul className="list-disc list-inside text-muted-foreground">
                  {Object.entries(automation).map(([key, value]) => (
                    <li key={key} className={value ? '' : 'line-through'}>
                      {key}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Import / Export Formats</h4>
                <p className="text-muted-foreground">{importExport.formats.join(', ')}</p>
              </div>
              <div>
                <h4 className="font-semibold">Obsidian Sync</h4>
                <p className="text-muted-foreground">
                  Frontmatter: {importExport.obsidian.mdWithFrontmatter ? 'yes' : 'no'} · Trace JSON: {importExport.obsidian.companionTraceJson ? 'yes' : 'no'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Drive Sync</h4>
                <p className="text-muted-foreground">
                  Enabled: {importExport.driveSync.enabled ? 'yes' : 'no'} · Hash Dedup: {importExport.driveSync.hashDedup ? 'yes' : 'no'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">Local Encryption</h4>
                <p className="text-muted-foreground">
                  Algorithm: {security.localEncryption.algorithm} · Passphrase Optional: {security.localEncryption.passphraseOptional ? 'yes' : 'no'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Telemetry</h4>
                <p className="text-muted-foreground">{security.telemetry}</p>
              </div>
              <div>
                <h4 className="font-semibold">Redaction</h4>
                <p className="text-muted-foreground">
                  {Object.entries(security.redaction)
                    .map(([key, value]) => `${key}: ${value ? 'enabled' : 'disabled'}`)
                    .join(' · ')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Default Domains</h4>
                <p className="text-muted-foreground">{defaults.domains.join(', ')}</p>
              </div>
              <div>
                <h4 className="font-semibold">Default Auto-Tags</h4>
                <p className="text-muted-foreground">{defaults.autoTags.join(', ')}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Constraints Library</h4>
                <div className="space-y-2">
                  {defaults.constraintsLibrary.map((constraint) => (
                    <div key={constraint.id} className="bg-muted/40 rounded px-3 py-2 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono uppercase tracking-wide">{constraint.id}</span>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          {constraint.enforcement}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{constraint.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Acceptance Tests</h2>
            <p className="text-muted-foreground max-w-3xl">
              Regression guardrails ensuring deterministic runs, ledger fidelity, and absence of collaborative surfaces.
            </p>
          </div>
          <Card>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                {acceptanceTests.map((test) => (
                  <li key={test} className="bg-muted/40 rounded px-3 py-2">
                    {test}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PromptForge;
