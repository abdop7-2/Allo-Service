import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const HOW_IT_WORKS = [
  {
    icon: "🔍",
    title: "Décrivez votre besoin",
    desc: "Publiez votre demande en quelques secondes : type de travaux, budget, date souhaitée.",
  },
  {
    icon: "📩",
    title: "Recevez des offres",
    desc: "Des prestataires qualifiés près de chez vous vous envoient leurs devis directement.",
  },
  {
    icon: "✅",
    title: "Choisissez & confirmez",
    desc: "Comparez les profils, les notes et les prix, puis acceptez l'offre qui vous convient.",
  },
  {
    icon: "⭐",
    title: "Évaluez le service",
    desc: "Une fois la mission terminée, laissez un avis pour aider la communauté.",
  },
];

function useCountUp(target, { decimals = 0, prefix = "", suffix = "", sep = false } = {}) {
  const [display, setDisplay] = useState(prefix + (decimals ? (0).toFixed(decimals) : "0") + suffix);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (v) => {
      let s = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
      if (sep) s = Number(s).toLocaleString("fr-FR");
      return prefix + s + suffix;
    };
    if (prefersReduced) { setDisplay(fmt(target)); return; }
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
  const howItWorksRef = useRef(null);
  const navigate = useNavigate();

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

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ── Hero ── */}
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
          <div className="as-logo">Allo<b>Service</b></div>
          <div className="as-nav__links">
            <a className="as-nav__a" href="#comment-ca-marche" onClick={scrollToHowItWorks}>
              Comment ça marche
            </a>
            <button className="as-btn as-btn--ghost" onClick={() => navigate("/login")}>
              Connexion
            </button>
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
              <button key={c.label} className="as-chip">{c.label}</button>
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

      {/* ── Comment ça marche ── */}
      <section
        id="comment-ca-marche"
        ref={howItWorksRef}
        className="as-section"
        style={{ background: "linear-gradient(180deg, #08372a 0%, #0d1e3a 100%)" }}
      >
        <h2 className="as-title">Comment ça marche ?</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.75)", maxWidth: "58ch", margin: "0 auto 40px", fontSize: "clamp(14px,2.5vw,17px)", lineHeight: 1.6 }}>
          AlloService met en relation des clients avec des prestataires de confiance en quelques clics.
          Que vous ayez besoin d'un plombier, d'un électricien ou d'un peintre, trouvez le bon
          professionnel près de chez vous et suivez votre mission de bout en bout.
        </p>
        <div className="as-grid">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="as-card">
              <div className="as-icon">{step.icon}</div>
              <h3 style={{ color: "#fff", marginBottom: 10, fontSize: "clamp(15px,2.5vw,17px)" }}>
                {step.title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(13px,2vw,15px)", lineHeight: 1.55, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <button
            className="as-btn as-btn--solid"
            style={{ fontSize: 15, padding: "13px 36px" }}
            onClick={() => navigate("/login")}
          >
            Commencer maintenant
          </button>
        </div>
      </section>
    </>
  );
}
