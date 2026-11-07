import PageHero from "../components/PageHero";
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
      <PageHero
        background="bg-forest"
        sheets={4}
        title={
          <>
            Started inside an audit firm. <span className="accent">Still thinks like one.</span>
          </>
        }
      />

      {/* Each note is a sheet of paper that slides up and settles on the one before it. */}
      <section aria-label="Our story, approach and aim" className="bg-mist">
        <ol className="page py-16">
          {notes.map((note, index) => (
            <li
              key={note.ref}
              style={{ top: `calc(var(--nav) + 1.5rem + ${index * 3}rem)` }}
              className="paper-shadow mb-[30svh] grid items-start gap-4 rounded-md bg-white p-6 last:mb-0 md:sticky md:grid-cols-[6rem_1fr] md:p-10 motion-reduce:static motion-reduce:mb-4"
            >
              <SectionRef>{note.ref}</SectionRef>
              <p className="max-w-3xl font-display text-[1.75rem] leading-snug">{note.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
