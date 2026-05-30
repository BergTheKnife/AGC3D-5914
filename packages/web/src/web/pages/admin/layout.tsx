import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { authClient, clearToken } from "../../lib/auth";
import { Package, Tag, Home, LogOut, Menu, X, ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <Home size={18} /> },
  { href: "/admin/prodotti", label: "Prodotti", icon: <Package size={18} /> },
  { href: "/admin/categorie", label: "Categorie", icon: <Tag size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    clearToken();
    qc.clear();
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <img src="/logo-no-bg.svg" alt="AGC 3D Studios" className="h-10 w-10 object-contain" />
          <div>
            <p className="font-['Glacial_Indifference'] font-bold text-[#111111] text-xs tracking-[0.15em] uppercase">AGC 3D</p>
            <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-[10px] uppercase tracking-wider">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link to={item.href}>
                <span
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 font-['Glacial_Indifference'] text-sm font-medium cursor-pointer transition-colors rounded-none ${
                    location === item.href
                      ? "bg-[#111111] text-white"
                      : "text-[#555555] hover:bg-[#F8F8F8] hover:text-[#111111]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom links */}
      <div className="p-3 border-t border-[#E0E0E0] space-y-1">
        <a href="/" target="_blank" rel="noopener noreferrer">
          <span className="flex items-center gap-3 px-4 py-3.5 font-['Glacial_Indifference'] text-sm text-[#9A9A9A] hover:text-[#111111] cursor-pointer transition-colors">
            <ExternalLink size={18} />
            Vedi sito
          </span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 font-['Glacial_Indifference'] text-sm text-[#9A9A9A] hover:text-[#CC2222] cursor-pointer transition-colors"
        >
          <LogOut size={18} />
          Esci
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-[#E0E0E0] fixed top-0 bottom-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-white border-r border-[#E0E0E0] h-full">
            <button
              className="absolute top-4 right-4 p-2 hover:bg-[#F0F0F0] transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} className="text-[#555555]" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-[#E0E0E0] px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-[#F0F0F0] transition-colors -ml-1"
          >
            <Menu size={22} className="text-[#111111]" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <img src="/logo-no-bg.svg" alt="AGC 3D Studios" className="h-7 w-7 object-contain" />
            <span className="font-['Glacial_Indifference'] font-bold text-[#111111] text-xs tracking-[0.15em] uppercase">
              AGC 3D Admin
            </span>
          </div>
          {/* Torna al sito — mobile topbar */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-['Glacial_Indifference'] text-xs text-[#9A9A9A] hover:text-[#CC2222] transition-colors shrink-0"
          >
            <ExternalLink size={14} />
            <span className="hidden xs:inline">Sito</span>
          </a>
        </div>

        {/* Action bar: Torna indietro + Torna al sito */}
        <div className="bg-white border-b border-[#E0E0E0] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 font-['Glacial_Indifference'] text-sm text-[#555555] hover:text-[#111111] transition-colors cursor-pointer min-h-[36px] px-2 -ml-2 hover:bg-[#F8F8F8]"
          >
            <ArrowLeft size={16} />
            <span>Torna indietro</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-['Glacial_Indifference'] text-sm text-[#555555] hover:text-[#CC2222] transition-colors min-h-[36px] px-2 -mr-2 hover:bg-[#F8F8F8]"
          >
            <ExternalLink size={14} />
            <span>Torna al sito</span>
          </a>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
