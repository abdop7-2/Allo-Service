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

/* ── Line icons for the steps (inherit color via currentColor) ── */
const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const IconDescribe = () => (
  <Icon><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></Icon>
);
const IconOffers = () => (
  <Icon><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 6.5 9 6 9-6" /></Icon>
);
const IconChoose = () => (
  <Icon><path d="M15 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="m15.5 11 2 2 4-4" /></Icon>
);
const IconReview = () => (
  <Icon>
    <path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    <path d="m12.2 6.7 1.15 2.35 2.6.38-1.88 1.83.44 2.58-2.31-1.22-2.32 1.22.45-2.58-1.88-1.83 2.6-.38z"
          fill="currentColor" stroke="none" />
  </Icon>
);

const HOW_IT_WORKS = [
  {
    n: 1,
    icon: IconDescribe,
    title: "Décrivez votre besoin",
    points: [
      "Publiez votre demande en quelques secondes.",
      "Indiquez le type de travaux (plomberie, électricité, peinture, etc.).",
      "Précisez votre budget et la date souhaitée.",
      "Ajoutez des détails ou des photos si besoin.",
    ],
  },
  {
    n: 2,
    icon: IconOffers,
    title: "Recevez des offres",
    points: [
      "Des prestataires qualifiés près de chez vous voient votre demande.",
      "Ils vous envoient leurs devis directement via la plateforme.",
      "Comparez les offres reçues en toute transparence.",
    ],
  },
  {
    n: 3,
    icon: IconChoose,
    title: "Choisissez & confirmez",
    points: [
      "Comparez les profils, les notes, les avis et les prix.",
      "Échangez avec les prestataires si besoin.",
      "Choisissez l'offre qui vous convient et confirmez la mission.",
    ],
  },
  {
    n: 4,
    icon: IconReview,
    title: "Évaluez le service",
    points: [
      "Une fois la mission terminée, laissez un avis pour aider la communauté.",
      "Notez la qualité du travail, le respect des délais et le professionnalisme.",
      "Votre avis aide d'autres utilisateurs à faire le bon choix.",
    ],
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
          {HOW_IT_WORKS.map((step) => {
            const StepIcon = step.icon;
            return (
              <div key={step.n} className="as-step">
                <div className="as-step__head">
                  <span className="as-step__num">{step.n}</span>
                  <span className="as-step__icon"><StepIcon /></span>
                </div>
                <h3 className="as-step__title">{step.title}</h3>
                <ul className="as-step__list">
                  {step.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            );
          })}
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
