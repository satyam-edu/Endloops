import { Link } from "react-router";
import PageHero from "../components/PageHero";
import ProcessRail from "../components/ProcessRail";
import { availabilityLine, processSteps, solutions } from "../data/products";

export default function Solutions() {
  return (
    <>
      <PageHero
        background="bg-blue"
        sheets={8}
        title={
          <>
            Whole processes, <span className="accent">prepared from start to finish.</span>
          </>
        }
      >
        When the work is a full engagement, a single tool isn't enough. Our end-to-end solutions run the
        entire process, and bring the finished preparation to your reviewer.
      </PageHero>

      <section aria-label="End-to-end solutions" className="page py-16">
        <ul>
          {solutions.map((solution) => (
            <li
              key={solution.name}
              className="grid gap-6 border-b border-line py-10 first:pt-0 lg:grid-cols-2 lg:items-center lg:gap-16"
            >
              <div>
                <h2 className="heading text-[2.25rem] text-blue">{solution.name}</h2>
                <p className="mt-3 max-w-xl text-slate">{solution.line}</p>
              </div>
              <ProcessRail theme="blue" lit={processSteps} />
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate">{availabilityLine}</p>
      </section>

      <section className="on-navy bg-navy text-white">
        <div className="page flex flex-wrap items-center justify-between gap-6 py-16">
          <h2 className="heading text-(length:--text-h2)">Not sure which fits?</h2>
          <Link to="/contact" className="btn btn-light">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
