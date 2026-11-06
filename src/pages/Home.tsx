import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Tick from "../components/Tick";
import HomeSections from "../home/HomeSections";
import type { LoopScene } from "../home/loopScene";

// Each stage's title is split in two: the first part is set huge behind the 3D scene.
const stages = [
  {
    ref: "A2",
    word: "Read.",
    rest: "Every document, every figure.",
    body: "Invoices, purchase orders, contracts and statements become clean, usable data.",
    wordClass: "text-[17vw] lg:text-left",
    copyClass: "lg:left-6",
    note: true,
  },
  {
    ref: "A3",
    word: "Compare.",
    rest: "Against the record.",
    body: "Documents are checked against ledgers, and quotes against each other.",
    wordClass: "text-[17vw] lg:text-right",
    copyClass: "lg:left-6",
    note: true,
  },
  {
    ref: "A4",
    word: "Check.",
    rest: "Anything that doesn't add up.",
    body: "Missing items, mismatched totals, duplicates and anything outside agreed limits get flagged.",
    wordClass: "text-[17vw] lg:text-left",
    copyClass: "lg:right-6",
    note: true,
  },
  {
    ref: "A5",
    word: "Draft.",
    rest: "Ready for your review.",
    body: "Schedules, working papers and reports, prepared and waiting.",
    wordClass: "pt-[46svh] text-[17vw] lg:pt-[25svh] lg:text-left",
    copyClass: "lg:left-6",
    note: true,
  },
  {
    ref: "A6",
    word: "At volume.",
    rest: "The whole pile, not one page.",
    body: "Hundreds of documents at once.",
    wordClass: "text-[15vw] lg:text-[11vw] lg:text-center lg:pt-[calc(50svh-15vw)]",
    copyClass: "lg:left-1/2 lg:-translate-x-1/2 lg:bottom-[21svh] lg:bg-transparent lg:text-center",
    note: false,
  },
];

const viewport = "h-[calc(100svh-var(--nav))]";
// Each stage is taller than the screen, so its text holds still for a moment while the scene moves.
const stageClass = "relative h-[170svh] motion-reduce:h-auto motion-reduce:py-12";
const stickyClass = `pointer-events-none sticky top-(--nav) ${viewport} motion-reduce:static motion-reduce:h-auto`;
const wordWrapper = "pointer-events-none absolute inset-0 z-0 motion-reduce:static";
const wordLayer = `sticky top-(--nav) ${viewport} overflow-hidden px-6 pt-4 motion-reduce:static motion-reduce:h-auto`;
const wordText = "font-display leading-[0.95] tracking-tight";
const copyCard =
  "pointer-events-auto absolute inset-x-0 bottom-0 bg-mist px-6 pb-8 pt-5 lg:inset-x-auto lg:bottom-10 lg:w-[23rem] lg:px-5 lg:pb-5 motion-reduce:static motion-reduce:w-auto";
// On desktop the text sits on a white note, like a slip clipped to the file.
const paperNote = "lg:rounded-md lg:border lg:border-line lg:bg-white";
const copyTitle = "mt-2 font-display text-3xl leading-[1.1] tracking-tight lg:text-[2.25rem]";

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
    <>
      <section ref={section} aria-label="How Endloops works" className="relative bg-mist">
        {/* Layers, back to front: huge words (z-0), the 3D canvas (z-10), readable text (z-20).
            The canvas is see-through, so the paper really does pass in front of the words.
            It is pinned by CSS sticky, so the browser's normal scrolling is never touched. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 motion-reduce:hidden">
          <div className={`sticky top-(--nav) ${viewport} overflow-hidden`}>
            <canvas
              ref={canvas}
              className={`h-full w-full transition-opacity duration-700 ${sceneReady ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </div>

        <div className={stageClass}>
          <div className={`${stickyClass} z-20`}>
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 bg-mist px-6 pb-6 pt-4 lg:inset-0 lg:flex lg:flex-col lg:items-center lg:justify-center lg:bg-transparent lg:text-center motion-reduce:static">
              <p className="font-mono text-sm text-green">
                Automation for accounting, audit and property finance
              </p>
              <h1 className="mt-3 font-display text-(length:--text-display) leading-[1.02] tracking-tight lg:text-[5.4vw]">
                <span className="block">The work gets prepared.</span>
                <span className="block">The decision stays yours.</span>
              </h1>
              <p className="mt-4 max-w-[34rem] text-slate">
                Endloops reads the documents, matches the ledgers, flags the exceptions and drafts the
                working papers. Your team reviews, decides and signs off.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/contact" className="btn btn-primary">
                  Talk to us
                </Link>
                <a href="#read" className="btn btn-secondary">
                  See how it works
                </a>
              </div>
              <p className="mt-4 text-sm text-slate">
                For accountants, auditors, finance teams and property management companies.
              </p>
            </div>
          </div>
        </div>

        {stages.map((stage, index) => (
          <article key={stage.ref} id={index === 0 ? "read" : undefined} className={stageClass}>
            <div aria-hidden="true" className={wordWrapper}>
              <div className={wordLayer}>
                <p className={`${wordText} ${stage.wordClass}`}>{stage.word}</p>
              </div>
            </div>
            <div className={`${stickyClass} z-20`}>
              <div className={`${copyCard} ${stage.copyClass} ${stage.note ? paperNote : ""}`}>
                <p className="font-mono text-sm text-green">{stage.ref}</p>
                <h2 className={copyTitle}>
                  <span className="sr-only">{stage.word} </span>
                  {stage.rest}
                </h2>
                <p className="mt-3 text-slate">{stage.body}</p>
              </div>
            </div>
          </article>
        ))}

        <article className={stageClass}>
          <div aria-hidden="true" className={wordWrapper}>
            <div className={wordLayer}>
              <p className={`${wordText} text-[11vw] lg:text-left`}>Then it stops,</p>
            </div>
          </div>
          <div className={`${stickyClass} z-20`}>
            <div className={`${copyCard} ${paperNote} lg:left-6`}>
              <p className="font-mono text-sm text-green">A7</p>
              <h2 className={copyTitle}>
                <span className="sr-only">Then it stops, </span>
                and waits for you.
              </h2>
              <p className="mt-3 text-slate">The final sign-off always stays with people.</p>
              <div ref={signOffStatus} tabIndex={-1} className="mt-5 min-h-12" role="status">
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
          </div>
        </article>
      </section>
      <HomeSections />
    </>
  );
}
