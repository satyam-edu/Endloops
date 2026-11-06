import { Link } from "react-router";
import ProcessRail from "../components/ProcessRail";
import SectionRef from "../components/SectionRef";
import { availabilityLine, processSteps, solutions } from "../data/products";

export default function Solutions() {
  return (
    <>
      <section className="page section">
        <SectionRef className="text-blue">S1</SectionRef>
        <h1 className="mt-4 max-w-5xl font-display text-(length:--text-display) leading-[1.02] tracking-tight">
          Whole processes, prepared from start to finish.
        </h1>
        <p className="mt-6 max-w-2xl text-slate">
          When the work is a full engagement, a single tool isn't enough. Our end-to-end solutions run
          the entire process, and bring the finished preparation to your reviewer.
        </p>
      </section>

      <section aria-label="End-to-end solutions" className="page pb-16">
        <ul className="border-t-2 border-blue">
          {solutions.map((solution) => (
            <li key={solution.name} className="grid gap-6 border-b border-line py-8 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-2xl font-semibold">{solution.name}</h2>
                <p className="mt-2 max-w-xl text-slate">{solution.line}</p>
              </div>
              <ProcessRail accent="blue" lit={processSteps} />
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate">{availabilityLine}</p>
      </section>

      <section className="bg-mist">
        <div className="page flex flex-wrap items-center justify-between gap-6 py-16">
          <h2 className="font-display text-(length:--text-h2) leading-tight tracking-tight">Not sure which fits?</h2>
          <Link to="/contact" className="btn btn-primary">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
