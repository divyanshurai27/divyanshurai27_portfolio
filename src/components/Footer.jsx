import { ArrowUp } from "lucide-react";
import { site } from "../config/site.js";
import { socialLinks } from "./social.jsx";

export function Footer({ links }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer__big" aria-hidden="true">
          {site.identity.fullName}
          <em>.</em>
        </p>
        <div className="footer__row">
          <p>
            © {year} {site.identity.fullName}. Built with React &amp; Framer Motion.
          </p>
          <nav aria-label="Footer">
            <ul className="footer__links">
              {links.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`}>{l.label}</a>
                </li>
              ))}
              {socialLinks().map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a className="icon-button footer__top" href="#top" aria-label="Back to top">
            <ArrowUp size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
