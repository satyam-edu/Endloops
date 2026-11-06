import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Tick from "../components/Tick";
import type { LoopScene } from "../home/loopScene";

const stages = [
  {
    ref: "A2",
    title: "Read. Every document, every figure.",
    body: "Invoices, purchase orders, contracts and statements become clean, usable data.",
  },
  {
    ref: "A3",
    title: "Compare. Against the record.",
    body: "Documents are checked against ledgers, and quotes against each other.",
  },
  {
    ref: "A4",
    title: "Check. Anything that doesn't add up.",
    body: "Missing items, mismatched totals, duplicates and anything outside agreed limits get flagged.",
  },
  {
    ref: "A5",
    title: "Draft. Ready for your review.",
    body: "Schedules, working papers and reports, prepared and waiting.",
  },
  {
    ref: "A6",
    title: "At volume. The whole pile, not one page.",
    body: "Hundreds of documents at once.",
  },
];

const stageClass =
  "flex min-h-[calc(100svh-var(--nav))] items-end lg:items-center motion-reduce:min-h-0 motion-reduce:py-16";
// On phones the scene sits above the text, so the text panel gets a solid background.
const panelClass = "w-full bg-mist px-6 pb-8 pt-5 lg:max-w-[34rem] lg:bg-transparent lg:p-0";

function hasWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

export default function Home() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<LoopScene | null>(null);
  const signOffStatus = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !hasWebGL()) return;

    // How far through the section we are, as a stage number from 0 (hero) to 6 (sign-off).
    const getStage = () => {
      const rect = section.current!.getBoundingClientRect();
      const nav = document.querySelector("header")!.offsetHeight;
      const range = rect.height - (window.innerHeight - nav);
      return Math.min(Math.max((nav - rect.top) / range, 0), 1) * 6;
    };

    // three.js loads after the page, so the hero text never waits for it.
    let cancelled = false;
    import("../home/loopScene").then(({ createLoopScene }) => {
      if (cancelled) return;
      scene.current = createLoopScene(canvas.current!, getStage);
      setSceneReady(true);
    });

    return () => {
      cancelled = true;
      scene.current?.destroy();
      scene.current = null;
    };
  }, []);

  const signOff = () => {
    setSigned(true);
    scene.current?.signOff();
    signOffStatus.current?.focus(); // the button is about to disappear, so keep keyboard focus here
  };

  return (
    <section ref={section} aria-label="How Endloops works" className="relative bg-mist">
      {/* Pinned by CSS sticky, so the browser's normal scrolling is never touched. */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-(--nav) -mb-[calc(100svh-var(--nav))] h-[calc(100svh-var(--nav))] overflow-hidden motion-reduce:hidden"
      >
        <canvas
          ref={canvas}
          className={`h-full w-full transition-opacity duration-700 ${sceneReady ? "opacity-100" : "opacity-0"}`}
        />
        {/* Keeps the text readable where sheets pass behind it on desktop. */}
        <div className="scene-scrim absolute inset-0 hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-[1280px] lg:px-6">
        <div className={stageClass}>
          <div className={panelClass}>
            <p className="font-mono text-sm text-green">
              Automation for accounting, audit and property finance
            </p>
            <h1 className="mt-4 font-display text-(length:--text-display) leading-[1.02] tracking-tight">
              <span className="block">The work gets prepared.</span>
              <span className="block">The decision stays yours.</span>
            </h1>
            <p className="mt-5 text-slate">
              Endloops reads the documents, matches the ledgers, flags the exceptions and drafts the
              working papers. Your team reviews, decides and signs off.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact" className="btn btn-primary">
                Talk to us
              </Link>
              <a href="#read" className="btn btn-secondary">
                See how it works
              </a>
            </div>
            <p className="mt-6 text-sm text-slate">
              For accountants, auditors, finance teams and property management companies.
            </p>
          </div>
        </div>

        {stages.map((stage, index) => (
          <article key={stage.ref} id={index === 0 ? "read" : undefined} className={stageClass}>
            <div className={panelClass}>
              <p className="font-mono text-sm text-green">{stage.ref}</p>
              <h2 className="mt-3 font-display text-(length:--text-h2) leading-[1.05] tracking-tight">
                {stage.title}
              </h2>
              <p className="mt-4 max-w-md text-slate">{stage.body}</p>
            </div>
          </article>
        ))}

        <article className={stageClass}>
          <div className={panelClass}>
            <p className="font-mono text-sm text-green">A7</p>
            <h2 className="mt-3 font-display text-(length:--text-h2) leading-[1.05] tracking-tight">
              Then it stops, and waits for you.
            </h2>
            <p className="mt-4 max-w-md text-slate">The final sign-off always stays with people.</p>
            <div ref={signOffStatus} tabIndex={-1} className="mt-6 min-h-12" role="status">
              {signed ? (
                <p className="flex items-center gap-3 font-medium">
                  <Tick draw className="h-8 w-10 shrink-0 text-green" />
                  Signed off by you. That's how it should work.
                </p>
              ) : (
                <button type="button" onClick={signOff} className="btn btn-primary">
                  Sign off
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
