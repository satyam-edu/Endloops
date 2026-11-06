import { useState, type FormEvent } from "react";

type Errors = { name?: string; email?: string; message?: string };

const inputClass =
  "mt-2 min-h-12 w-full rounded-md border border-slate bg-white px-3 py-2 aria-invalid:border-2 aria-invalid:border-amber";
const labelClass = "block font-semibold";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-medium text-amber">
      {message}
    </p>
  );
}

function validate(form: FormData): Errors {
  const errors: Errors = {};
  if (!String(form.get("name")).trim()) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.get("email")).trim())) {
    errors.email = "Please enter a valid email, such as name@company.com.";
  }
  if (!String(form.get("message")).trim()) errors.message = "Please tell us a little about the task.";
  return errors;
}

export default function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [passed, setPassed] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const found = validate(new FormData(form));
    setErrors(found);
    setPassed(Object.keys(found).length === 0);

    // Take keyboard and screen reader users straight to the first problem.
    const firstProblem = (["name", "email", "message"] as const).find((field) => found[field]);
    if (firstProblem) (form.elements.namedItem(firstProblem) as HTMLElement).focus();
  };

  return (
    <section className="page section">
      <h1 className="font-display text-(length:--text-display) leading-[1.02] tracking-tight">Talk to us.</h1>
      <p className="mt-6 max-w-2xl text-slate">
        Tell us what's taking your team's time. A short description is plenty.
      </p>

      <form noValidate onSubmit={onSubmit} onChange={() => setPassed(false)} className="mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Work email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>Company</label>
          <input id="company" name="company" autoComplete="organization" className={inputClass} />
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>Your role</label>
          <select id="role" name="role" defaultValue="" className={inputClass}>
            <option value="" disabled>Choose one</option>
            <option>Accountant</option>
            <option>Auditor</option>
            <option>Finance team</option>
            <option>Property management</option>
            <option>Other</option>
          </select>
        </div>

        <fieldset className="md:col-span-2">
          <legend className={labelClass}>Interested in</legend>
          <div className="mt-2 flex flex-wrap gap-x-6">
            {["End-to-end solutions", "Standalone tools", "Not sure yet"].map((option) => (
              <label key={option} className="flex min-h-11 items-center gap-2">
                <input type="radio" name="interest" value={option} className="h-5 w-5 accent-green" />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <label htmlFor="message" className={labelClass}>What would you like to take off your team's plate?</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            aria-required="true"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={inputClass}
          />
          <FieldError id="message-error" message={errors.message} />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="btn btn-primary">Send message</button>
          {/* This build has no backend, so it says so plainly and never claims a message was sent. */}
          <div role="status" className="mt-4 max-w-xl">
            {passed && "Your message looks good, but this assignment build doesn't send messages. Nothing has been stored or shared."}
          </div>
        </div>
      </form>
    </section>
  );
}
