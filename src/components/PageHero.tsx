import type { ReactNode } from "react";
import PaperStack from "./PaperStack";

// The coloured header shared by the inner pages.
export default function PageHero({
  background,
  sheets,
  title,
  children,
}: {
  background: string;
  sheets: number;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={`on-navy overflow-hidden text-white ${background}`}>
      <div className="page grid items-center gap-12 py-16 lg:min-h-[62svh] lg:grid-cols-[1fr_auto] lg:gap-20 lg:py-20">
        <div>
          <h1 className="heading text-(length:--text-display)">{title}</h1>
          {children && <p className="mt-6 max-w-2xl">{children}</p>}
        </div>
        <PaperStack count={sheets} className="mx-auto" />
      </div>
    </section>
  );
}
