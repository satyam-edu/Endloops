import SectionRef from "../components/SectionRef";

const notes = [
  {
    ref: "N1",
    text: "Alkazim is an accounting and audit firm in Dubai. Over the years, its technology department built software to automate its financial work. That department is now Endloops, building automation for financial professionals.",
  },
  {
    ref: "N2",
    text: "The software prepares the work, and the professional reviews and decides. We take on the repetitive tasks. The final sign-off stays with people.",
  },
  {
    ref: "N3",
    text: "We are a young company with a clear aim: to become the trusted automation partner for accounting, audit and property finance teams, across the GCC and beyond. We are growing our engineering, design and quality capabilities to get there.",
  },
];

export default function About() {
  return (
    <>
      <section className="page section">
        <h1 className="max-w-5xl font-display text-(length:--text-display) leading-[1.02] tracking-tight">
          Started inside an audit firm. Still thinks like one.
        </h1>
      </section>

      <section aria-label="Our story, approach and aim" className="page pb-24">
        <ol className="border-t border-navy">
          {notes.map((note) => (
            <li key={note.ref} className="grid items-start gap-4 border-b border-line py-10 md:grid-cols-[8rem_1fr]">
              <SectionRef>{note.ref}</SectionRef>
              <p className="max-w-3xl font-display text-[1.75rem] leading-snug">{note.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
