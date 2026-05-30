import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/",          label: "Home" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/catalogo",  label: "Catalogo" },
  { href: "/contatti",  label: "Contatti" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b border-[#E0E0E0] shadow-sm"
          : "bg-white/70 border-b border-transparent backdrop-blur-md"
      }`}
    >
      <div className="container-xl flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/">
          <div className="flex items-center cursor-pointer">
            <img src="/logo-full.png" alt="AGC 3D Studios" className="h-8 w-auto" />
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <span
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors cursor-pointer pb-0.5 ${
                  location === link.href
                    ? "text-[#111111] border-b border-[#CC2222]"
                    : "text-[#666666] hover:text-[#111111] border-b border-transparent"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#111111]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#E0E0E0] px-6 py-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <span
                className={`block text-xs font-semibold tracking-[0.18em] uppercase py-3 cursor-pointer border-b border-[#F0F0F0] last:border-0 ${
                  location === link.href ? "text-[#CC2222]" : "text-[#111111]"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
