import { useState } from "react";
import { Link } from "react-router";
import PageHero from "../components/PageHero";
import { availabilityLine, capabilities, tools, type Capability } from "../data/products";

export default function Tools() {
  const [filter, setFilter] = useState<Capability | "All">("All");
  const shown = filter === "All" ? tools : tools.filter((tool) => tool.capabilities.includes(filter));

  return (
    <>
      <PageHero
        background="bg-purple"
        sheets={1}
        title={
          <>
            One job, done well, <span className="accent">on its own.</span>
          </>
        }
      >
        Not every team needs a whole new process. Each tool solves one specific need and can be used by itself.
      </PageHero>

      <section aria-label="Standalone tools" className="bg-mist">
        <div className="page py-16">
          <div role="group" aria-label="Filter tools by what they do" className="flex flex-wrap gap-2">
            {(["All", ...capabilities] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
                className={`min-h-11 cursor-pointer rounded-md border border-purple px-4 text-sm font-semibold ${
                  filter === option ? "bg-purple text-white" : "bg-white text-purple"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p role="status" className="mt-4 text-sm text-slate">
            Showing {shown.length} of {tools.length} tools
          </p>

          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((tool) => (
              <li
                key={tool.name}
                className="paper-shadow group flex flex-col rounded-md bg-white p-6 transition duration-300 hover:-translate-y-1 hover:bg-purple hover:text-white motion-reduce:transform-none"
              >
                <h2 className="heading text-2xl">{tool.name}</h2>
                <p className="mb-6 mt-3 text-slate transition-colors duration-300 group-hover:text-white">{tool.line}</p>
                <ul className="mt-auto flex flex-wrap gap-2" aria-label="Capabilities">
                  {tool.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="rounded border border-purple px-2 font-mono text-sm text-purple transition-colors duration-300 group-hover:border-white group-hover:text-white"
                    >
                      {capability}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-slate">{availabilityLine}</p>
        </div>
      </section>

      <section className="on-navy bg-navy text-white">
        <div className="page flex flex-wrap items-center justify-between gap-6 py-16">
          <h2 className="heading text-(length:--text-h2)">Have a task that isn't listed?</h2>
          <Link to="/contact" className="btn btn-light">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
