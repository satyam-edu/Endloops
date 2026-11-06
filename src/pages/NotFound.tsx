import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="mx-auto min-h-[60svh] max-w-[1280px] px-6 py-24">
      <h1 className="max-w-3xl font-display text-(length:--text-display) leading-none tracking-tight">
        This page isn't in the file.
      </h1>
      <Link to="/" className="mt-10 inline-block font-semibold text-teal underline underline-offset-4">
        Back to home
      </Link>
    </section>
  );
}
