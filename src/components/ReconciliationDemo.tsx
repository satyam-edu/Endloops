import { useEffect, useRef, useState } from "react";
import Tick from "./Tick";

type Decision = "Accept" | "Query";
type Status = "idle" | "running" | "review" | "signed";

// Invented figures, labelled "Illustrative data" on screen.
const rows = [
  { date: "03 Mar", description: "Service charge receipt", bank: "12,400.00", ledger: "12,400.00" },
  { date: "05 Mar", description: "Maintenance contractor", bank: "8,250.00", ledger: "8,250.00" },
  { date: "09 Mar", description: "Cleaning supplier", bank: "3,180.00", ledger: "3,180.00" },
  {
    date: "12 Mar",
    description: "Cleaning supplier",
    bank: "3,180.00",
    ledger: "none",
    reason: "Possible duplicate: same amount and payee as an earlier line.",
  },
  { date: "15 Mar", description: "Insurance premium", bank: "15,600.00", ledger: "15,600.00" },
  {
    date: "18 Mar",
    description: "Security services",
    bank: "6,900.00",
    ledger: "6,400.00",
    reason: "Amount differs from the ledger by AED 500.00.",
  },
  { date: "22 Mar", description: "Utilities", bank: "4,725.50", ledger: "4,725.50" },
  { date: "27 Mar", description: "Service charge receipt", bank: "9,800.00", ledger: "9,800.00" },
];

const exceptionCount = rows.filter((row) => row.reason).length;
const matchedCount = rows.length - exceptionCount;
const MS_PER_ROW = 250; // eight rows take about two seconds

// On phones each row becomes a stacked card, labelled by data-label, so nothing scrolls sideways.
const cell =
  "px-3 py-3 align-top max-md:flex max-md:justify-between max-md:gap-4 max-md:px-0 max-md:py-1 max-md:before:font-sans max-md:before:text-slate max-md:before:content-[attr(data-label)]";
const headCell = "px-3 pb-3 text-left font-mono text-sm font-normal text-slate";

function FlagIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
      <path strokeLinejoin="round" d="M10 3 18 17H2L10 3Z" />
      <path strokeLinecap="round" d="M10 8v4M10 14.5v.1" />
    </svg>
  );
}

export default function ReconciliationDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [paired, setPaired] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const statusRegion = useRef<HTMLDivElement>(null);

  const allDecided = Object.keys(decisions).length === exceptionCount;

  // Pairs the rows up one at a time, then hands over to the visitor.
  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      setPaired((count) => count + 1);
    }, MS_PER_ROW);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === "running" && paired >= rows.length) setStatus("review");
  }, [status, paired]);

  // The clicked button disappears at each step, so keyboard focus moves to the status text.
  const moveFocusToStatus = () => statusRegion.current?.focus();

  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaired(rows.length);
      setStatus("review");
    } else {
      setStatus("running");
    }
    moveFocusToStatus();
  };

  const signOff = () => {
    setStatus("signed");
    moveFocusToStatus();
  };

  const startAgain = () => {
    setStatus("idle");
    setPaired(0);
    setDecisions({});
    moveFocusToStatus();
  };

  const statusText = {
    idle: "",
    running: "Matching lines...",
    review: `${matchedCount} of ${rows.length} matched. ${exceptionCount} need your decision.`,
    signed: "Signed off by you.",
  }[status];

  return (
    <div className="rounded-md border border-line bg-white p-4 md:p-6">
      <table className="w-full border-collapse text-sm max-md:block">
        <caption className="pb-4 text-left font-mono text-sm text-slate max-md:block">Illustrative data</caption>
        <thead className="max-md:sr-only">
          <tr className="border-b border-navy">
            <th scope="col" className={headCell}>Date</th>
            <th scope="col" className={headCell}>Description</th>
            <th scope="col" className={`${headCell} text-right`}>Bank (AED)</th>
            <td aria-hidden="true" className="w-16" />
            <th scope="col" className={`${headCell} text-right`}>Ledger (AED)</th>
            <th scope="col" className={`${headCell} w-[38%]`}>Result</th>
          </tr>
        </thead>
        <tbody className="max-md:block">
          {rows.map((row, index) => {
            const isPaired = index < paired;
            const decision = decisions[row.date];

            return (
              <tr key={row.date} className="border-b border-line max-md:block max-md:py-3">
                <td data-label="Date" className={`${cell} font-mono`}>{row.date}</td>
                <td data-label="Description" className={cell}>{row.description}</td>
                <td data-label="Bank (AED)" className={`${cell} text-right font-mono tabular-nums`}>{row.bank}</td>
                <td aria-hidden="true" className="px-1 pt-[1.4rem] align-top max-md:hidden">
                  <span
                    className={`block h-px origin-left transition-transform duration-200 ${
                      isPaired ? "scale-x-100" : "scale-x-0"
                    } ${row.reason ? "bg-amber" : "bg-green"}`}
                  />
                </td>
                <td data-label="Ledger (AED)" className={`${cell} text-right font-mono tabular-nums`}>{row.ledger}</td>
                <td className="px-3 py-3 align-top max-md:px-0 max-md:py-1">
                  {isPaired && !row.reason && (
                    <span className="flex items-center gap-2 font-medium text-green">
                      <Tick className="h-3 w-4" /> Match
                    </span>
                  )}
                  {isPaired && row.reason && (
                    <div className="text-amber">
                      <p className="flex gap-2">
                        <FlagIcon />
                        <span className="font-medium">{row.reason}</span>
                      </p>
                      {status !== "running" && (
                        <div role="group" aria-label={`Decision for ${row.date}, ${row.description}`} className="mt-2 flex gap-2">
                          {(["Accept", "Query"] as const).map((option) => (
                            <button
                              key={option}
                              type="button"
                              disabled={status === "signed"}
                              aria-pressed={decision === option}
                              onClick={() => setDecisions((current) => ({ ...current, [row.date]: option }))}
                              className={`min-h-11 min-w-20 cursor-pointer rounded-md border border-amber px-3 font-semibold disabled:cursor-default ${
                                decision === option ? "bg-amber text-white" : "text-amber"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {/* Announced to screen readers as the demo moves on. */}
        <div ref={statusRegion} tabIndex={-1} role="status" className="font-medium">
          {status === "signed" ? (
            <p className="flex items-center gap-3 font-display text-3xl">
              <Tick draw className="h-9 w-11 shrink-0 text-green" />
              {statusText}
            </p>
          ) : (
            statusText
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {status === "idle" && (
            <button type="button" onClick={run} className="btn btn-primary">
              Run reconciliation
            </button>
          )}
          {status === "review" && (
            <>
              {!allDecided && <p className="text-sm text-slate">Decide both exceptions to sign off.</p>}
              <button type="button" disabled={!allDecided} onClick={signOff} className="btn btn-primary">
                Sign off
              </button>
            </>
          )}
          {status === "signed" && (
            <button type="button" onClick={startAgain} className="btn btn-secondary">
              Start again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
