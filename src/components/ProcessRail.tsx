import { processSteps } from "../data/products";
import Tick from "./Tick";
import useInView from "./useInView";

const themes = {
  blue: {
    text: "text-blue",
    fill: "bg-blue border-blue text-white",
    ring: "border-blue",
    line: "bg-blue",
    offLine: "bg-line",
    offRing: "border-line",
    offText: "text-slate",
  },
  // For rails sitting on a full blue or purple panel.
  white: {
    text: "text-white",
    fill: "bg-white border-white text-navy",
    ring: "border-white",
    line: "bg-white",
    offLine: "bg-white/30",
    offRing: "border-white/70",
    offText: "text-white/80",
  },
};

const STEP_DELAY_MS = 130;

// Solutions light every step the software prepares; tools light just one.
// Sign-off is never filled in: it stays an open ring, because that step is always a person's.
// The rail lights up step by step the first time it scrolls into view.
export default function ProcessRail({ theme, lit }: { theme: keyof typeof themes; lit: string[] }) {
  const colour = themes[theme];
  const [rail, seen] = useInView<HTMLOListElement>();

  return (
    <ol ref={rail} className="flex">
      {processSteps.map((step, index) => {
        const isLit = seen && lit.includes(step);
        const isSignOff = step === "Sign-off";
        const isLast = index === processSteps.length - 1;
        const nextLit = !isLast && lit.includes(step) && lit.includes(processSteps[index + 1]);
        const delay = { transitionDelay: `${index * STEP_DELAY_MS}ms` };

        return (
          <li key={step} className={`relative ${isLast ? "shrink-0" : "flex-1"}`}>
            {!isLast && (
              <span aria-hidden="true" className={`absolute left-7 right-0 top-[0.8rem] h-px ${colour.offLine}`}>
                <span
                  style={delay}
                  className={`block h-full origin-left transition-transform duration-300 motion-reduce:transition-none ${colour.line} ${
                    seen && nextLit ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </span>
            )}
            <span
              aria-hidden="true"
              style={delay}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-300 motion-reduce:transition-none ${
                isLit && !isSignOff ? colour.fill : isLit ? `border-2 ${colour.ring}` : colour.offRing
              }`}
            >
              {isLit && !isSignOff && <Tick className="h-3 w-4" />}
            </span>
            <span className={`mt-2 block text-sm ${lit.includes(step) ? `font-semibold ${colour.text}` : colour.offText}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
