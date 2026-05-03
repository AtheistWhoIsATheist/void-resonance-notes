# PHILOVOID: Saturated Architecture Specification for a Nihiltheism Dissertation System

## 0) Scope and Design Intent

PHILOVOID is a dissertation-specific epistemic infrastructure for developing, stress-testing, and defending **Nihiltheism** as a first-generation philosophical construct. The system is not modeled as a convenience layer over notes. It is modeled as a **formal argument environment** that:

1. externalizes conceptual and argumentative dependencies into a typed graph,
2. fuses semantic, lexical, and structural retrieval for philosophical reasoning,
3. enforces note and claim discipline to prevent epistemic drift,
4. performs coherence and vulnerability analysis continuously,
5. simulates adversarial oral defense conditions through tradition-specific committee personas.

The architecture is therefore both technical and methodological. It operationalizes a thesis about philosophy itself: rigorous philosophical production can be represented as a traversable, inspectable structure without flattening its phenomenological richness.

---

## 1) Problem Topology: What the System Must Solve

### 1.1 The First-Generation Concept Burden

Nihiltheism does not inherit a stabilized debate grammar. Unlike dissertations embedded in established schools, the candidate must satisfy four concurrent burdens:

- **Definitional burden**: the term must be coherent, non-circular, and non-redundant.
- **Genealogical burden**: adjacent traditions must be mapped with explicit similarity/difference logic.
- **Methodological burden**: phenomenological claims require method accountability (what is described, how it is described, what license is claimed).
- **Bridge burden**: positioning between theism and atheism guarantees bilateral critique; the system must prepare for simultaneous cross-tradition pressure.

### 1.2 Core Risk Classes

- **Semantic collapse**: “Nihiltheism” degenerates into a label for an existing position.
- **Method drift**: first-person reports are asserted as universal without phenomenological warrant.
- **Inference smuggling**: ontological conclusions are imported from phenomenological description without an explicit bridge argument.
- **Dependency opacity**: central claims rely on undefended premises hidden in prose.
- **Defense asymmetry**: prepared for one tradition’s objections but exposed to another’s.

### 1.3 Stakeholders and Their Epistemic Demands

- **Candidate**: precision, memory extension, vulnerability visibility, rehearsal realism.
- **Committee**: definitional rigor, inferential transparency, textual fidelity, methodological legitimacy.
- **Future readers**: lineage honesty, reproducible argument maps, source auditability.
- **System maintainers**: schema stability, ingest reliability, transparent retrieval behavior.

---

## 2) Entity-Complete Domain Model

### 2.1 Philosophical Entities

#### ConceptNode
Represents a technical concept as used in the dissertation.

**Required fields**
- `id: UUID`
- `name: string`
- `canonical_aliases: string[]`
- `definition_current: text`
- `definition_mode: enum {stipulative, reconstructive, inherited, negative, operational}`
- `definition_scope: enum {universal, contextual, tradition-bound, authorial}`
- `centrality_nt: float [0,1]`
- `stability_score: float [0,1]`
- `usage_diverges_from_canonical: boolean`
- `divergence_note: text`
- `first_explicit_use: (ThinkerNode|TextNode)`
- `phenomenological_valence: enum {positive, negative, neutral, paradoxical}`
- `ontological_commitment_level: enum {none, weak, moderate, strong}`

**Why this matters**: most conceptual disputes at defense are not about labels but scope, commitment, and divergence logic.

#### ThinkerNode
Encodes interpretive provenance and likely committee references.

- `name`, `period`, `traditions[]`
- `stance_nihilism`, `stance_theism`
- `texts_primary[]`
- `committee_likely_invocation: boolean`
- `interpretive_hazard_note` (e.g., common misreadings)

#### ClaimNode
Atomic thesis-bearing unit.

- `statement`
- `type {ontological, phenomenological, epistemological, ethical, methodological, definitional}`
- `scope`
- `chapter_anchor`
- `depends_on[]`
- `entails[]`
- `evidence[]`
- `vulnerability_score`
- `defense_status`
- `burden_of_proof_level`

#### ObjectionNode
Formalized attack surface.

- `statement`
- `type {logical, semantic, empirical, phenomenological, theological, methodological, ethical}`
- `source_tradition`
- `severity`
- `targets[]`
- `likelihood_by_persona` (map)
- `rebuttal_ref?`

#### RebuttalNode
Explicit response strategy.

- `strategy {direct_refutation, distinction, scope_limit, reframing, concession+qualification, parity_critique}`
- `argument_text`
- `strength`
- `residual_risk`
- `needs_development`
- `supporting_evidence[]`

### 2.2 Source and Passage Entities

#### TextNode
- bibliographic metadata,
- relevance class (`foundational/supportive/critical/analogical/tangential`),
- reading depth,
- citation frequency in dissertation,
- interpretation confidence.

#### PassageNode
Minimum retrieval atom for source-grounded reasoning.

- passage text or strict paraphrase,
- precise location (page/section),
- embedding vector,
- `block_type`,
- commentary,
- linked claims/objections.

### 2.3 Dissertation Structure Entities

#### ChapterNode
- thesis function,
- central and sub-arguments,
- transition logic,
- completeness state,
- unresolved tensions list.

#### DefinitionNode + Versioning
- term,
- formal definition,
- type,
- introduction locus,
- version chain,
- challenge risk.

Every definition update must emit a dependency recheck event.

### 2.4 Operational Entities

- `Note` (typed; never generic),
- `Tag` (hierarchical + orthogonal dimensions),
- `Session` (research/writing/defense),
- `Gap` (argument/source/method/category),
- `DecisionRecord` (why a conceptual choice was made),
- `Task` (remediation with deadline and priority).

---

## 3) Relation-Complete Edge Model

Relations are first-class and typed; each edge includes confidence, provenance, and rationale.

### 3.1 Conceptual Relations

- `INFLUENCES(A→B)` historical/logical shaping
- `EXTENDS(A→B)` continuity with augmentation
- `CONTRASTS_WITH(A↔B)` non-exclusive tension
- `CONTRADICTS(A→B)` incompatibility under shared scope
- `PRESUPPOSES(A→B)` dependency precondition
- `INSTANTIATES(A→B)` subtype/case relation
- `BRIDGES(A→B)` mediation across oppositions
- `TRANSFORMS(A→B)` reframing preserving core material
- `NEGATES(A→B)` explicit negation/absence
- `PHENOMENOLOGICALLY_PRECEDES(A→B)` experiential order

### 3.2 Argumentative Relations

- `SUPPORTS(Evidence→Claim)`
- `UNDERMINES(Objection→Claim)`
- `REBUTS(Rebuttal→Objection)`
- `DEPENDS_ON(Claim→Claim)`
- `ENTAILS(Claim→Claim)`
- `IS_CONSISTENT_WITH(Claim↔Claim)`
- `REQUIRES_DISTINCTION_FROM(Claim→Concept)`

### 3.3 Genealogical Relations

- `HISTORICALLY_PRECEDES`
- `RESPONDS_TO`
- `APPROPRIATES_FROM`
- `MISREADS` (explicitly annotated claim)
- `ANTICIPATES` (partial prefiguration)

### 3.4 Edge Quality Metadata

Each edge stores:
- `weight`
- `confidence`
- `justification_text`
- `sources[]`
- `created_by {human|llm|hybrid}`
- `last_validated_at`

---

## 4) Nihiltheism Core Subgraph (Canonical Topology)

### 4.1 First-Order Structure

`NIHILTHEISM` should minimally encode:

- `BRIDGES` → Classical Theism
- `BRIDGES` → Traditional Atheism
- `EXTENDS` → Existential Phenomenology
- `EXTENDS` → Negative Theology
- `TRANSFORMS` → Nihilism (terminal → transitional/gateway role)
- `CONTRASTS_WITH` → Religious Existentialism, Secular Existentialism, Apophatic Theology, Buddhist Śūnyatā
- `PRESUPPOSES` → Phenomenological Method, experiential meaning-collapse, transcendence concept
- `REQUIRES_DISTINCTION_FROM` → naive nihilism, mystical atheism, death-of-God theology, weak theology

### 4.2 Second-Order Constraints

- Theism/atheism opposition must be represented independently; Nihiltheism’s bridge role references that conflict rather than erasing it.
- Experiential chain claims (`meaning-collapse → void encounter → opening`) must be linked to both descriptive passages and justificatory argument nodes.
- “Void as transcendence” must appear as a defended claim, not as an unqualified definition shortcut.

### 4.3 Topological Health Checks

- orphan central nodes = schema failure,
- high-centrality node with low evidence degree = defense risk,
- many contradictions without rebuttal edges = coherence risk,
- bridge claims without distinction edges = likely committee attack vector.

---

## 5) PKM Architecture: Typed Cognitive Workflow

### 5.1 Note Types and Their Non-Substitutability

#### Atomic Concept Note
One concept only. Includes canonical usage, authorial usage, divergence rationale, phenomenological profile, argument role, unresolved tensions.

#### Literature Note
Not summary but dialogue:
- thesis,
- method,
- numbered argument extraction,
- key passages + commentary,
- contribution/challenge to NT,
- what text cannot explain.

#### Argument Note
Must include explicit logical form and premise-level defendability checks.

#### Defense Question Note
Must be authored in persona voice; stores anticipated follow-ups and confidence trend across rehearsals.

#### Synthesis Note
Captures cross-source novelty; mandatory action mapping (where integrated in dissertation).

#### Tension Note
Formalizes internal contradictions and classifies them as fatal/productive/apparent/definitional.

### 5.2 Tag Architecture (Orthogonal Dimensions)

1. Tradition tags
2. Function tags
3. Defense-priority tags
4. Status tags
5. Thinker tags
6. Method tags (`#eidetic`, `#genealogical`, `#analytic-formalization`)

Tagging is query infrastructure, not decoration.

### 5.3 Example High-Value Queries

- all `#core-claim #defense-critical #contested` notes lacking rebuttal links,
- all claims with vulnerability > 0.75 and evidence count < 3,
- all definitions changed in last 14 days with downstream dependency count > 5,
- all objections likely from analytic persona unrehearsed this month.

---

## 6) Retrieval Stack: Mechanism-Level Specification

### 6.1 Why Hybrid Is Mandatory

No single retrieval mode captures philosophical relevance:

- **Vector**: captures semantic neighborhood but confuses opposition/support.
- **BM25**: captures exact terms and names, misses paraphrastic conceptual continuity.
- **Graph traversal**: captures argument structure but depends on graph maturity.

### 6.2 Fusion Architecture

Recommended default: **graph-constrained cascade**

1. graph traversal creates candidate neighborhood from seed claims/concepts,
2. semantic reranking orders conceptual proximity,
3. lexical boost elevates exact-term critical items,
4. reciprocal rank fusion as fallback when graph density is low.

### 6.3 Chunking for Philosophy

Chunk by argumentative boundaries, not fixed tokens:

- premise,
- definition,
- objection,
- rebuttal,
- phenomenological description,
- quotation+commentary pair.

### 6.4 Required Chunk Metadata

- `block_type`
- `argument_id`
- `logical_position`
- `requires_context_from[]`
- `scope_marker`
- `stance_marker {supportive|critical|ambivalent}`

### 6.5 Context Assembly Requirements

`_assemble_context` should enforce:

- token budgeting with dependency completion,
- anti-fragmentation (retrieve linked prerequisite blocks),
- evidence diversity (avoid all context from one source),
- citation-ready provenance traces.

---

## 7) LLM Routing and Generation Control

### 7.1 Task-Aware Routing Matrix

| Task | Model Class | Temp | Key Constraint |
|---|---|---:|---|
| Definition precision | high-precision general model | 0.1–0.3 | no metaphorical drift |
| Objection generation | reasoning model | 0.6–0.8 | adversarial but tradition-anchored |
| Coherence checking | reasoning model | 0.1–0.2 | explicit contradiction tracing |
| Defense simulation | dialog model + persona prompt | 0.7–0.9 | style fidelity + pressure realism |
| Literature synthesis | balanced model | 0.4–0.6 | source-grounded integration |

### 7.2 Prompt Contracts

System prompts must explicitly include:

- scope of claim under evaluation,
- forbidden inference shortcuts,
- required distinction list,
- citation/provenance obligation,
- “unknown” behavior for evidence gaps.

### 7.3 Hallucination Controls

- source-required mode for objections attributed to traditions,
- unsupported assertions tagged `speculative`,
- post-generation claim extraction + evidence backcheck,
- rejection of invented references.

### 7.4 Fine-Tuning Strategy (Optional, High Impact)

Corpus strata:
- primary thinkers,
- key secondary literature,
- dissertation drafts,
- definition ledger,
- curated adversarial critiques.

Never fine-tune solely on authorial text (echo-chamber amplification risk).

---

## 8) Defense Simulation Engine

### 8.1 Persona Schema

Each persona includes:
- tradition,
- inferential norms,
- preferred vocabulary,
- red-flag triggers,
- objection library,
- questioning tempo/style,
- escalation patterns.

### 8.2 Question Generation Pipeline

1. prioritize high-vulnerability claims,
2. instantiate relevant objections in persona idiom,
3. chain dependency attacks,
4. exploit open gaps (`#needs-source`, `#needs-argument`),
5. generate follow-up branches based on likely answer classes.

### 8.3 Response Evaluation Rubric

- challenge coverage,
- term precision,
- evidence specificity,
- distinction adequacy,
- inferential validity,
- brevity appropriateness,
- new vulnerability creation.

### 8.4 Training Modes

- timed rapid-fire,
- deep single-question oral exam,
- hostile committee simulation,
- mixed committee dynamics,
- retrospective debrief with transcript annotation.

---

## 9) Coherence and Integrity Analysis

### 9.1 Consistency Classes

- **Ontological vs phenomenological**: prevent illegitimate jumps.
- **Definition stability**: detect semantic drift across chapters.
- **Dependency completeness**: no undefended terminal premises.
- **Scope consistency**: universal vs possible vs exemplary claims kept distinct.

### 9.2 Drift Detection

Term-use embeddings + rule checks:
- same token, divergent meaning,
- changed meaning, unchanged confidence rhetoric,
- inconsistent distinction boundaries.

### 9.3 Contradiction Handling Policy

For each contradiction:
- classify (true contradiction vs apparent tension),
- choose response (resolve/acknowledge/reframe),
- require explicit dissertation placement of outcome.

---

## 10) Ingestion and Update Pipeline

1. normalize source format,
2. extract metadata,
3. argument-aware chunking,
4. entity/relation extraction,
5. embedding + index insertion,
6. graph linking/disambiguation,
7. conflict and novelty detection,
8. downstream task creation (e.g., unresolved contradiction review),
9. audit log write.

### 10.1 Disambiguation Rules

- identical term with tradition-specific senses must fork concept variants,
- thinker references resolve via authority table,
- low-confidence links remain provisional until human confirmation.

### 10.2 Revision Cascades

Definition changes trigger:
- impacted claim list,
- impacted rebuttal list,
- defense question invalidation/rewrite queue.

---

## 11) Interface Architecture

### 11.1 Graph Explorer

Must support:
- node/edge type filters,
- hop-depth controls,
- contradiction-only and vulnerability-only overlays,
- shortest argumentative path,
- centrality and evidential heatmaps.

### 11.2 Writing Workspace

- inline claim extraction,
- live evidence coverage prompts,
- definition consistency alerts,
- one-click link to relevant objections.

### 11.3 Defense Dashboard

- defended-claim percentage,
- unrebutted severe objections,
- rehearsal coverage per persona,
- time-to-defense priority queue.

---

## 12) Failure Modes and Boundary Conditions

### 12.1 Technical

- vector staleness after major revisions,
- graph sparsity early-stage,
- token starvation for multi-premise contexts,
- retrieval score calibration drift,
- dependency cycles in claim graphs.

### 12.2 Philosophical

- over-claiming originality,
- under-acknowledging lineage debts,
- rhetorical inflation of phenomenology into ontology,
- treating productive ambiguity as precision.

### 12.3 Governance Controls

- human approval required for high-impact edge insertions,
- provenance mandatory for critical claims,
- periodic adversarial corpus refresh,
- explicit uncertainty annotations in outputs.

---

## 13) Comparative Positioning

PHILOVOID differs from:

- **Generic PKM tools**: they store notes; PHILOVOID encodes inferential structure.
- **Standard RAG chat**: retrieves semantically similar text; PHILOVOID retrieves argumentatively relevant structure.
- **Plain graph note apps**: link pages loosely; PHILOVOID enforces typed philosophical relations with defense semantics.

---

## 14) Implementation Roadmap (Operational)

### Phase 1: Core Substrate
- graph schema,
- chunking and ingestion,
- hybrid retrieval baseline,
- context assembler dependency logic.

### Phase 2: Authoring Discipline
- typed notes,
- tag ontology,
- claim extraction and dependency visuals.

### Phase 3: Intelligence Layer
- coherence checks,
- genealogy engine,
- drift and contradiction analysis.

### Phase 4: Defense System
- persona scaffolding,
- question generation,
- rubric scoring,
- rehearsal analytics.

### Phase 5: Hardening
- performance,
- observability,
- auditability,
- export/report pipelines.

### Phase 6: Dissertation-Close Mode
- freeze windows,
- regression checks on key definitions,
- final defense playbook generation.

---

## 15) Success Criteria and KPIs

- % core claims with evidence coverage above threshold,
- % severe objections with strong/decisive rebuttals,
- definition drift rate trend,
- rehearsal improvement slope by persona,
- retrieval precision@k for defense-critical queries,
- unresolved contradiction count near defense date.

---

## 16) Strategic Commitment

PHILOVOID’s central commitment is that philosophical rigor can be made operationally inspectable. The platform must preserve nuance while forcing inferential accountability. Its job is not to automate philosophy, but to make the dissertation’s conceptual and argumentative architecture explicit enough to be tested under adversarial scrutiny without losing phenomenological depth.
