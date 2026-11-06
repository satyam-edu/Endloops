import { useState } from "react";
import { Link } from "react-router";
import SectionRef from "../components/SectionRef";
import { availabilityLine, capabilities, tools, type Capability } from "../data/products";

export default function Tools() {
  const [filter, setFilter] = useState<Capability | "All">("All");
  const shown = filter === "All" ? tools : tools.filter((tool) => tool.capabilities.includes(filter));

  return (
    <>
      <section className="page section">
        <SectionRef className="text-purple">T1</SectionRef>
        <h1 className="mt-4 max-w-5xl font-display text-(length:--text-display) leading-[1.02] tracking-tight">
          One job, done well, on its own.
        </h1>
        <p className="mt-6 max-w-2xl text-slate">
          Not every team needs a whole new process. Each tool solves one specific need and can be used
          by itself.
        </p>
      </section>

      <section aria-label="Standalone tools" className="page pb-16">
        <div role="group" aria-label="Filter tools by what they do" className="flex flex-wrap gap-2">
          {(["All", ...capabilities] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={`min-h-11 cursor-pointer rounded-md border border-purple px-4 text-sm font-semibold ${
                filter === option ? "bg-purple text-white" : "text-purple"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <p role="status" className="mt-4 text-sm text-slate">
          Showing {shown.length} of {tools.length} tools
        </p>

        <ul className="mt-6 grid border-t-2 border-purple md:grid-cols-2">
          {shown.map((tool) => (
            <li key={tool.name} className="border-b border-line py-8 md:pr-12">
              <h2 className="text-2xl font-semibold">{tool.name}</h2>
              <p className="mt-2 max-w-md text-slate">{tool.line}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Capabilities">
                {tool.capabilities.map((capability) => (
                  <li key={capability} className="rounded border border-purple px-2 font-mono text-sm text-purple">
                    {capability}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate">{availabilityLine}</p>
      </section>

      <section className="bg-mist">
        <div className="page flex flex-wrap items-center justify-between gap-6 py-16">
          <h2 className="font-display text-(length:--text-h2) leading-tight tracking-tight">
            Have a task that isn't listed?
          </h2>
          <Link to="/contact" className="btn btn-primary">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
