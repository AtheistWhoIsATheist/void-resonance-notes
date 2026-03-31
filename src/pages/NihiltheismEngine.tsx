import { Brain, CalendarCheck2, GitFork, Network } from "lucide-react";

const projects = [
  { name: "Journal314", status: "High Maturity", notes: 42, gaps: 3 },
  { name: "REN", status: "Emerging", notes: 12, gaps: 8 },
];

export default function NihiltheismEngine() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 md:p-12">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.25em] text-zinc-500">NKE / RESEARCH STUDIO</p>
        <h1 className="text-4xl font-light tracking-tight">Nihiltheism Knowledge Engine</h1>
        <p className="text-zinc-400 max-w-3xl">
          A second-brain control plane for corpus ingestion, philosophical gap-hunting, and
          graph-grounded synthesis.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.name}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md p-6"
          >
            <h2 className="text-xl">{project.name}</h2>
            <p className="text-zinc-400 text-sm mt-1">{project.status}</p>
            <div className="mt-4 flex gap-3 text-sm text-zinc-300">
              <span>{project.notes} notes</span>
              <span>•</span>
              <span>{project.gaps} open gaps</span>
            </div>
          </article>
        ))}

        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md p-6 flex flex-col items-start">
          <CalendarCheck2 className="h-5 w-5 text-zinc-300" />
          <h2 className="mt-3 text-lg">Weekly Agenda</h2>
          <p className="text-zinc-400 text-sm mt-1">Analyze unresolved questions and generate research priorities.</p>
          <button className="mt-4 rounded-lg bg-zinc-100 text-zinc-950 px-4 py-2 text-sm hover:bg-zinc-200 transition-colors">
            Generate Review
          </button>
        </article>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-2 min-h-[320px]">
          <div className="flex items-center gap-2 text-zinc-300">
            <Network className="h-4 w-4" />
            Knowledge Graph Visualization
          </div>
          <div className="h-[250px] mt-5 rounded-xl border border-zinc-800 bg-zinc-950/80 grid place-items-center text-zinc-600">
            [ WebGL graph canvas placeholder ]
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
          <div className="flex items-center gap-2 text-zinc-300">
            <Brain className="h-4 w-4" />
            Active Agents
          </div>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li>Interlocutor: contextual dialogue synthesis</li>
            <li>Analyst: contradiction and assumption checks</li>
            <li>Gap-Hunter: missing premises and unresolved threads</li>
          </ul>
          <div className="flex items-center gap-2 text-zinc-300 pt-2">
            <GitFork className="h-4 w-4" />
            Hybrid retrieval: BM25 + pgvector
          </div>
        </div>
      </section>
    </div>
  );
}
