export default function Tick({ draw = false, className = "" }: { draw?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 42 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${draw ? "tick-draw" : ""} ${className}`}
    >
      <path pathLength={1} d="M4 17.5c3.5 3.3 7.1 7.2 10.1 11.2C20.5 18 27.8 9.4 38.2 3.7" />
    </svg>
  );
}
