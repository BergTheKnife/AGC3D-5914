import { useState } from "react";
import { useLocation } from "wouter";
import { authClient, captureToken } from "../../lib/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
            src="/logo-no-bg.svg"
            alt="AGC 3D Studios"
            className="w-48 h-48 object-contain mb-4"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs tracking-wider uppercase">
            Area Amministrazione
          </p>
        </div>

        <div className="bg-white p-8 w-full text-center">
          <h1 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-2xl mb-6 text-center">Accedi</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
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
              <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm"
                placeholder="••••••••"
              />
            </div>
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
