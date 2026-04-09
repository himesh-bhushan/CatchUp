import ssEnglish from "/images/image_1774281602158.png";
import ssChinese from "/images/image_1774281695862.png";
import ssMelayu from "/images/image_1774283252783.png";

const langs = [
  {
    code: "EN",
    name: "English",
    greeting: "Welcome back",
    src: ssEnglish,
    alt: "CatchUp in English",
  },
  {
    code: "中文",
    name: "Chinese",
    greeting: "欢迎回来",
    src: ssChinese,
    alt: "CatchUp in Chinese",
  },
  {
    code: "BM",
    name: "Bahasa Melayu",
    greeting: "Selamat Kembali",
    src: ssMelayu,
    alt: "CatchUp in Bahasa Melayu",
  },
];

export default function LanguageSection() {
  return (
    <section className="lang-section" id="languages">
      <div className="lang-header">
        <div className="feat-label feat-label-center">Localisation</div>
        <h2 className="lang-headline">Speaks your language.<br />Literally.</h2>
        <p className="lang-sub">
          CatchUp is fully localised in three languages — every label, goal, and notification
          translated natively. No more health apps that feel like they weren't made for you.
        </p>
      </div>

      <div className="lang-grid">
        {langs.map((l) => (
          <div className="lang-card" key={l.code}>
            <div className="lang-screen-frame">
              <div className="lang-screen-bar">
                <span className="lang-dot" />
                <span className="lang-dot" />
                <span className="lang-dot" />
                <span className="lang-url">catchup.page</span>
              </div>
              <div className="lang-img-wrap">
                <img src={l.src} alt={l.alt} className="lang-img" />
              </div>
            </div>
            <div className="lang-card-info">
              <span className="lang-code">{l.code}</span>
              <div>
                <div className="lang-name">{l.name}</div>
                <div className="lang-greeting">"{l.greeting}"</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
