import { useState } from "react";
import ssLight from "@assets/image_1774281602158.png";
import ssDark from "@assets/image_1774281672389.png";
import ssHighContrast from "@assets/image_1774283208204.png";

type Mode = "light" | "dark" | "high-contrast";

const modes: { id: Mode; label: string; sub: string }[] = [
  { id: "light",         label: "Light",         sub: "Warm & energetic" },
  { id: "dark",          label: "Dark",           sub: "Easy on the eyes" },
  { id: "high-contrast", label: "High Contrast",  sub: "Maximum clarity" },
];

const imgs: Record<Mode, { src: string; alt: string }> = {
  "light":         { src: ssLight,        alt: "CatchUp in Light Mode" },
  "dark":          { src: ssDark,         alt: "CatchUp in Dark Mode" },
  "high-contrast": { src: ssHighContrast, alt: "CatchUp in High Contrast Mode" },
};

export default function AppShowcase() {
  const [active, setActive] = useState<Mode>("light");

  return (
    <section className="themes-section" id="themes">
      <div className="themes-header">
        <div className="feat-label feat-label-center">Accessibility</div>
        <h2 className="themes-headline">Three themes.<br />One for every moment.</h2>
        <p className="themes-sub">
          Light for daytime energy. Dark for late-night check-ins.
          High Contrast for maximum readability — always.
        </p>
      </div>

      <div className="themes-switcher">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`theme-tab ${active === m.id ? "theme-tab-active" : ""}`}
            onClick={() => setActive(m.id)}
          >
            <span className="theme-tab-label">{m.label}</span>
            <span className="theme-tab-sub">{m.sub}</span>
          </button>
        ))}
      </div>

      <div className={`themes-screen-wrap ${active === "dark" || active === "high-contrast" ? "themes-screen-dark" : ""}`}>
        <div className="themes-screen-bar">
          <span className="themes-dot" />
          <span className="themes-dot" />
          <span className="themes-dot" />
          <span className="themes-screen-url">catchup.page</span>
        </div>
        <div className="themes-img-crop">
          <img
            key={active}
            src={imgs[active].src}
            alt={imgs[active].alt}
            className="themes-img"
          />
        </div>
      </div>
    </section>
  );
}
