import { Link } from "react-router";
import ProcessRail from "../components/ProcessRail";
import ReconciliationDemo from "../components/ReconciliationDemo";
import SectionRef from "../components/SectionRef";
import { availabilityLine, processSteps, solutions, tools } from "../data/products";

const sectionTitle = "mt-4 font-display text-(length:--text-h2) leading-[1.05] tracking-tight";

const trustReasons = [
  {
    title: "From the profession.",
    body: "Endloops began as the technology department of Alkazim, an accounting and audit firm in Dubai. It was built for this work, by people around this work.",
  },
  {
    title: "Prepared, never presumed.",
    body: "The software does the preparing. A person always reviews, decides and signs.",
  },
  {
    title: "Focused on your field.",
    body: "Accounting, audit and property finance. Not automation for everything.",
  },
];

// Everything on the home page after the 3D scroll.
export default function HomeSections() {
  return (
    <>
      <section aria-labelledby="problem-title" className="page section">
        <SectionRef>B1</SectionRef>
        <h2 id="problem-title" className={`${sectionTitle} max-w-4xl`}>
          Skilled people shouldn't spend the day retyping invoices.
        </h2>
        <p className="mt-6 max-w-2xl text-slate">
          Much of a finance professional's day goes on work software can handle. It is repetitive and
          slow, it leaves room for error, and it pulls attention away from judgement and from clients.
        </p>
      </section>

      <section aria-labelledby="two-ways-title" className="page section border-t border-line">
        <SectionRef>B2</SectionRef>
        <h2 id="two-ways-title" className={sectionTitle}>
          Run a whole process, or fix one step.
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <article className="border-t-2 border-blue pt-6">
            <ProcessRail accent="blue" lit={processSteps} />
            <h3 className="mt-8 text-2xl font-semibold text-blue">End-to-end solutions</h3>
            <p className="mt-1 font-display text-3xl">Hand over the process.</p>
            <p className="mt-4 text-slate">
              Complete software that runs an entire process or financial service, from first document
              to final review.
            </p>
            <p className="mt-4">
              <strong>Best when</strong> you want a whole engagement handled as one.
            </p>
            <ul className="mt-6 border-t border-line">
              {solutions.map((solution) => (
                <li key={solution.name} className="border-b border-line py-2">
                  {solution.fullName ?? solution.name}
                </li>
              ))}
            </ul>
            <Link to="/solutions" className="mt-6 inline-block font-semibold text-blue underline underline-offset-4">
              Explore solutions
            </Link>
          </article>

          <article className="border-t-2 border-purple pt-6">
            <ProcessRail accent="purple" lit={["Check"]} />
            <h3 className="mt-8 text-2xl font-semibold text-purple">Standalone tools</h3>
            <p className="mt-1 font-display text-3xl">Fix the bottleneck.</p>
            <p className="mt-4 text-slate">
              Focused tools that do one job well and work on their own, alongside how your team
              already runs.
            </p>
            <p className="mt-4">
              <strong>Best when</strong> one task is eating your team's week.
            </p>
            <ul className="mt-6 border-t border-line">
              {tools.map((tool) => (
                <li key={tool.name} className="border-b border-line py-2">
                  {tool.name}
                </li>
              ))}
            </ul>
            <Link to="/tools" className="mt-6 inline-block font-semibold text-purple underline underline-offset-4">
              Explore tools
            </Link>
          </article>
        </div>

        <p className="mt-12 text-sm text-slate">{availabilityLine}</p>
      </section>

      <section aria-labelledby="demo-title" className="bg-mist">
        <div className="page section">
          <SectionRef>C1</SectionRef>
          <h2 id="demo-title" className={sectionTitle}>
            Try the part that matters.
          </h2>
          <p className="mb-10 mt-6 max-w-2xl text-slate">
            A small reconciliation with one difference from a typical demo: it won't finish without you.
          </p>
          <ReconciliationDemo />
        </div>
      </section>

      <section aria-labelledby="trust-title" className="page section">
        <SectionRef>D1</SectionRef>
        <h2 id="trust-title" className={`${sectionTitle} max-w-4xl`}>
          Made by people who know what a review is for.
        </h2>
        <div className="mt-12 grid border-t border-navy md:grid-cols-3">
          {trustReasons.map((reason) => (
            <article
              key={reason.title}
              className="border-b border-line py-6 md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0"
            >
              <h3 className="text-2xl font-semibold">{reason.title}</h3>
              <p className="mt-4 text-slate">{reason.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="closing-title" className="on-navy bg-navy text-white">
        <div className="page section">
          <h2 id="closing-title" className="max-w-4xl font-display text-(length:--text-display) leading-[1.02] tracking-tight">
            What does your team dread doing every month?
          </h2>
          <p className="mt-6 max-w-xl">Tell us about it. We'll show you how much of it software can prepare.</p>
          <Link to="/contact" className="btn btn-light mt-8">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
