export default function AboutUs() {
  return (
    <section className="about-apple" id="about">
      <div className="about-apple-inner">
        <div className="feat-label feat-label-center">About</div>
        <h2 className="about-headline">
          Built by health lovers,<br />for health lovers.
        </h2>
        <p className="about-body">
          CatchUp was born from a simple frustration — health apps were either too
          clinical, too complicated, or just didn't speak our language. Literally.
          We built CatchUp to be the companion we always wanted: one that feels
          like a friend, speaks your language, and helps you actually improve —
          not just log numbers.
        </p>
        <a href="https://www.catchup.page" target="_blank" rel="noopener noreferrer" className="about-link">
          Visit catchup.page →
        </a>

        <div className="about-pillars">
          <div className="about-pillar">
            <h3>Health for everyone.</h3>
            <p>Friendly, approachable, and accessible — not clinical or overwhelming.</p>
          </div>
          <div className="about-pillar">
            <h3>Your data stays yours.</h3>
            <p>We don't sell your health data. Everything you track belongs to you.</p>
          </div>
          <div className="about-pillar">
            <h3>Built for Southeast Asia.</h3>
            <p>English, 中文, Bahasa Melayu — with Nearby Care tuned for the region.</p>
          </div>
          <div className="about-pillar">
            <h3>Community first.</h3>
            <p>From leaderboards to shared goals, CatchUp brings people together.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
