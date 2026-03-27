const items = [
  { label: "14+", sub: "Features" },
  { label: "3", sub: "Languages" },
  { label: "3", sub: "Themes" },
  { label: "Web", sub: "No download needed" },
];

export default function Stats() {
  return (
    <section className="tagline-section">
      <p className="tagline-lead">
        One app for your whole health picture — built for Southeast Asia.
      </p>
      <div className="tagline-items">
        {items.map((it, i) => (
          <div className="tagline-item" key={i}>
            <span className="tagline-num">{it.label}</span>
            <span className="tagline-sub">{it.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
