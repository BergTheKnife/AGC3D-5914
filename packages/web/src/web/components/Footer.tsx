import { Link } from "wouter";
import { Instagram, Phone, Mail } from "lucide-react";

export default function Footer() {
  const navLinks = [
    { href: "/",          label: "Home" },
    { href: "/chi-siamo", label: "Chi siamo" },
    { href: "/catalogo",  label: "Catalogo" },
    { href: "/contatti",  label: "Contatti" },
  ];

  const TikTokIcon = ({ className = "" }: { className?: string }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  );

  return (
    <footer className="bg-[#111111] text-white">

      {/* ── MOBILE (compact) ─────────────────────────────── */}
      <div className="md:hidden container-xl py-8">
        {/* Brand row */}
        <div className="flex items-center gap-2.5 mb-3">
          <img src="/footer-logo.png" alt="AGC 3D Studios" className="h-8 w-auto" />
          <span className="text-white text-sm font-semibold tracking-wide">AGC 3D Studios</span>
        </div>

        {/* One-line tagline */}
        <p className="text-[#9A9A9A] text-[13px] mb-5">Diamo forma alle tue idee.</p>

        {/* Navigation — 2 rows */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5 max-w-[260px]">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <span className="text-[#9A9A9A] hover:text-white text-[13px] transition-colors cursor-pointer">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Contacts — 2 rows */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-6 max-w-[280px]">
          <a href="tel:+393793414046" className="flex items-center gap-2 text-[#9A9A9A] hover:text-white text-[13px] transition-colors">
            <Phone size={12} className="text-[#CC2222] shrink-0" /> Telefono
          </a>
          <a href="mailto:agc3d@hotmail.com" className="flex items-center gap-2 text-[#9A9A9A] hover:text-white text-[13px] transition-colors">
            <Mail size={12} className="text-[#CC2222] shrink-0" /> Email
          </a>
          <a href="https://instagram.com/AGC.3D" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#9A9A9A] hover:text-white text-[13px] transition-colors">
            <Instagram size={12} className="text-[#CC2222] shrink-0" /> Instagram
          </a>
          <a href="https://tiktok.com/@agc3d" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#9A9A9A] hover:text-white text-[13px] transition-colors">
            <TikTokIcon className="text-[#CC2222] shrink-0" /> TikTok
          </a>
        </div>

        {/* Thin divider + copyright */}
        <div className="border-t border-[#2A2A2A] pt-4 flex items-center justify-between">
          <p className="text-[#555555] text-[11px]">© {new Date().getFullYear()} AGC 3D Studios</p>
          <Link to="/admin">
            <span className="text-[#444444] hover:text-[#9A9A9A] text-[11px] transition-colors cursor-pointer">Area Admin</span>
          </Link>
        </div>
      </div>

      {/* ── DESKTOP / TABLET (unchanged) ─────────────────── */}
      <div className="hidden md:block container-xl py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">

          {/* Brand */}
          <div>
            <div className="mb-5 -mt-6 md:-mt-10">
              <img src="/footer-logo.png" alt="AGC 3D Studios" className="h-32 lg:h-36 w-auto" />
            </div>
            <p className="text-[#9A9A9A] text-sm leading-relaxed" style={{ maxWidth: "32ch" }}>
              La creatività che prende forma.<br />
              Oggetti 3D personalizzati, creazioni su misura e idee regalo uniche.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#9A9A9A] mb-5">
              Navigazione
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/",          label: "Home" },
                { href: "/chi-siamo", label: "Chi siamo" },
                { href: "/catalogo",  label: "Catalogo" },
                { href: "/contatti",  label: "Contatti" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href}>
                    <span className="text-[#9A9A9A] hover:text-white text-sm transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#9A9A9A] mb-5">
              Contatti
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-[#9A9A9A] text-sm">
                <Phone size={13} className="text-[#CC2222] shrink-0" />
                <a href="tel:+393793414046" className="hover:text-white transition-colors">+39 379 34 14 046</a>
              </li>
              <li className="flex items-center gap-3 text-[#9A9A9A] text-sm">
                <Mail size={13} className="text-[#CC2222] shrink-0" />
                <a href="mailto:agc3d@hotmail.com" className="hover:text-white transition-colors">agc3d@hotmail.com</a>
              </li>
              <li className="flex items-center gap-3 text-[#9A9A9A] text-sm">
                <Instagram size={13} className="text-[#CC2222] shrink-0" />
                <a href="https://instagram.com/AGC.3D" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@AGC.3D</a>
              </li>
              <li className="flex items-center gap-3 text-[#9A9A9A] text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-[#CC2222] shrink-0">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
                <a href="https://tiktok.com/@agc3d" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@agc3d</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#2A2A2A] mt-12 pt-7 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#555555] text-xs">
            © {new Date().getFullYear()} AGC 3D Studios. Tutti i diritti riservati.
          </p>
          <Link to="/admin">
            <span className="text-[#444444] hover:text-[#9A9A9A] text-xs transition-colors cursor-pointer">
              Area Admin
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
