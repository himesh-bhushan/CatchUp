import ssLight from "/images/image_1774281602158.png";
import ssLeaderboard from "/images/image_1774281625463.png";
import ssChat from "/images/image_1774281658157.png";
import ssReport from "/images/image_1774281634818.png";
import ssRecommendations from "/images/image_1774281617435.png";
import avatar1 from "/images/avatar1_1774283268371.png";
import avatar2 from "/images/avatar2_1774283268371.png";
import avatar3 from "/images/avatar3_1774283268371.png";

function BrowserFrame({ src, alt, dark = false }: { src: string; alt: string; dark?: boolean }) {
  return (
    <div className={`feat-browser-frame ${dark ? "feat-browser-dark" : ""}`}>
      <div className="feat-browser-bar">
        <span className="feat-browser-dot" />
        <span className="feat-browser-dot" />
        <span className="feat-browser-dot" />
        <span className="feat-browser-url">catchup.page</span>
      </div>
      <img src={src} alt={alt} className="feat-browser-img" />
    </div>
  );
}

export default function Features() {
  return (
    <section className="features-apple" id="features">

      {/* ── Feature 1: Activity & Vitals ── */}
      <div className="feat-block feat-block-peach">
        <div className="feat-block-inner feat-block-left">
          <div className="feat-label">Activity & Vitals</div>
          <h2 className="feat-headline">Know your<br />body, daily.</h2>
          <p className="feat-body">
            Close your activity ring. Log blood pressure, heart rate, water, and
            sleep. Your Health Score — a single number from 0 to 100 — gives you
            an honest daily snapshot.
          </p>
          <ul className="feat-list">
            <li>Activity Ring — Move, Steps, Distance</li>
            <li>Blood pressure & heart rate</li>
            <li>Health Score (composite 0–100)</li>
            <li>Daily goals for water & sleep</li>
          </ul>
        </div>
        <div className="feat-block-visual feat-block-visual-padded">
          <BrowserFrame src={ssLight} alt="CatchUp activity dashboard" />
        </div>
      </div>

      {/* ── Feature 2: Leaderboard ── */}
      <div className="feat-block feat-block-dark">
        <div className="feat-block-visual feat-block-visual-padded">
          <div className="feat-leaderboard-wrap">
            <div className="feat-avatars">
              <div className="feat-avatar-item">
                <img src={avatar1} alt="CatchUp avatar — gamer" className="feat-avatar" />
                <span>2nd</span>
              </div>
              <div className="feat-avatar-item feat-avatar-item-first">
                <img src={avatar2} alt="CatchUp avatar — cool" className="feat-avatar feat-avatar-lg" />
                <span>1st</span>
              </div>
              <div className="feat-avatar-item">
                <img src={avatar3} alt="CatchUp avatar — reader" className="feat-avatar" />
                <span>3rd</span>
              </div>
            </div>
            <BrowserFrame src={ssLeaderboard} alt="CatchUp leaderboard" dark />
          </div>
        </div>
        <div className="feat-block-inner feat-block-right">
          <div className="feat-label feat-label-light">Social</div>
          <h2 className="feat-headline feat-headline-light">Health is better<br />as a team sport.</h2>
          <p className="feat-body feat-body-light">
            Add friends, compare weekly scores, and race to the top of the
            leaderboard. See who earned the Monthly Mover award and challenge
            them next week.
          </p>
          <ul className="feat-list feat-list-light">
            <li>Live friend rankings</li>
            <li>Monthly Mover award</li>
            <li>Search & add friends by username</li>
          </ul>
        </div>
      </div>

      {/* ── Feature 3: AI Chat ── */}
      <div className="feat-block feat-block-white">
        <div className="feat-block-inner feat-block-left">
          <div className="feat-label">AI Assistant</div>
          <h2 className="feat-headline">A companion<br />for your wellness.</h2>
          <p className="feat-body">
            Ask the CatchUp AI about nutrition, habits, or how you're feeling.
            It responds with warmth and evidence-based advice — with a clear
            reminder that it's not a substitute for medical advice.
          </p>
          <ul className="feat-list">
            <li>Food & nutrition guidance</li>
            <li>Mood & mental wellness support</li>
            <li>Always labelled — not medical advice</li>
          </ul>
        </div>
        <div className="feat-block-visual feat-block-visual-padded">
          <BrowserFrame src={ssChat} alt="CatchUp AI chatbot" />
        </div>
      </div>

      {/* ── Feature 4: Reports & Nearby ── */}
      <div className="feat-block feat-block-peach">
        <div className="feat-block-visual feat-block-visual-padded">
          <BrowserFrame src={ssRecommendations} alt="Health recommendations and nearby care" />
        </div>
        <div className="feat-block-inner feat-block-right">
          <div className="feat-label">Care & Content</div>
          <h2 className="feat-headline">Articles, clinics,<br />and a PANIC button.</h2>
          <p className="feat-body">
            Browse curated health articles. Find nearby clinics with live distance
            and open/closed status. And when it's urgent — the PANIC button is
            always one tap away.
          </p>
          <ul className="feat-list">
            <li>Personalised health articles</li>
            <li>GPS-powered clinic finder</li>
            <li>Emergency PANIC button</li>
          </ul>
        </div>
      </div>

      {/* ── Feature 5: PDF Report ── */}
      <div className="feat-block feat-block-white">
        <div className="feat-block-inner feat-block-left">
          <div className="feat-label">Reports</div>
          <h2 className="feat-headline">Your biomarkers.<br />Doctor-ready.</h2>
          <p className="feat-body">
            Export a formatted PDF of all your tracked biomarkers. Scan the QR
            code from inside the app — then share directly with your healthcare
            provider.
          </p>
          <ul className="feat-list">
            <li>QR code for instant PDF download</li>
            <li>Formatted for medical use</li>
            <li>All tracked biomarkers included</li>
          </ul>
        </div>
        <div className="feat-block-visual feat-block-visual-padded">
          <BrowserFrame src={ssReport} alt="CatchUp biomarker PDF report" />
        </div>
      </div>

    </section>
  );
}
