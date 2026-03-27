import { useState, useEffect } from "react";
import catchupLogo from "@assets/catch-up_1774283064298.png";

const links = [
  { label: "Features", href: "#features" },
  { label: "Themes", href: "#themes" },
  { label: "Languages", href: "#languages" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-logo">
        <img src={catchupLogo} alt="CatchUp" className="logo-img" />
        <span className="logo-text">CatchUp</span>
      </div>
      <div className="navbar-links">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="nav-link" onClick={(e) => scrollTo(e, l.href)}>
            {l.label}
          </a>
        ))}
      </div>
      <a href="https://www.catchup.page" target="_blank" rel="noopener noreferrer" className="navbar-cta">
        Try it free
      </a>
    </nav>
  );
}
