import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Tick from "../components/Tick";
// Everything below the scroll story loads after the first screen.
const HomeSections = lazy(() => import("../home/HomeSections"));
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
const wordClass = "heading text-[min(15vw,11svh)] lg:text-[min(8vw,16svh)]";
// Capped so the text can't reach the paper on the right, on any screen size.
const textWidth = "max-w-[30rem] lg:max-w-[min(30rem,40vw)]";
const subtitleClass = `mt-3 text-2xl font-medium leading-snug tracking-tight lg:text-[1.75rem] ${textWidth}`;

// The five steps are a real sequence, so a progress bar says where you are in it.
function Progress({ step, dark = true }: { step: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <ol aria-hidden="true" className="flex gap-1.5">
        {stages.map((stage, index) => (
          <li
            key={stage.ref}
            className={`h-1 w-8 rounded-full ${
              index < step ? (dark ? "bg-green-bright" : "bg-green") : dark ? "bg-white/25" : "bg-navy/15"
            }`}
          />
        ))}
      </ol>
      <p className={`font-mono text-sm ${dark ? "text-green-bright" : "text-green"}`}>
        {step <= stages.length ? `Step ${step} of ${stages.length}` : "Sign-off"}
      </p>
    </div>
  );
}

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
  const heroCopy = useRef<HTMLDivElement>(null);
  const heroEnd = useRef<HTMLAnchorElement>(null);
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

    // three.js loads shortly after the page has finished loading, so the hero text never waits for it.
    let cancelled = false;
    let timer = 0;
    const start = () =>
      import("../home/loopScene").then(({ createLoopScene }) => {
      if (cancelled) return;
      const heroInset = () =>
        heroEnd.current!.getBoundingClientRect().bottom - heroCopy.current!.getBoundingClientRect().top;
      scene.current = createLoopScene(canvas.current!, getStage, heroInset);
      setSceneReady(true);
    });
    // The scene starts on the visitor's first move, or a couple of seconds after the page loads,
    // whichever comes first. Until then the hero is just text, which is all it needs.
    const events = ["pointerdown", "pointermove", "wheel", "touchstart", "keydown", "scroll"];
    const begin = () => {
      events.forEach((name) => window.removeEventListener(name, begin));
      window.removeEventListener("load", whenLoaded);
      window.clearTimeout(timer);
      if (!cancelled) start();
    };
    const whenLoaded = () => {
      timer = window.setTimeout(begin, 2000);
    };
    events.forEach((name) => window.addEventListener(name, begin, { passive: true }));
    if (document.readyState === "complete") whenLoaded();
    else window.addEventListener("load", whenLoaded, { once: true });

    return () => {
      cancelled = true;
      events.forEach((name) => window.removeEventListener(name, begin));
      window.removeEventListener("load", whenLoaded);
      window.clearTimeout(timer);
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
          <div data-copy ref={heroCopy} className={copyClass}>
            <div className={innerClass}>
              <p className="flex items-center gap-3 font-mono text-sm text-green-bright">
                <span aria-hidden="true" className="h-px w-10 bg-green-bright" />
                Automation for accounting, audit and property finance
              </p>
              <h1 className="heading mt-6 text-[min(13vw,8svh)] lg:text-[min(7.4vw,14.5svh)]">
                <span className="block">The work gets prepared.</span>
                <span className="block text-green-bright">The decision stays yours.</span>
              </h1>
              {/* A hairline, then two quiet columns: what it does on the left, who it is for on the right. */}
              <div className="mt-6 grid gap-5 border-t border-white/20 pt-5 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-16">
                <p className="text-white/80 lg:text-lg">
                  Endloops reads the documents, matches the ledgers, flags the exceptions and drafts the
                  working papers. Your team reviews, decides and signs off.
                </p>
                <div className="flex flex-col gap-3 lg:items-end lg:text-right">
                  <p className="max-w-xs text-sm text-white/70">
                    For accountants, auditors, finance teams and property management companies.
                  </p>
                  {/* A quiet cue, not a button: the contact button already lives in the nav. */}
                  <a
                    ref={heroEnd}
                    href="#read"
                    className="group inline-flex min-h-11 items-center gap-2 font-semibold text-white hover:text-green-bright"
                  >
                    See how it works
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 4v12M5 11l5 5 5-5" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {stages.map((stage, index) => (
          <article key={stage.ref} id={index === 0 ? "read" : undefined} className={`on-navy text-white ${blockClass}`}>
            <div data-copy className={copyClass}>
              <div className={innerClass}>
                <Progress step={index + 1} />
                <h2 className="mt-6">
                  <span className={`block ${wordClass}`}>{stage.word}</span>
                  <span className={`block text-green-bright ${subtitleClass}`}>{stage.rest}</span>
                </h2>
                <p className={`mt-4 text-white/80 lg:text-lg ${textWidth}`}>{stage.body}</p>
              </div>
            </div>
          </article>
        ))}

        {/* The screen turns white here. Without the 3D scene, this block supplies the white itself. */}
        <article className={`text-navy motion-reduce:bg-white ${sceneReady ? "" : "bg-white"} ${blockClass}`}>
          <div data-copy className={copyClass}>
            <div className={innerClass}>
              <Progress step={stages.length + 1} dark={false} />
              <h2 className="mt-6">
                <span className="heading block text-[min(13vw,10svh)] lg:text-[min(5.6vw,11svh)]">
                  Then it stops,
                </span>
                <span className="heading block text-[min(13vw,10svh)] text-green lg:text-[min(5.6vw,11svh)]">
                  and waits for you.
                </span>
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
      <Suspense fallback={null}>
        <HomeSections />
      </Suspense>
    </>
  );
}
