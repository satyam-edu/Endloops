import { processSteps } from "../data/products";
import Tick from "./Tick";

const accents = {
  blue: { text: "text-blue", fill: "bg-blue border-blue", ring: "border-blue", line: "bg-blue" },
  purple: { text: "text-purple", fill: "bg-purple border-purple", ring: "border-purple", line: "bg-purple" },
};

// Solutions light every step the software prepares; tools light just one.
// Sign-off is never filled in: it stays an open ring, because that step is always a person's.
export default function ProcessRail({
  accent,
  lit,
}: {
  accent: keyof typeof accents;
  lit: string[];
}) {
  const colour = accents[accent];

  return (
    <ol className="flex">
      {processSteps.map((step, index) => {
        const isLit = lit.includes(step);
        const isSignOff = step === "Sign-off";
        const isLast = index === processSteps.length - 1;
        const nextLit = !isLast && isLit && lit.includes(processSteps[index + 1]);

        return (
          <li key={step} className={`relative ${isLast ? "shrink-0" : "flex-1"}`}>
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-7 right-0 top-[0.8rem] h-px ${nextLit ? colour.line : "bg-line"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                isLit && !isSignOff ? `${colour.fill} text-white` : isLit ? `border-2 ${colour.ring}` : "border-line"
              }`}
            >
              {isLit && !isSignOff && <Tick className="h-3 w-4" />}
            </span>
            <span className={`mt-2 block text-sm ${isLit ? `font-semibold ${colour.text}` : "text-slate"}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
