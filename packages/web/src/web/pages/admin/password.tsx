import { useState } from "react";
import AdminLayout from "./layout";
import { authClient } from "../../lib/auth";
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder ?? "••••••••"}
          className="w-full px-4 py-3 pr-12 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#111111] transition-colors"
          aria-label={show ? "Nascondi password" : "Mostra password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function CambiaPassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (next.length < 8) {
      setError("La nuova password deve avere almeno 8 caratteri.");
      return;
    }
    if (next !== confirm) {
      setError("Le due password non coincidono.");
      return;
    }
    if (next === current) {
      setError("La nuova password deve essere diversa da quella attuale.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: signOutOthers,
      });
      if (err) {
        setError(
          err.message?.toLowerCase().includes("password")
            ? "La password attuale non è corretta."
            : "Impossibile cambiare la password. Riprova."
        );
      } else {
        setSuccess(true);
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-2xl sm:text-3xl mb-2 flex items-center gap-3">
            <KeyRound className="text-[#CC2222]" size={26} />
            Cambia password
          </h1>
          <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm">
            Aggiorna la password del tuo account amministratore.
          </p>
        </div>

        <div className="bg-white border border-[#E0E0E0] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField label="Password attuale" value={current} onChange={setCurrent} />
            <PasswordField
              label="Nuova password"
              value={next}
              onChange={setNext}
              placeholder="Almeno 8 caratteri"
            />
            <PasswordField label="Conferma nuova password" value={confirm} onChange={setConfirm} />

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={signOutOthers}
                onChange={(e) => setSignOutOthers(e.target.checked)}
                className="w-4 h-4 accent-[#CC2222]"
              />
              <span className="font-['Glacial_Indifference'] text-sm text-[#555555]">
                Disconnetti gli altri dispositivi
              </span>
            </label>

            {error && (
              <p className="font-['Glacial_Indifference'] text-sm text-[#CC2222] bg-red-50 px-4 py-3 border border-red-100">
                {error}
              </p>
            )}
            {success && (
              <p className="font-['Glacial_Indifference'] text-sm text-[#1A7A3A] bg-green-50 px-4 py-3 border border-green-100 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Password aggiornata con successo.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CC2222] hover:bg-[#AA1A1A] disabled:bg-[#9A9A9A] text-white font-['Glacial_Indifference'] font-semibold text-sm tracking-widest uppercase px-6 py-4 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                "Aggiorna password"
              )}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
