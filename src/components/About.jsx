import { GraduationCap } from "lucide-react";
import { site } from "../config/site.js";
import { Reveal } from "../motion.jsx";

export function About() {
  const { about } = site.identity;
  return (
    <section className="section section--alt" id="about" aria-labelledby="about-title">
      <div className="container">
        <Reveal className="section__head">
          <p className="section__kicker">
            <span>02</span> About
          </p>
          <h2 id="about-title" className="section__title">
            Code, <em>tested</em> twice
          </h2>
        </Reveal>

        <div className="about">
          <Reveal className="about__bio">
            {about.map((p, i) => (
              <p key={i} className={i === 0 ? "about__lead" : undefined}>
                {p}
              </p>
            ))}
          </Reveal>

          {site.process.length > 0 && (
            <ol className="process">
              {site.process.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 0.08} className="process__step">
                  <span className="process__num">0{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Reveal>
              ))}
            </ol>
          )}
        </div>

        <div className="skills">
          {site.skills.map((s, i) => (
            <Reveal key={s.group} className="skills__group" delay={(i % 3) * 0.06}>
              <h3>{s.group}</h3>
              <ul className="chips">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {site.sections.education && site.education.length > 0 && (
          <Reveal className="education">
            <h3 className="education__title">
              <GraduationCap size={20} aria-hidden="true" /> Education
            </h3>
            <ul>
              {site.education.map((e) => (
                <li key={e.school}>
                  <div>
                    <p className="education__school">{e.school}</p>
                    <p className="education__degree">{e.degree}</p>
                  </div>
                  <div className="education__right">
                    <p>{e.period}</p>
                    <p className="education__detail">{e.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
