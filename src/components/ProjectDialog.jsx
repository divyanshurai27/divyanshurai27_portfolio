import { useEffect, useRef } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Github, X } from "lucide-react";
import { site } from "../config/site.js";
import { EASE } from "../motion.jsx";
import { ProjectCover } from "./ProjectCover.jsx";

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';

export function ProjectDialog({ project, onClose }) {
  const panel = useRef(null);

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("[data-autofocus]")?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <m.div
          className="dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <m.div
            ref={panel}
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <button type="button" className="dialog__close" onClick={onClose} aria-label="Close project details" data-autofocus>
              <X size={20} aria-hidden="true" />
            </button>

            <div className="dialog__media">
              <ProjectCover project={project} index={0} />
            </div>

            <div className="dialog__content">
              <p className="card__meta">
                <span>{project.category}</span>
                {project.period && <span>{project.period}</span>}
                {project.role && <span>{project.role}</span>}
              </p>
              <h2 id="dialog-title" className="dialog__title">
                {project.title}
              </h2>
              <p className="dialog__subtitle">{project.subtitle}</p>
              <p className="dialog__desc">{project.description}</p>

              {project.stats?.length > 0 && (
                <dl className="dialog__stats">
                  {project.stats.map((s) => (
                    <div key={s.label}>
                      <dd>{s.value}</dd>
                      <dt>{s.label}</dt>
                    </div>
                  ))}
                </dl>
              )}

              <h3 className="dialog__heading">What I did</h3>
              <ul className="dialog__list">
                {project.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>

              <h3 className="dialog__heading">Tech stack</h3>
              <ul className="chips">
                {project.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>

              <div className="dialog__links">
                {project.liveUrl && (
                  <a className="btn btn--primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    Live demo <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                )}
                {project.sourceUrl ? (
                  <a className="btn btn--ghost" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <Github size={16} aria-hidden="true" /> Source code
                  </a>
                ) : (
                  site.contact.github && (
                    <a className="btn btn--ghost" href={site.contact.github} target="_blank" rel="noopener noreferrer">
                      <Github size={16} aria-hidden="true" /> More on GitHub
                    </a>
                  )
                )}
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
