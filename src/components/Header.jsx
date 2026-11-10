import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Menu, Moon, Pause, Play, Sun, X } from "lucide-react";
import { site } from "../config/site.js";
import { EASE } from "../motion.jsx";

function useActiveSection(ids) {
  const [active, setActive] = useState("");
  const key = ids.join(",");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);
  return active;
}

export function Header({ links, motionOn, onToggleMotion, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(links.map((l) => l.id));
  const menuButton = useRef(null);
  const { firstName, lastName, initials } = site.identity;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const motionLabel = motionOn ? "Turn motion off" : "Turn motion on";
  const themeLabel = theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <header className={`header${scrolled ? " header--scrolled" : ""}`}>
      <div className="container header__inner">
        <a className="wordmark" href="#top" aria-label={`${site.identity.fullName} — back to top`}>
          <span className="wordmark__mark">{initials}</span>
          <span className="wordmark__text">
            {firstName} <span>{lastName}</span>
          </span>
        </a>

        <nav className="nav" aria-label="Primary">
          <ul>
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} aria-current={active === link.id ? "true" : undefined}>
                  {link.label}
                  <span className="nav__indicator" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <button type="button" className="icon-button" onClick={onToggleTheme} aria-label={themeLabel} title={themeLabel}>
            {theme === "light" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="motion-toggle"
            onClick={onToggleMotion}
            aria-pressed={motionOn}
            aria-label={motionLabel}
            title={motionLabel}
          >
            {motionOn ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            <span>Motion</span>
          </button>
          <a className="btn btn--small btn--primary header__cta" href="#contact">
            Let's talk
          </a>
          <button
            ref={menuButton}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <ul>
              {links.map((link, i) => (
                <m.li
                  key={link.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: EASE }}
                >
                  <a href={`#${link.id}`} onClick={() => setOpen(false)}>
                    <span className="mobile-menu__index">0{i + 1}</span>
                    {link.label}
                  </a>
                </m.li>
              ))}
            </ul>
            <a className="mobile-menu__mail" href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
