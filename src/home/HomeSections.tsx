import { Link } from "react-router";
import PaperStack from "../components/PaperStack";
import ProcessRail from "../components/ProcessRail";
import ReconciliationDemo from "../components/ReconciliationDemo";
import SectionRef from "../components/SectionRef";
import useInView from "../components/useInView";
import { availabilityLine, processSteps, solutions, tools } from "../data/products";

const sectionTitle = "heading mt-4 text-(length:--text-h2)";

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

const ways = [
  {
    background: "bg-blue",
    kind: "End-to-end solutions",
    promise: "Hand over the process.",
    description:
      "Complete software that runs an entire process or financial service, from first document to final review.",
    best: "you want a whole engagement handled as one.",
    items: solutions.map((solution) => solution.fullName ?? solution.name),
    lit: processSteps,
    link: "/solutions",
    linkLabel: "Explore solutions",
  },
  {
    background: "bg-purple",
    kind: "Standalone tools",
    promise: "Fix the bottleneck.",
    description:
      "Focused tools that do one job well and work on their own, alongside how your team already runs.",
    best: "one task is eating your team's week.",
    items: tools.map((tool) => tool.name),
    lit: ["Check"],
    link: "/tools",
    linkLabel: "Explore tools",
  },
];

// Everything on the home page after the 3D scroll.
export default function HomeSections() {
  const [demo, demoSeen] = useInView<HTMLDivElement>();

  return (
    <>
      <section aria-labelledby="problem-title" className="page section">
        <SectionRef>B1</SectionRef>
        <h2 id="problem-title" className="mt-4 text-(length:--text-display)">
          <span className="heading block max-w-5xl">Skilled people shouldn't spend the day</span>
          <span className="heading block text-green">retyping invoices.</span>
        </h2>
        {/* The same words again and again, because that is the problem. */}
        <p
          aria-hidden="true"
          className="heading text-(length:--text-display) text-green [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.35),transparent)]"
        >
          <span className="block">retyping invoices.</span>
          <span className="block">retyping invoices.</span>
        </p>
        <p className="mt-8 max-w-2xl text-slate">
          Much of a finance professional's day goes on work software can handle. It is repetitive and
          slow, it leaves room for error, and it pulls attention away from judgement and from clients.
        </p>
      </section>

      <section aria-labelledby="two-ways-title">
        <div className="page pb-12">
          <SectionRef>B2</SectionRef>
          <h2 id="two-ways-title" className={sectionTitle}>
            Run a whole process, <span className="text-blue">or fix one step.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2">
          {ways.map((way) => (
            <article key={way.kind} className={`on-navy px-6 py-14 text-white lg:px-12 lg:py-20 ${way.background}`}>
              <ProcessRail theme="white" lit={way.lit} />
              <h3 className="mt-10 font-mono text-sm">{way.kind}</h3>
              <p className="heading mt-2 text-[2.5rem]">{way.promise}</p>
              <p className="mt-4 max-w-xl">{way.description}</p>
              <p className="mt-4 max-w-xl">
                <strong>Best when</strong> {way.best}
              </p>
              <ul className="mt-8 border-t border-white/30">
                {way.items.map((item) => (
                  <li key={item} className="border-b border-white/30 py-2.5">
                    {item}
                  </li>
                ))}
              </ul>
              <Link to={way.link} className="btn btn-light mt-8">
                {way.linkLabel}
              </Link>
            </article>
          ))}
        </div>

        <p className="page py-8 text-sm text-slate">{availabilityLine}</p>
      </section>

      <section aria-labelledby="demo-title" className="overflow-x-clip bg-mist">
        <div className="page section">
          <SectionRef>C1</SectionRef>
          <h2 id="demo-title" className={sectionTitle}>
            Try the part <span className="text-green">that matters.</span>
          </h2>
          <p className="mb-10 mt-6 max-w-2xl text-slate">
            A small reconciliation with one difference from a typical demo: it won't finish without you.
          </p>
          {/* The paper tips up into place the first time it scrolls into view. */}
          <div
            ref={demo}
            className={`paper-shadow rounded-md transition-[transform,opacity] duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none ${
              demoSeen ? "" : "[transform:perspective(1400px)_rotateX(14deg)_translateY(48px)] opacity-0"
            }`}
          >
            <ReconciliationDemo />
          </div>
        </div>
      </section>

      <section aria-labelledby="trust-title" className="on-navy bg-forest text-white">
        <div className="page section">
          <SectionRef className="text-white">D1</SectionRef>
          <h2 id="trust-title" className={`${sectionTitle} max-w-4xl`}>
            Made by people who know <span className="text-green-bright">what a review is for.</span>
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {trustReasons.map((reason) => (
              <article key={reason.title} className="rounded-md bg-white p-6 text-navy">
                <h3 className="heading text-2xl">{reason.title}</h3>
                <p className="mt-4 text-slate">{reason.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="closing-title" className="on-navy overflow-hidden bg-navy text-white">
        <div className="page section grid items-center gap-16 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 id="closing-title" className="heading text-(length:--text-display)">
              What does your team <span className="text-green-bright">dread doing</span> every month?
            </h2>
            <p className="mt-6 max-w-xl">Tell us about it. We'll show you how much of it software can prepare.</p>
            <Link to="/contact" className="btn btn-light mt-8">
              Talk to us
            </Link>
          </div>
          <PaperStack count={9} className="mx-auto" />
        </div>
      </section>
    </>
  );
}
