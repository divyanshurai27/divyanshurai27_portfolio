import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { EASE, Reveal } from "../motion.jsx";
import { ProjectCover } from "./ProjectCover.jsx";
import { ProjectDialog } from "./ProjectDialog.jsx";

const PAGE_SIZE = 6;

export function ProjectGrid({ projects }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [active, setActive] = useState(null);
  const opener = useRef(null);

  const ordered = useMemo(() => [...projects].sort((a, b) => Number(b.featured) - Number(a.featured)), [projects]);
  const categories = useMemo(() => ["All", ...new Set(projects.map((p) => p.category))], [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordered.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return [p.title, p.subtitle, p.summary, p.category, ...p.tools].join(" ").toLowerCase().includes(q);
    });
  }, [ordered, category, query]);

  const open = (project, el) => {
    opener.current = el;
    setActive(project);
  };
  const close = useCallback(() => {
    setActive(null);
    opener.current?.focus();
  }, []);

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <Reveal className="section__head">
          <p className="section__kicker">
            <span>01</span> Selected work
          </p>
          <h2 id="work-title" className="section__title">
            Things I've <em>built</em>
          </h2>
        </Reveal>

        {projects.length === 0 ? (
          <p className="empty">Projects are on their way — check back soon.</p>
        ) : (
          <>
            <Reveal className="toolbar" delay={0.1}>
              <div className="filters" role="group" aria-label="Filter projects by category">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="filter"
                    aria-pressed={category === c}
                    onClick={() => {
                      setCategory(c);
                      setVisible(PAGE_SIZE);
                    }}
                  >
                    {c}
                    <span className="filter__line" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <label className="search">
                <Search size={16} aria-hidden="true" />
                <span className="sr-only">Search projects</span>
                <input
                  type="search"
                  placeholder="Search by name or tech…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                />
              </label>
            </Reveal>

            <p className="sr-only" aria-live="polite">
              {filtered.length} project{filtered.length === 1 ? "" : "s"} shown
            </p>

            {filtered.length === 0 ? (
              <p className="empty">No projects match “{query}”. Try another keyword.</p>
            ) : (
              <ul className="projects">
                <AnimatePresence mode="popLayout">
                  {filtered.slice(0, visible).map((p, i) => (
                    <m.li
                      key={p.id}
                      initial={{ opacity: 0, y: 32 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.6, ease: EASE, delay: (i % 2) * 0.1 }}
                      className={p.featured ? "projects__item projects__item--featured" : "projects__item"}
                    >
                      <button type="button" className="card" aria-haspopup="dialog" onClick={(e) => open(p, e.currentTarget)}>
                        <div className="card__media">
                          <ProjectCover project={p} index={ordered.indexOf(p)} />
                        </div>
                        <div className="card__body">
                          <p className="card__meta">
                            <span>{p.category}</span>
                            {p.year && <span>{p.year}</span>}
                          </p>
                          <h3 className="card__title">{p.title}</h3>
                          <p className="card__subtitle">{p.subtitle}</p>
                          <p className="card__summary">{p.summary}</p>
                          <ul className="chips" aria-label="Tech stack">
                            {p.tools.slice(0, 5).map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                          <span className="card__cta">
                            View case study <ArrowUpRight size={18} aria-hidden="true" />
                          </span>
                        </div>
                      </button>
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}

            {filtered.length > visible && (
              <div className="load-more">
                <button type="button" className="btn btn--ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProjectDialog project={active} onClose={close} />
    </section>
  );
}
