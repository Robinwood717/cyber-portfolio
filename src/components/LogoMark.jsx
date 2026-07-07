// The "shielded prompt" brand mark: a shield (security) enclosing a > prompt
// and cursor block (engineer / terminal). Monochrome via currentColor so it
// inherits the surrounding text color; decorative, so the adjacent wordmark
// carries the accessible label.
export default function LogoMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 5 L20 5 L20 14 Q20 18.5 12 21.5 Q4 18.5 4 14 Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <polyline
        points="9.4,9 12.8,12 9.4,15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="13.8" y="10.6" width="2.4" height="3" fill="currentColor" />
    </svg>
  );
}
