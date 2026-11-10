import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, FileText, MapPin } from "lucide-react";
import { site } from "../config/site.js";
import { projects } from "../data/projects.js";
import { EASE, Magnetic } from "../motion.jsx";

// Entrance animation; held back while the build intro is still running.
const hidden = { opacity: 0, y: 32 };
const shown = { opacity: 1, y: 0 };
const rise = (delay, ready) => ({
  initial: hidden,
  animate: ready ? shown : hidden,
  transition: { duration: 0.8, ease: EASE, delay },
});

function TerminalCard({ ready }) {
  const { fullName, profession, status } = site.identity;
  const stack = site.marquee.slice(0, 5).join(" · ");
  const lines = [
    ["whoami", `${fullName.toLowerCase().replace(/\s+/g, "-")} — ${profession.toLowerCase()}`],
    ["cat stack.txt", stack],
    ["ls projects/", projects.map((p) => `${p.id}/`).join("  ")],
    ["status", status],
  ];
  return (
    <m.figure className="terminal" {...rise(0.55, ready)} aria-label="Quick facts">
      <div className="terminal__bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <em>~/divyanshu</em>
      </div>
      <dl className="terminal__body">
        {lines.map(([cmd, out]) => (
          <div key={cmd}>
            <dt>
              <span aria-hidden="true">$ </span>
              {cmd}
            </dt>
            <dd>{out}</dd>
          </div>
        ))}
        <div className="terminal__cursor" aria-hidden="true">
          $ <span />
        </div>
      </dl>
    </m.figure>
  );
}

export function Hero({ motionOn, ready = true }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const nameY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  const id = site.identity;

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="container hero__inner">
        <m.p className="eyebrow" {...rise(0.05, ready)}>
          <span className="pulse" aria-hidden="true" />
          {id.profession} <span className="eyebrow__sep">/</span> {id.status}
        </m.p>

        {/* The stage (not the h1) carries the parallax so the name and the
            portrait beside it move together. */}
        <m.div
          className={`hero__stage${id.portrait ? " hero__stage--portrait" : ""}`}
          style={{
            "--name-chars": Math.max(id.firstName.length, id.lastName.length + 1),
            ...(motionOn ? { y: nameY, opacity: nameOpacity } : {}),
          }}
        >
          <h1 className="hero__name">
            <m.span className="hero__greeting" {...rise(0.15, ready)}>
              {id.greeting}
            </m.span>
            <span className="hero__line">
              <m.span {...rise(0.2, ready)}>{id.firstName}</m.span>
            </span>
            <span className="hero__line hero__line--accent">
              <m.span {...rise(0.3, ready)}>
                {id.lastName}
                <em>.</em>
              </m.span>
            </span>
          </h1>
          {id.portrait && (
            <m.img
              className="hero__portrait"
              src={id.portrait}
              alt={`Pixel-art portrait of ${id.fullName}`}
              width="960"
              height="919"
              fetchPriority="high"
              {...rise(0.25, ready)}
            />
          )}
        </m.div>

        <div className="hero__grid">
          <div className="hero__copy">
            <m.p className="hero__headline" {...rise(0.4, ready)}>
              {id.headline}
            </m.p>
            <m.p className="hero__intro" {...rise(0.48, ready)}>
              {id.intro}
            </m.p>
            <m.div className="hero__ctas" {...rise(0.56, ready)}>
              <Magnetic enabled={motionOn}>
                <a className="btn btn--primary" href="#work">
                  View work <ArrowDownRight size={18} aria-hidden="true" />
                </a>
              </Magnetic>
              <a className="btn btn--ghost" href="#contact">
                Contact
              </a>
              {id.resume && (
                <a className="btn btn--ghost" href={id.resume} download>
                  <FileText size={16} aria-hidden="true" /> Résumé
                </a>
              )}
            </m.div>
            <m.p className="hero__meta" {...rise(0.62, ready)}>
              <MapPin size={16} aria-hidden="true" /> {id.location}
              <span className="hero__meta-sep" aria-hidden="true" />
              {id.roleLine2}
            </m.p>
          </div>
          <TerminalCard ready={ready} />
        </div>

        {site.metrics.length > 0 && (
          <m.dl className="metrics" style={{ "--metric-cols": site.metrics.length }} {...rise(0.7, ready)}>
            {site.metrics.map((m) => (
              <div key={m.label} className="metrics__item">
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </m.dl>
        )}
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...site.marquee, ...site.marquee].map((item, i) => (
            <span key={i}>
              {item}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
