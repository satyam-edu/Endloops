import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Tick from "../components/Tick";
import HomeSections from "../home/HomeSections";
import type { LoopScene } from "../home/loopScene";

const stages = [
  {
    ref: "A2",
    word: "Read.",
    rest: "Every document, every figure.",
    body: "Invoices, purchase orders, contracts and statements become clean, usable data.",
  },
  {
    ref: "A3",
    word: "Compare.",
    rest: "Against the record.",
    body: "Documents are checked against ledgers, and quotes against each other.",
  },
  {
    ref: "A4",
    word: "Check.",
    rest: "Anything that doesn't add up.",
    body: "Missing items, mismatched totals, duplicates and anything outside agreed limits get flagged.",
  },
  {
    ref: "A5",
    word: "Draft.",
    rest: "Ready for your review.",
    body: "Schedules, working papers and reports, prepared and waiting.",
  },
  {
    ref: "A6",
    word: "At volume.",
    rest: "The whole pile, not one page.",
    body: "Hundreds of documents at once.",
  },
];

const STAGE_COUNT = stages.length + 2; // the hero and the sign-off, plus the stages above
const viewport = "h-[calc(100svh-var(--nav))]";
// Each block is taller than the screen, so its text holds still while the scene plays beneath it.
const blockClass = "relative h-[170svh] motion-reduce:h-auto";
// The text always sits above the canvas (z-20 over z-10), so the scene can never cover it.
const copyClass = `sticky top-(--nav) z-20 ${viewport} motion-reduce:static motion-reduce:h-auto`;
const innerClass = "page pt-[4svh] motion-reduce:py-16";
const wordClass = "heading text-[min(19vw,12svh)] lg:text-[min(12vw,22svh)]";
// Capped so the text can't reach the paper on the right, on any screen size.
const textWidth = "max-w-[30rem] lg:max-w-[min(30rem,40vw)]";
const titleClass = `accent mt-2 text-3xl leading-tight lg:text-[2.25rem] ${textWidth}`;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

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

    // Which stage we are on: 0 (hero) to 6 (sign-off). The number holds still while a block's
    // text is pinned, then moves on to the next one, so the scene and the text stay in step.
    const getStage = () => {
      const rect = section.current!.getBoundingClientRect();
      const nav = document.querySelector("header")!.offsetHeight;
      const blockHeight = rect.height / STAGE_COUNT;
      const scrolled = Math.max(nav - rect.top, 0);
      const index = Math.min(Math.floor(scrolled / blockHeight), STAGE_COUNT - 1);
      if (index === STAGE_COUNT - 1) return index;
      const pinnedFor = (blockHeight - (window.innerHeight - nav)) * 0.75;
      return index + clamp01((scrolled - index * blockHeight - pinnedFor) / (blockHeight - pinnedFor));
    };

    // Fades each block's text in and out as it arrives and leaves, so two never compete.
    const fadeCopy = () => {
      const height = window.innerHeight;
      const copies = section.current!.querySelectorAll<HTMLElement>("[data-copy]");
      copies.forEach((copy, index) => {
        const block = copy.parentElement!.getBoundingClientRect();
        const arriving = clamp01((height * 0.4 - block.top) / (height * 0.28));
        // The last block stays solid, so it scrolls straight on into the white section below.
        const leaving = index === copies.length - 1 ? 1 : clamp01((block.bottom - height * 0.5) / (height * 0.3));
        copy.style.opacity = String(Math.min(arriving, leaving));
      });
    };
    window.addEventListener("scroll", fadeCopy, { passive: true });
    fadeCopy();

    // three.js loads after the page, so the hero text never waits for it.
    let cancelled = false;
    import("../home/loopScene").then(({ createLoopScene }) => {
      if (cancelled) return;
      scene.current = createLoopScene(canvas.current!, getStage);
      setSceneReady(true);
    });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", fadeCopy);
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
      <section ref={section} aria-label="How Endloops works" className="relative bg-navy">
        {/* Pinned by CSS sticky, so the browser's normal scrolling is never touched. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 motion-reduce:hidden">
          <div className={`sticky top-(--nav) ${viewport} overflow-hidden`}>
            <canvas
              ref={canvas}
              className={`h-full w-full transition-opacity duration-700 ${sceneReady ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </div>

        <div className={`on-navy text-white ${blockClass}`}>
          <div data-copy className={copyClass}>
            <div className={innerClass}>
              <p className="inline-flex items-center gap-3 font-mono text-sm text-green-bright">
                <span aria-hidden="true" className="h-px w-8 bg-green-bright" />
                Automation for accounting, audit and property finance
              </p>
              <h1 className="mt-4 text-[min(12vw,7.5svh)] lg:text-[min(5vw,9.5svh)]">
                <span className="heading block">The work gets prepared.</span>
                <span className="accent block leading-[1.05] text-green-bright">The decision stays yours.</span>
              </h1>
              <p className="mt-5 max-w-[38rem] text-white/85">
                Endloops reads the documents, matches the ledgers, flags the exceptions and drafts the
                working papers. Your team reviews, decides and signs off.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex flex-wrap gap-3">
                  <Link to="/contact" className="btn btn-primary">
                    Talk to us
                  </Link>
                  <a href="#read" className="btn btn-outline-light">
                    See how it works
                  </a>
                </div>
                <p className="max-w-xs border-l-2 border-green-bright pl-4 text-sm text-white/85">
                  For accountants, auditors, finance teams and property management companies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {stages.map((stage, index) => (
          <article key={stage.ref} id={index === 0 ? "read" : undefined} className={`on-navy text-white ${blockClass}`}>
            <div data-copy className={copyClass}>
              <div className={innerClass}>
                <p className="font-mono text-sm text-green-bright">{stage.ref}</p>
                <h2>
                  <span className={`block ${wordClass}`}>{stage.word}</span>
                  <span className={`block text-green-bright ${titleClass}`}>{stage.rest}</span>
                </h2>
                <p className={`mt-3 text-white/85 ${textWidth}`}>{stage.body}</p>
              </div>
            </div>
          </article>
        ))}

        {/* The screen turns white here. Without the 3D scene, this block supplies the white itself. */}
        <article className={`text-navy motion-reduce:bg-white ${sceneReady ? "" : "bg-white"} ${blockClass}`}>
          <div data-copy className={copyClass}>
            <div className={innerClass}>
              <p className="font-mono text-sm text-green">A7</p>
              <h2>
                <span className="heading block text-[min(13vw,10svh)] lg:text-[min(7vw,15svh)] lg:max-w-[52vw]">
                  Then it stops,
                </span>
                <span className={`block text-green ${titleClass}`}>and waits for you.</span>
              </h2>
              <p className={`mt-3 text-slate ${textWidth}`}>The final sign-off always stays with people.</p>
              <div ref={signOffStatus} tabIndex={-1} className={`mt-5 min-h-12 ${textWidth}`} role="status">
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
