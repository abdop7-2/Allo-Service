import { useEffect, useRef, useState } from "react";
import "./AlloServiceLanding.css";
import hero from "../assets/landing-hero.jpg";

const HERO_IMG = hero;

const CATEGORIES = [
  { label: "Plomberie" },
  { label: "Électricité" },
  { label: "Menuiserie" },
  { label: "Peinture" },
  { label: "Carrelage" },
];

const STATS = [
  { value: 500, suffix: "+", label: "Artisans vérifiés" },
  { value: 4.8, decimals: 1, suffix: "★", label: "Note moyenne" },
  { value: 2, prefix: "~", suffix: "h", label: "Temps de réponse" },
  { value: 12000, sep: true, suffix: "+", label: "Missions réalisées" },
];

/* Small hook: animates a number from 0 to target once on mount */
function useCountUp(target, { decimals = 0, prefix = "", suffix = "", sep = false } = {}) {
  const [display, setDisplay] = useState(prefix + (decimals ? (0).toFixed(decimals) : "0") + suffix);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (v) => {
      let s = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
      if (sep) s = Number(s).toLocaleString("fr-FR");
      return prefix + s + suffix;
    };
    if (prefersReduced) {
      setDisplay(fmt(target));
      return;
    }
    const dur = 1600;
    const start = performance.now() + 400;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let raf;
    const frame = (now) => {
      const t = Math.min(Math.max((now - start) / dur, 0), 1);
      setDisplay(fmt(target * ease(t)));
      if (t < 1) raf = requestAnimationFrame(frame);
      else setDisplay(fmt(target));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [target, decimals, prefix, suffix, sep]);

  return display;
}

function Stat({ stat }) {
  const display = useCountUp(stat.value, stat);
  return (
    <div className="as-stat">
      <b>{display}</b>
      <span>{stat.label}</span>
    </div>
  );
}

export default function AlloServiceLanding() {
  const [query, setQuery] = useState("");
  const particlesRef = useRef(null);

  /* Build floating particles once */
  useEffect(() => {
    const host = particlesRef.current;
    if (!host) return;
    const count = window.innerWidth < 600 ? 10 : 20;
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "as-particle";
      const size = 4 + Math.random() * 12;
      p.style.width = p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${10 + Math.random() * 14}s`;
      p.style.animationDelay = `${Math.random() * 12}s`;
      host.appendChild(p);
      nodes.push(p);
    }
    return () => nodes.forEach((n) => n.remove());
  }, []);

  return (
    
    <section className="as-hero">
      
      <div
        className="as-hero__bg"
        role="img"
        aria-label="Mosquée Hassan II à Casablanca au coucher du soleil"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />
      <div className="as-hero__overlay" />
      <div className="as-particles" ref={particlesRef} aria-hidden="true" />

      <nav className="as-nav">
        <div className="as-logo">
          Allo<b>Service</b>
        </div>
        <div className="as-nav__links">
          <a className="as-nav__a" href="#">Comment ça marche</a>
          <button className="as-btn as-btn--ghost">Connexion</button>
          <button className="as-burger" aria-label="Menu">&#9776;</button>
        </div>
      </nav>

      <div className="as-hero__content">
        <h1 className="as-h1">
          Trouvez l'artisan <span className="as-accent">idéal</span>, près de chez vous
        </h1>
        <p className="as-sub">
          Plombiers, électriciens, menuisiers et peintres de confiance — disponibles
          aujourd'hui, partout à Casablanca.
        </p>
        <div className="as-chips">
          {CATEGORIES.map((c) => (
            <button key={c.label} className="as-chip">
              {c.icon} {c.label}
            </button>
          ))}
        </div>

      </div>
      

      <div className="as-stats">
        {STATS.map((s) => (
          <Stat key={s.label} stat={s} />
        ))}
      </div>

      <div className="as-scroll-cue" aria-hidden="true">&#8675;</div>
    </section>
  );
}
