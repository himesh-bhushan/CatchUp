import { useEffect, useRef } from "react";
import ssLight from "@assets/image_1774281602158.png";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => el.classList.add("hero-visible"));
  }, []);

  return (
    <section className="hero" ref={ref}>
      <div className="hero-eyebrow">Health tracking — redesigned.</div>
      <h1 className="hero-headline">
        Catch up with<br />
        <span className="hero-highlight">your best self.</span>
      </h1>
      <p className="hero-sub">
        Track vitals. Close activity rings. Chat with an AI health assistant.<br />
        Compete with friends. Find care nearby.
      </p>
      <a href="https://www.catchup.page" target="_blank" rel="noopener noreferrer" className="hero-btn">
        Try CatchUp free →
      </a>
      <p className="hero-note">Available on web · No download required</p>

      {/* App screenshot — full bleed below */}
      <div className="hero-screen-frame">
        <div className="hero-screen-bar">
          <span className="hero-screen-dot" />
          <span className="hero-screen-dot" />
          <span className="hero-screen-dot" />
          <span className="hero-screen-url">catchup.page</span>
        </div>
        <div className="hero-screen-img-wrap">
          <img src={ssLight} alt="CatchUp dashboard" className="hero-screen-img" />
        </div>
      </div>
    </section>
  );
}
