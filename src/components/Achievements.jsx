import { Reveal } from "../motion.jsx";

export function Achievements({ items }) {
  return (
    <section className="section section--alt" id="achievements" aria-labelledby="achievements-title">
      <div className="container">
        <Reveal className="section__head">
          <p className="section__kicker">
            <span>04</span> Achievements
          </p>
          <h2 id="achievements-title" className="section__title">
            Hackathons &amp; <em>wins</em>
          </h2>
        </Reveal>
        <ol className="achievements">
          {items.map((a, i) => (
            <Reveal as="li" key={a.title} className="achievements__item" delay={(i % 2) * 0.08}>
              <span className="achievements__num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
              <span className="achievements__period">{a.period}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
