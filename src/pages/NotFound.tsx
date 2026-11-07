import { Link } from "react-router";
import PageHero from "../components/PageHero";

export default function NotFound() {
  return (
    <>
      <PageHero background="bg-navy" sheets={3} title="This page isn't in the file." />
      <section className="page py-16">
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </section>
    </>
  );
}
