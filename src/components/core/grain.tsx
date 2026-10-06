/** Fixed full-screen film grain + vignette + faint brand gradient. Purely decorative. */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: "var(--z-grain)" }}
    >
      <div className="hub-grain__gradient" />
      <div className="hub-grain__vignette" />
      <div className="hub-grain__noise" />
    </div>
  );
}
