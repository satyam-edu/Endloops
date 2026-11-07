import Tick from "./Tick";
import useInView from "./useInView";

// The small working-paper reference above a section. Its tick draws itself as the section is read.
export default function SectionRef({ children, className = "text-green" }: { children: string; className?: string }) {
  const [label, seen] = useInView<HTMLParagraphElement>();

  return (
    <p ref={label} className={`flex items-center gap-2 font-mono text-sm ${className}`}>
      {children}
      <Tick draw={seen} className={`h-3 w-4 ${seen ? "" : "invisible"}`} />
    </p>
  );
}
