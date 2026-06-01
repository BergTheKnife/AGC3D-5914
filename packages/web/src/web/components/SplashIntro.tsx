import { useEffect, useState } from "react";
import { useLocation } from "wouter";

/**
 * SplashIntro — full-screen brand intro shown once per browser session.
 * Purely visual: animates the AGC 3D Studios logo in, then an "Entra" button
 * fades the overlay away to reveal the site. Skippable by clicking anywhere.
 * Does not affect routing — it's an overlay over the existing app.
 */
export default function SplashIntro() {
  const [location] = useLocation();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Never show the intro inside the admin area.
    if (location.startsWith("/admin")) return;
    // Show only if not already seen this session.
    try {
      if (!sessionStorage.getItem("agc_intro_seen")) {
        setShow(true);
        document.body.style.overflow = "hidden";
      }
    } catch {
      setShow(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enter = () => {
    setLeaving(true);
    try {
      sessionStorage.setItem("agc_intro_seen", "1");
    } catch {
      /* ignore */
    }
    // Remove from DOM after fade-out completes.
    window.setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 600);
  };

  if (!show) return null;

  return (
    <div
      onClick={enter}
      role="button"
      aria-label="Entra nel sito"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#111111] cursor-pointer transition-opacity duration-[600ms] ease-out ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle radial glow for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient( circle at 50% 45%, rgba(204,34,34,0.10), transparent 60% )",
        }}
      />

      {/* Logo */}
      <img
        src="/footer-logo.png"
        alt="AGC 3D Studios"
        className="relative w-80 sm:w-96 lg:w-[30rem] h-auto object-contain splash-logo"
      />

      {/* Thin accent divider */}
      <div className="relative mt-2 mb-8 h-px w-16 bg-[#CC2222] splash-line" />

      {/* Enter button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          enter();
        }}
        className="relative splash-cta font-['Glacial_Indifference'] font-semibold text-sm tracking-[0.22em] uppercase text-white bg-[#CC2222] hover:bg-[#AA1A1A] px-10 py-4 transition-colors"
      >
        Entra
      </button>
    </div>
  );
}
