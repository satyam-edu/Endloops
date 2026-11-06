import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import logo from "../assets/endloops-logo.png";
import Tick from "./Tick";

const links = [
  { to: "/solutions", label: "Solutions" },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
];

function Logo() {
  return (
    <Link to="/" className="block shrink-0">
      <img src={logo} alt="Endloops" width={558} height={162} className="h-14 w-auto" />
    </Link>
  );
}

function Header() {
  // A native <dialog> traps focus and closes on Esc without any extra code.
  const menu = useRef<HTMLDialogElement>(null);
  const closeMenu = () => menu.current?.close();

  return (
    <header className="sticky top-0 z-20 h-(--nav) border-b border-line bg-white">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="text-sm text-slate hover:text-navy">
              {link.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary">
            Talk to us
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => menu.current?.showModal()}
          className="btn btn-secondary md:hidden"
        >
          Menu
        </button>
      </div>

      <dialog
        ref={menu}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-6 text-navy backdrop:bg-white"
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button type="button" onClick={closeMenu} className="btn btn-secondary">
            Close
          </button>
        </div>
        <nav aria-label="Mobile" className="mt-12 flex flex-col">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className="border-b border-line py-4 font-display text-[2.5rem] leading-tight"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link to="/contact" onClick={closeMenu} className="btn btn-primary mt-8 w-full">
          Talk to us
        </Link>
      </dialog>
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
