import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { EASE, Reveal } from "../motion.jsx";

function TimelineItem({ item, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `exp-${item.id}`;
  return (
    <li className={`timeline__item${item.current ? " timeline__item--current" : ""}`}>
      <span className="timeline__dot" aria-hidden="true" />
      <h3>
        <button type="button" className="timeline__head" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
          <span className="timeline__period">{item.period}</span>
          <span className="timeline__role">{item.role}</span>
          <span className="timeline__company">
            {item.company}
            {item.companyNote && <small> · {item.companyNote}</small>}
            <small> · {item.location}</small>
          </span>
          <ChevronDown className="timeline__chevron" size={22} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            className="timeline__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="timeline__inner">
              {item.roleNote && <p className="timeline__note">{item.roleNote}</p>}
              <ul>
                {item.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <ul className="chips">
                {item.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Experience({ items }) {
  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <Reveal className="section__head">
          <p className="section__kicker">
            <span>03</span> Experience
          </p>
          <h2 id="experience-title" className="section__title">
            Where I've <em>worked</em>
          </h2>
        </Reveal>
        <Reveal as="ol" className="timeline">
          {items.map((item, i) => (
            <TimelineItem key={item.id} item={item} defaultOpen={i === 0} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
