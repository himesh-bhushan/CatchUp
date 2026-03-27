import tomatoImg from "/images/tomato_1774283104209.png";

export default function BottomCTA() {
  return (
    <>
      <section className="cta-apple">
        <div className="cta-apple-inner">
          <img src={tomatoImg} alt="CatchUp tomato mascot" className="cta-tomato-img" />
          <h2 className="cta-headline">
            Ready to feel<br />better?
          </h2>
          <p className="cta-sub">
            No app to download. Just open your browser and start your health journey.
          </p>
          <a href="https://www.catchup.page" target="_blank" rel="noopener noreferrer" className="cta-btn">
            Open CatchUp at catchup.page →
          </a>
          <p className="cta-disclaimer">
            CatchUp AI provides wellness information only — not medical advice.
          </p>
        </div>
      </section>

      <footer className="footer-apple">
        <div className="footer-apple-inner">
          <div className="footer-col footer-col-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src="/favicon.ico" alt="logo" style={{ width: "24px", height: "24px" }} />
              <span>CatchUp</span>
            </div>
            <p>Your friendly health companion, built for Southeast Asia.</p>
            <a href="https://www.catchup.page" target="_blank" rel="noopener noreferrer">www.catchup.page ↗</a>
          </div>
          <div className="footer-col">
            <h5>Features</h5>
            <a href="#features">Activity Ring</a>
            <a href="#features">Health Score</a>
            <a href="#features">Leaderboard</a>
            <a href="#features">AI Assistant</a>
            <a href="#features">PDF Report</a>
            <a href="#features">Nearby Care</a>
          </div>
          <div className="footer-col">
            <h5>App</h5>
            <a href="#themes">Light Mode</a>
            <a href="#themes">Dark Mode</a>
            <a href="#themes">High Contrast</a>
            <a href="#languages">Chinese</a>
            <a href="#languages">Bahasa Melayu</a>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <a href="#about">About CatchUp</a>
            <a href="https://www.catchup.page" target="_blank" rel="noopener noreferrer">Open App</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CatchUp Health. CatchUp AI provides wellness information only — not medical advice.</p>
        </div>
      </footer>
    </>
  );
}
