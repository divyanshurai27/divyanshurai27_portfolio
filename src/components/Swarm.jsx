import { useEffect, useRef } from "react";

// "Swarm" build effect: a flock of design-tool cursors that wireframe the hero
// on load (BuildIntro), then build every block below it the same way as it
// scrolls into view (AmbientSwarm). Pure canvas, no dependencies.

const COLORS = ["#ff7eb6", "#7ee0ff", "#ffd166", "#b4a2ff", "#7dffa8", "#ff9f6b"];
const BLUE = "#0d99ff";
const LABEL_FONT = "600 10px Manrope, system-ui, sans-serif";

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

function makeAgent(x, y, i) {
  return { x, y, vx: 0, vy: 0, tx: x, ty: y, angle: 0, alpha: 1, seed: Math.random() * 1000, color: COLORS[i % COLORS.length] };
}

// Under-damped spring toward (tx, ty): a little overshoot reads as "alive".
function stepAgent(a, dt, stiffness, damping, maxSpeed) {
  a.vx += ((a.tx - a.x) * stiffness - a.vx * damping) * dt;
  a.vy += ((a.ty - a.y) * stiffness - a.vy * damping) * dt;
  const speed = Math.hypot(a.vx, a.vy);
  if (speed > maxSpeed) {
    a.vx *= maxSpeed / speed;
    a.vy *= maxSpeed / speed;
  }
  if (speed > 12) a.angle = Math.atan2(a.vy, a.vx);
  a.x += a.vx * dt;
  a.y += a.vy * dt;
}

function drawCursor(ctx, a) {
  if (a.alpha <= 0) return;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.angle);
  ctx.globalAlpha = a.alpha;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(-5, -4.5);
  ctx.lineTo(-2.5, 0);
  ctx.lineTo(-5, 4.5);
  ctx.closePath();
  ctx.fillStyle = a.color;
  ctx.fill();
  ctx.restore();
}

// Selection box: outline traced clockwise up to `progress`, then size label + handles.
function drawBox(ctx, b, progress, { alpha = 1, fill = 0, fillColor = "#888", label = true, handles = true } = {}) {
  if (progress <= 0 || alpha <= 0) return;
  const { x, y, w, h } = b;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (fill > 0) {
    ctx.globalAlpha = alpha * fill;
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w * Math.min(1, progress), h);
    ctx.globalAlpha = alpha;
  }
  const pts = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
    [x, y],
  ];
  let remaining = progress * 2 * (w + h);
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 1; i < pts.length && remaining > 0; i++) {
    const [px, py] = pts[i - 1];
    const [nx, ny] = pts[i];
    const seg = Math.hypot(nx - px, ny - py);
    const f = Math.min(1, remaining / seg);
    ctx.lineTo(px + (nx - px) * f, py + (ny - py) * f);
    remaining -= seg;
  }
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 1;
  ctx.stroke();

  if (label && progress > 0.55) {
    const text = `${Math.round(w)} × ${Math.round(h)}`;
    ctx.font = LABEL_FONT;
    const tw = ctx.measureText(text).width + 10;
    const lx = x + w / 2 - tw / 2;
    const ly = y + h + 5;
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(lx, ly, tw, 15, 3) : ctx.rect(lx, ly, tw, 15);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.fillText(text, lx + 5, ly + 8);
  }
  if (handles && progress >= 1) {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = BLUE;
    for (const [hx, hy] of pts.slice(0, 4)) {
      ctx.fillRect(hx - 3, hy - 3, 6, 6);
      ctx.strokeRect(hx - 3, hy - 3, 6, 6);
    }
  }
  ctx.restore();
}

// Full-viewport, DPR-aware canvas; returns the current CSS size on demand.
function useViewportCanvas(canvasRef, setup) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = { w: 0, h: 0 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = window.innerWidth;
      size.h = window.innerHeight;
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const teardown = setup(ctx, size);
    return () => {
      window.removeEventListener("resize", resize);
      teardown?.();
    };
  }, []);
}

// Tight bounds of an element's text (headings are full-width blocks).
function contentRect(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return r.width > 0 ? r : el.getBoundingClientRect();
}

const INTRO_TARGETS = [
  ".wordmark",
  ".nav ul",
  ".header__actions",
  ".eyebrow",
  ".hero__greeting",
  ".hero__line > span",
  ".hero__portrait",
  ".hero__headline",
  ".hero__intro",
  ".hero__ctas",
  ".terminal",
  ".metrics",
];

// Timeline (ms)
const SWARM_END = 900;
const DRAW_MS = 520;
const FILL_AT = 2000;
const REVEAL_AT = 2350;
const EXIT_AT = 2700;
const END_AT = 3400;

export function BuildIntro({ onReveal, onDone }) {
  const canvasRef = useRef(null);
  const skip = useRef(false);
  const callbacks = useRef({ onReveal, onDone });
  callbacks.current = { onReveal, onDone };

  useViewportCanvas(canvasRef, (ctx, size) => {
    const styles = getComputedStyle(document.documentElement);
    const bg = styles.getPropertyValue("--background").trim() || "#090909";
    const fillColor = styles.getPropertyValue("--muted").trim() || "#888";
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const boxes = INTRO_TARGETS.flatMap((sel) => [...document.querySelectorAll(sel)])
      .map(contentRect)
      .filter((r) => r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < size.h && r.right > 0 && r.left < size.w)
      .slice(0, 14)
      .map((r, i) => ({ x: r.left, y: r.top, w: r.width, h: r.height, start: SWARM_END + i * 85 }));

    const count = size.w < 700 ? 16 : 26;
    const cx = size.w / 2;
    const cy = size.h * 0.45;
    const agents = Array.from({ length: count }, (_, i) =>
      makeAgent(cx + (Math.random() - 0.5) * 240, cy + (Math.random() - 0.5) * 160, i)
    );

    const swarmTarget = (a, i, t) => {
      const ang = (t / 1000) * 1.7 + a.seed;
      const rad = 50 + 80 * (0.5 + 0.5 * Math.sin(t / 650 + a.seed * 3));
      a.tx = cx + Math.cos(ang + i) * rad * 1.6;
      a.ty = cy + Math.sin(ang * 1.3 + i) * rad;
    };

    let raf = 0;
    let revealed = false;
    let finished = false;
    const start = performance.now();
    let last = start;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (!revealed) callbacks.current.onReveal();
      callbacks.current.onDone();
    };
    const safety = setTimeout(finish, END_AT + 2500);

    const frame = (now) => {
      const t = skip.current ? END_AT : now - start;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, size.w, size.h);

      const bgAlpha = t < REVEAL_AT ? 1 : clamp(1 - (t - REVEAL_AT) / 600);
      if (bgAlpha > 0) {
        ctx.globalAlpha = bgAlpha;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size.w, size.h);
        ctx.globalAlpha = 1;
      }
      if (!revealed && t >= REVEAL_AT) {
        revealed = true;
        callbacks.current.onReveal();
      }

      const boxAlpha = t < EXIT_AT ? 1 : clamp(1 - (t - EXIT_AT) / 600);
      const fill = clamp((t - FILL_AT) / 350) * 0.14;
      for (const b of boxes) drawBox(ctx, b, clamp((t - b.start) / DRAW_MS), { alpha: boxAlpha, fill, fillColor });

      agents.forEach((a, i) => {
        if (t < SWARM_END || boxes.length === 0) {
          swarmTarget(a, i, t);
        } else if (t < EXIT_AT) {
          const b = boxes[i % boxes.length];
          if (t < b.start) swarmTarget(a, i, t);
          else {
            const corner = Math.floor(i / boxes.length) % 4;
            const jitter = Math.sin(a.seed) * 6;
            a.tx = (corner === 1 || corner === 2 ? b.x + b.w : b.x) + jitter;
            a.ty = (corner >= 2 ? b.y + b.h : b.y) + jitter;
          }
        } else {
          if (!a.exiting) {
            const ang = Math.atan2(a.y - cy, a.x - cx);
            a.tx = a.x + Math.cos(ang) * size.w;
            a.ty = a.y + Math.sin(ang) * size.h;
            a.exiting = true;
          }
          a.alpha = clamp(1 - (t - EXIT_AT) / 600);
        }
        stepAgent(a, dt, 22, 6.5, 1400);
        drawCursor(ctx, a);
      });

      if (t >= END_AT) finish();
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e) => {
      if (e.key === "Escape") skip.current = true;
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  });

  return (
    <div className="intro" onPointerDown={() => (skip.current = true)}>
      <canvas ref={canvasRef} className="intro__canvas" aria-hidden="true" />
      <button type="button" className="intro__skip" onClick={() => (skip.current = true)}>
        Skip intro
      </button>
    </div>
  );
}

// Blocks below the hero that the swarm builds as they scroll into view.
const BUILD_TARGETS = [
  ".section__head",
  ".toolbar",
  ".projects__item",
  ".about__bio",
  ".process__step",
  ".skills__group",
  ".timeline__item",
  ".achievements__item",
  ".contact__info",
  ".contact-form",
  ".footer__big",
  ".footer__row",
].join(",");

const BUILD_STAGGER = 90;
const BUILD_DRAW = 450;
const BUILD_REVEAL = 620; // content fades in here
const BUILD_END = 1050;

export function AmbientSwarm() {
  const canvasRef = useRef(null);

  useViewportCanvas(canvasRef, (ctx, size) => {
    const fillColor = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#888";
    const count = size.w < 700 ? 8 : 14;
    const agents = Array.from({ length: count }, (_, i) => makeAgent(Math.random() * size.w, -20 - Math.random() * 60, i));

    // Hide every target until the swarm has built it.
    const targets = [...document.querySelectorAll(BUILD_TARGETS)];
    targets.forEach((el) => el.classList.add("build-pending"));

    const reveal = (el) => {
      if (!el.classList.contains("build-pending")) return;
      el.classList.add("build-reveal");
      el.classList.remove("build-pending");
      setTimeout(() => el.classList.remove("build-reveal"), 700);
    };

    const builds = [];
    const observer = new IntersectionObserver(
      (entries) => {
        // Stagger only blocks that enter together, so fast scrolling never queues up.
        let start = performance.now();
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          builds.push({ el: entry.target, start, revealed: false });
          start += BUILD_STAGGER;
        }
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => observer.observe(el));

    let orbiting = false;
    const contact = document.getElementById("contact");
    const contactObserver = new IntersectionObserver((entries) => (orbiting = entries[0].isIntersecting), { threshold: 0.35 });
    if (contact) contactObserver.observe(contact);

    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, size.w, size.h);

      // Draw active builds; collect the ones still being drawn for the cursors.
      const drawing = [];
      for (let i = builds.length - 1; i >= 0; i--) {
        const b = builds[i];
        const age = now - b.start;
        if (age < 0) continue;
        if (age >= BUILD_REVEAL && !b.revealed) {
          b.revealed = true;
          reveal(b.el);
        }
        if (age >= BUILD_END || !b.el.isConnected) {
          reveal(b.el);
          builds.splice(i, 1);
          continue;
        }
        const r = contentRect(b.el);
        const box = { x: r.left, y: r.top, w: r.width, h: r.height };
        if (box.y > size.h || box.y + box.h < 0) {
          // Scrolled past before it was built: just show it.
          reveal(b.el);
          builds.splice(i, 1);
          continue;
        }
        drawBox(ctx, box, clamp(age / BUILD_DRAW), {
          alpha: age < BUILD_REVEAL ? 1 : clamp(1 - (age - BUILD_REVEAL) / (BUILD_END - BUILD_REVEAL)),
          fill: clamp((age - BUILD_DRAW) / 150) * 0.14 * (age < BUILD_REVEAL ? 1 : 0),
          fillColor,
        });
        if (age < BUILD_REVEAL) drawing.push(box);
      }
      drawing.reverse();

      const orbitEl = orbiting && !drawing.length && document.querySelector(".contact__email .icon-button");
      const orbitRect = orbitEl && orbitEl.getBoundingClientRect();
      const t = now / 1000;

      agents.forEach((a, i) => {
        if (drawing.length) {
          const box = drawing[i % drawing.length];
          const corner = Math.floor(i / drawing.length) % 4;
          const jitter = Math.sin(a.seed) * 5;
          a.tx = (corner === 1 || corner === 2 ? box.x + box.w : box.x) + jitter;
          a.ty = (corner >= 2 ? box.y + box.h : box.y) + jitter;
        } else if (orbitRect && orbitRect.bottom > 0 && orbitRect.top < size.h) {
          const ang = t * 1.4 + (i / agents.length) * Math.PI * 2;
          const radius = Math.max(orbitRect.width, orbitRect.height) / 2 + 26;
          a.tx = orbitRect.left + orbitRect.width / 2 + Math.cos(ang) * radius;
          a.ty = orbitRect.top + orbitRect.height / 2 + Math.sin(ang) * radius * 0.8;
        } else {
          a.tx = size.w * (0.5 + 0.46 * Math.sin(t * 0.11 * (1 + (a.seed % 0.7)) + a.seed));
          a.ty = size.h * (0.5 + 0.42 * Math.sin(t * 0.13 * (1 + (a.seed % 0.5)) + a.seed * 2));
        }
        a.alpha = 0.9;
        stepAgent(a, dt, drawing.length ? 20 : 7, drawing.length ? 6.5 : 4.2, drawing.length ? 1500 : 650);
        drawCursor(ctx, a);
      });

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      contactObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      // Never leave content hidden once the swarm is gone (e.g. Motion switched off).
      targets.forEach((el) => el.classList.remove("build-pending", "build-reveal"));
    };
  });

  return <canvas ref={canvasRef} className="ambient-swarm" aria-hidden="true" />;
}
