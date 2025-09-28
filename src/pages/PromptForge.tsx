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

const { product, models, dataModel, preloadedProfiles, ui, automation, importExport, security, acceptanceTests, defaults } =
  promptForgeSpec;

const PromptForge = () => {
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
              Detailed product blueprint for a deterministic, automation-first enhancement environment anchored in Nihiltheistic methodology.
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
