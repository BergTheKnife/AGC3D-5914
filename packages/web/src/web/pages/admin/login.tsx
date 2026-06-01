import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { authClient, captureToken, setRemember } from "../../lib/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRememberState] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Persist the preference BEFORE login so captureToken stores the token
    // in the correct storage (local vs session).
    setRemember(remember);
    try {
      const { error: err } = await authClient.signIn.email(
        { email, password },
        { onSuccess: captureToken }
      );
      if (err) {
        setError("Email o password non corretti");
      } else {
        navigate("/admin");
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col items-center text-center">

        {/* Logo grande senza sfondo */}
        <div className="mb-10 flex flex-col items-center">
          <img
            src="/login-logo.png"
            alt="AGC 3D Studios"
            className="w-48 h-48 object-contain mb-4"
          />
          <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs tracking-wider uppercase">
            Gestione Catalogo
          </p>
        </div>

        <div className="bg-white p-8 w-full text-center">
          <h1 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-2xl mb-6 text-center">Accedi</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2 text-left">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2 text-left">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#111111] transition-colors"
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Rimani connesso */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRememberState(e.target.checked)}
                className="w-4 h-4 accent-[#CC2222]"
              />
              <span className="font-['Glacial_Indifference'] text-sm text-[#555555]">
                Rimani connesso
              </span>
            </label>

            {error && (
              <p className="font-['Glacial_Indifference'] text-sm text-[#CC2222] bg-red-50 px-4 py-3 border border-red-100">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CC2222] hover:bg-[#AA1A1A] disabled:bg-[#9A9A9A] text-white font-['Glacial_Indifference'] font-semibold text-sm tracking-widest uppercase px-6 py-4 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Accesso...
                </>
              ) : "Entra"}
            </button>
          </form>
        </div>

        <p className="text-center font-['Glacial_Indifference'] text-[#555555] text-xs mt-6">
          <a href="/" className="hover:text-white transition-colors">← Torna al sito</a>
        </p>
      </div>
    </div>
  );
}
