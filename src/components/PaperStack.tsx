import type { CSSProperties } from "react";

// A pile of paper in CSS 3D: one sheet for a tool, a full stack for a whole process.
export default function PaperStack({ count, className = "" }: { count: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`paper-stack ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="paper-sheet" style={{ "--i": index } as CSSProperties} />
      ))}
    </div>
  );
}
