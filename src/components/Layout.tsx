import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import logo from "../assets/endloops-logo.png";
import Tick from "./Tick";

const links = [
  { to: "/solutions", label: "Solutions" },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
];

const pageTitles: Record<string, string> = {
  "/": "Endloops: automation for accounting, audit and property finance",
  "/solutions": "End-to-end solutions | Endloops",
  "/tools": "Standalone tools | Endloops",
  "/about": "About | Endloops",
  "/contact": "Talk to us | Endloops",
};

function Logo() {
  return (
    <Link to="/" className="block shrink-0">
      <img src={logo} alt="Endloops" width={558} height={162} className="h-14 w-auto" />
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);

  // The bar gains a soft shadow once the page moves, so it reads as sitting above the content.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Moving to another page closes the menu. Esc closes it too and hands focus back to the button.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 h-(--nav) border-b bg-white transition-shadow duration-300 ${
        scrolled || open ? "border-transparent shadow-[0_8px_24px_-12px_rgba(15,27,61,0.35)]" : "border-line"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="border-b-2 border-transparent py-1 text-base text-slate transition-colors hover:text-navy aria-[current=page]:border-green aria-[current=page]:font-semibold aria-[current=page]:text-navy">
              {link.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary">
            Talk to us
          </Link>
        </nav>
        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="-mr-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-md md:hidden"
        >
          <span aria-hidden="true" className="relative block h-4 w-6">
            {/* Three lines that fold into a cross when the menu opens. */}
            <span className={`absolute left-0 h-0.5 w-6 rounded bg-navy transition-all duration-300 motion-reduce:transition-none ${open ? "top-[7px] rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-6 rounded bg-navy transition-opacity duration-200 motion-reduce:transition-none ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 h-0.5 w-6 rounded bg-navy transition-all duration-300 motion-reduce:transition-none ${open ? "top-[7px] -rotate-45" : "top-[14px]"}`} />
          </span>
        </button>
      </div>

      {/* The dropdown slides open by animating its row height, so it needs no measuring. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`absolute inset-x-0 top-full grid overflow-hidden bg-white shadow-[0_24px_32px_-16px_rgba(15,27,61,0.35)] transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="min-h-0">
          <div className="px-6 pb-6 pt-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block border-b border-line py-4 text-2xl font-semibold tracking-tight text-navy aria-[current=page]:text-green"
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn btn-primary mt-6 w-full">
              Talk to us
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav aria-label="Footer" className="flex gap-8">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-slate hover:text-navy">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <dl className="mt-10 border-t border-navy font-mono text-sm">
          <div className="flex items-center gap-4 border-b border-line py-4">
            <dt className="w-32 text-slate">Prepared by:</dt>
            <dd className="flex items-center gap-2">
              Endloops <Tick className="h-4 w-5 text-green" />
            </dd>
          </div>
          <div className="flex items-center gap-4 border-b border-line py-4">
            <dt className="w-32 text-slate">Reviewed by:</dt>
            <dd>You</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-slate">
          Automation for financial professionals. From inside Alkazim, Dubai.
        </p>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = pageTitles[pathname] ?? "Page not found | Endloops";
  }, [pathname]);

  return (
    <>
      <a
        href="#main"
        className="btn btn-primary absolute left-4 top-3 z-30 -translate-y-24 focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
