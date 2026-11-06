import Tick from "./Tick";

// The small working-paper reference above a section, like the index on an audit file.
export default function SectionRef({ children, className = "text-green" }: { children: string; className?: string }) {
  return (
    <p className={`flex items-center gap-2 font-mono text-sm ${className}`}>
      {children}
      <Tick className="h-3 w-4" />
    </p>
  );
}
