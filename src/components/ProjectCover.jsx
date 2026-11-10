// Illustrated, non-photographic covers used until real screenshots are added
// via `coverImage` in data/projects.js.

function RagMotif() {
  const docs = [40, 110, 180];
  return (
    <svg viewBox="0 0 400 260" className="cover__svg" aria-hidden="true" focusable="false">
      {docs.map((y, i) => (
        <g key={y}>
          <rect x="28" y={y} width="62" height="44" rx="4" className="cover__stroke" />
          <line x1="38" y1={y + 14} x2="80" y2={y + 14} className="cover__faint" />
          <line x1="38" y1={y + 24} x2="72" y2={y + 24} className="cover__faint" />
          <line x1="38" y1={y + 34} x2="76" y2={y + 34} className="cover__faint" />
          <path d={`M90 ${y + 22} C 140 ${y + 22}, 150 130, 196 130`} className="cover__flow" style={{ animationDelay: `${i * 0.4}s` }} />
        </g>
      ))}
      <text x="128" y="70" className="cover__label">BM25</text>
      <text x="124" y="206" className="cover__label">DENSE</text>
      <circle cx="220" cy="130" r="26" className="cover__accent-fill" />
      <text x="220" y="135" textAnchor="middle" className="cover__label cover__label--dark">RRF</text>
      <path d="M246 130 H 300" className="cover__flow" style={{ animationDelay: "1.2s" }} />
      <rect x="300" y="96" width="76" height="68" rx="6" className="cover__stroke cover__stroke--accent" />
      <line x1="312" y1="114" x2="364" y2="114" className="cover__faint" />
      <line x1="312" y1="126" x2="356" y2="126" className="cover__faint" />
      <line x1="312" y1="138" x2="348" y2="138" className="cover__faint" />
      <text x="312" y="156" className="cover__label cover__label--accent">[1] [2]</text>
    </svg>
  );
}

function BooksMotif() {
  const spines = [
    [40, 150, 26],
    [70, 120, 30],
    [104, 170, 22],
    [130, 135, 34],
    [168, 160, 24],
    [196, 110, 30],
    [230, 150, 26],
    [260, 128, 32],
    [296, 165, 22],
    [322, 140, 30],
  ];
  return (
    <svg viewBox="0 0 400 260" className="cover__svg" aria-hidden="true" focusable="false">
      <line x1="24" y1="222" x2="376" y2="222" className="cover__stroke" />
      {spines.map(([x, h, w], i) => (
        <g key={x} className="cover__book" style={{ animationDelay: `${i * 0.08}s` }}>
          <rect x={x} y={222 - h} width={w} height={h} rx="2" className={i === 5 ? "cover__accent-fill" : "cover__stroke"} />
          <line x1={x + 5} y1={222 - h + 14} x2={x + w - 5} y2={222 - h + 14} className="cover__faint" />
          <line x1={x + 5} y1={214} x2={x + w - 5} y2={214} className="cover__faint" />
        </g>
      ))}
    </svg>
  );
}

function AirMotif() {
  const past = "M30 170 L60 160 L90 175 L120 150 L150 158 L180 135 L210 140";
  const future = "M210 140 L240 120 L270 96 L300 82 L330 104 L360 128 L380 140";
  return (
    <svg viewBox="0 0 400 260" className="cover__svg" aria-hidden="true" focusable="false">
      <line x1="30" y1="214" x2="380" y2="214" className="cover__stroke" />
      <line x1="30" y1="104" x2="380" y2="104" className="cover__faint" strokeDasharray="6 6" />
      <text x="30" y="96" className="cover__label">HIGH RISK</text>
      <line x1="210" y1="40" x2="210" y2="214" className="cover__faint" />
      <text x="216" y="52" className="cover__label">NOW</text>
      <text x="340" y="232" className="cover__label">+24H</text>
      <text x="30" y="232" className="cover__label">PM2.5</text>
      <path d={past} className="cover__stroke" strokeLinejoin="round" />
      <path d={future} className="cover__flow" strokeLinejoin="round" />
      <circle cx="300" cy="82" r="14" className="cover__stroke cover__stroke--accent" />
      <circle cx="300" cy="82" r="5" className="cover__accent-fill" />
    </svg>
  );
}

function ServicesMotif() {
  const producers = [
    [60, "USER"],
    [170, "TASK"],
  ];
  return (
    <svg viewBox="0 0 400 260" className="cover__svg" aria-hidden="true" focusable="false">
      {producers.map(([y, label], i) => (
        <g key={label}>
          <rect x="24" y={y - 22} width="86" height="44" rx="6" className="cover__stroke" />
          <text x="67" y={y + 4} textAnchor="middle" className="cover__label">{label}</text>
          <path d={`M110 ${y} C 140 ${y}, 140 115, 160 115`} className="cover__flow" style={{ animationDelay: `${i * 0.5}s` }} />
        </g>
      ))}
      <rect x="160" y="88" width="84" height="54" rx="8" className="cover__accent-fill" />
      <text x="202" y="112" textAnchor="middle" className="cover__label cover__label--dark">RABBIT</text>
      <text x="202" y="128" textAnchor="middle" className="cover__label cover__label--dark">MQ</text>
      <path d="M244 115 H 290" className="cover__flow" style={{ animationDelay: "1s" }} />
      <rect x="290" y="93" width="86" height="44" rx="6" className="cover__stroke cover__stroke--accent" />
      <text x="333" y="119" textAnchor="middle" className="cover__label cover__label--accent">NOTIFY</text>
      <path d="M202 142 V 196" className="cover__faint" strokeDasharray="4 6" />
      <rect x="172" y="196" width="60" height="30" rx="5" className="cover__stroke" />
      <text x="202" y="215" textAnchor="middle" className="cover__label">DLQ</text>
    </svg>
  );
}

const motifs = { rag: RagMotif, books: BooksMotif, air: AirMotif, services: ServicesMotif };

export function ProjectCover({ project, index }) {
  if (project.coverImage) {
    return <img src={project.coverImage} alt={`${project.title} — preview`} loading="lazy" width="1200" height="780" />;
  }
  const Motif = motifs[project.motif];
  return (
    <div className="cover">
      <span className="cover__index">{String(index + 1).padStart(2, "0")}</span>
      {Motif && <Motif />}
      <span className="cover__title" aria-hidden="true">
        {project.title}
      </span>
    </div>
  );
}
