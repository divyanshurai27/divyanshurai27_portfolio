import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, MotionConfig, domAnimation, m, useScroll, useSpring } from "framer-motion";
import "./styles.css";
import { site } from "./config/site.js";
import { projects } from "./data/projects.js";
import { experience } from "./data/experience.js";
import { EASE } from "./motion.jsx";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { ProjectGrid } from "./components/ProjectGrid.jsx";
import { About } from "./components/About.jsx";
import { Experience } from "./components/Experience.jsx";
import { Achievements } from "./components/Achievements.jsx";
import { Contact } from "./components/Contact.jsx";
import { Footer } from "./components/Footer.jsx";
import { AmbientSwarm, BuildIntro } from "./components/Swarm.jsx";

// Appearance tokens from config drive the CSS custom properties for both themes.
const root = document.documentElement;
const { light, ...dark } = site.appearance;
const toVars = (tokens) => Object.entries(tokens).map(([key, value]) => `--${key}:${value};`).join("");
const themeStyle = document.createElement("style");
themeStyle.textContent = `:root{${toVars(dark)}}:root[data-theme="light"]{${toVars(light)}}`;
document.head.append(themeStyle);

function readTheme() {
  try {
    const saved = localStorage.getItem(site.themeStorageKey);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "dark";
}

function readMotionPref() {
  try {
    const saved = localStorage.getItem(site.storageKey);
    if (saved === "on" || saved === "off") return saved === "on";
  } catch {}
  return !prefersReducedMotion();
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The build intro plays once per browser session (and again when Motion is switched back on).
const INTRO_KEY = `${site.storageKey}:intro-played`;
function shouldPlayIntro() {
  if (!readMotionPref() || prefersReducedMotion()) return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) !== "1";
  } catch {
    return true;
  }
}

function App() {
  const [motionOn, setMotionOn] = useState(readMotionPref);
  const [theme, setTheme] = useState(readTheme);
  const [intro, setIntro] = useState(shouldPlayIntro);
  const [heroReady, setHeroReady] = useState(() => !intro);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    root.dataset.motion = motionOn ? "on" : "off";
  }, [motionOn]);

  useEffect(() => {
    root.dataset.theme = theme;
    const bg = theme === "light" ? light.background : dark.background;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      try {
        localStorage.setItem(site.themeStorageKey, next);
      } catch {}
      return next;
    });
  }, []);

  // While the intro builds the page, the first name line shows as an outline.
  useEffect(() => {
    if (intro && !heroReady) root.dataset.intro = "build";
  }, [intro, heroReady]);

  const revealHero = useCallback(() => {
    setHeroReady(true);
    setTimeout(() => delete root.dataset.intro, 450);
  }, []);

  const endIntro = useCallback(() => {
    setIntro(false);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
  }, []);

  const toggleMotion = useCallback(() => {
    const next = !motionOn;
    setMotionOn(next);
    try {
      localStorage.setItem(site.storageKey, next ? "on" : "off");
    } catch {}
    if (next && !prefersReducedMotion()) {
      window.scrollTo({ top: 0, behavior: "instant" });
      setHeroReady(false);
      setIntro(true);
    } else if (!next) {
      // Switched off mid-intro: show the page immediately.
      setIntro(false);
      setHeroReady(true);
      delete root.dataset.intro;
    }
  }, [motionOn]);

  const swarmOn = motionOn && !prefersReducedMotion();

  const showExperience = site.sections.experience && experience.length > 0;
  const showAchievements = site.sections.achievements && site.achievements.length > 0;

  const links = [
    { id: "work", label: "Work", show: true },
    { id: "about", label: "About", show: true },
    { id: "experience", label: "Experience", show: showExperience },
    { id: "achievements", label: "Achievements", show: showAchievements },
    { id: "contact", label: "Contact", show: true },
  ].filter((l) => l.show);

  // LazyMotion + `m` components load only the animation features used here;
  // `strict` throws if a full `motion` component sneaks back in.
  return (
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion={motionOn ? "user" : "always"} transition={{ ease: EASE }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <m.div className="progress" style={{ scaleX }} aria-hidden="true" />
      <Header links={links} motionOn={motionOn} onToggleMotion={toggleMotion} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main">
        <Hero motionOn={motionOn} ready={heroReady} />
        <ProjectGrid projects={projects} />
        <About />
        {showExperience && <Experience items={experience} />}
        {showAchievements && <Achievements items={site.achievements} />}
        <Contact />
      </main>
      <Footer links={links} />
      {swarmOn && intro && <BuildIntro onReveal={revealHero} onDone={endIntro} />}
      {swarmOn && !intro && <AmbientSwarm />}
    </MotionConfig>
    </LazyMotion>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
