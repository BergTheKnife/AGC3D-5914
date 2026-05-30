import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Phone, Mail, Instagram, CheckCircle } from "lucide-react";

export default function ContattiPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefono: "",
    messaggio: "",
    tipoRichiesta: "info",
  });
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.contact.$post({ json: data });
      const json = await res.json();
      if (!res.ok) throw new Error((json as any).message ?? "Errore");
      return json;
    },
    onSuccess: () => {
      setSent(true);
      setForm({ nome: "", email: "", telefono: "", messaggio: "", tipoRichiesta: "info" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const inputCls = "w-full px-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none text-sm bg-white font-[inherit] transition-colors";
  const labelCls = "block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A9A9A] mb-2";

  return (
    <div className="pt-16">

      {/* ── HEADER ─────────────────────────────────────── */}
      <section className="bg-[#111111] section-py px-6">
        <div className="container-xl">
          <span className="label-eyebrow">Scrivici</span>
          <h1 className="hero-headline text-white mt-1">Contatti</h1>
        </div>
      </section>

      {/* ── CONTENT ────────────────────────────────────── */}
      <section className="section-py bg-white px-6">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* ── Info ── */}
            <div>
              <h2 className="sub-headline text-[#111111] mb-4" style={{ maxWidth: "22ch" }}>
                Parliamo del tuo progetto.
              </h2>
              <p className="body-text mb-10" style={{ maxWidth: "52ch" }}>
                Hai un'idea da realizzare? Vuoi sapere di più sui nostri prodotti? Contattaci
                per ricevere informazioni o per richiedere una creazione personalizzata.
              </p>

              <ul className="space-y-5 mb-12">
                {[
                  { icon: <Phone size={15} />, label: "Telefono", value: "+39 379 34 14 046", href: "tel:+393793414046" },
                  { icon: <Mail size={15} />,  label: "Email",    value: "agc3d@hotmail.com",  href: "mailto:agc3d@hotmail.com" },
                  { icon: <Instagram size={15} />, label: "Instagram", value: "@AGC.3D", href: "https://instagram.com/AGC.3D" },
                  {
                    icon: (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                      </svg>
                    ),
                    label: "TikTok", value: "@agc3d", href: "https://tiktok.com/@agc3d",
                  },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#F8F8F8] border border-[#E0E0E0] flex items-center justify-center shrink-0 text-[#CC2222]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A9A9A] mb-0.5">{item.label}</p>
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="font-medium text-[#111111] hover:text-[#CC2222] transition-colors text-sm"
                      >
                        {item.value}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="bg-[#F8F8F8] border-l-4 border-[#CC2222] p-6">
                <p className="font-semibold text-[#111111] text-[0.9375rem] mb-2">Hai bisogno di qualcosa di speciale?</p>
                <p className="caption-text leading-relaxed" style={{ maxWidth: "none" }}>
                  Realizziamo creazioni completamente personalizzate su richiesta.
                  Condividi la tua idea e troveremo insieme la soluzione perfetta.
                </p>
              </div>
            </div>

            {/* ── Form ── */}
            <div>
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle size={44} className="text-[#CC2222] mb-6" />
                  <h3 className="sub-headline text-[#111111] mb-3">Messaggio inviato!</h3>
                  <p className="body-text mx-auto mb-7" style={{ maxWidth: "38ch" }}>
                    Grazie per averci contattato. Ti risponderemo il prima possibile.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm font-semibold tracking-wider uppercase text-[#111111] border-b border-[#111111] hover:text-[#CC2222] hover:border-[#CC2222] transition-colors pb-0.5"
                  >
                    Invia un altro messaggio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className={labelCls}>Nome e cognome *</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      className={inputCls}
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className={inputCls}
                      placeholder="La tua email"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Telefono</label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className={inputCls}
                      placeholder="+39..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tipo di richiesta</label>
                    <div className="flex gap-3">
                      {[
                        { value: "info",             label: "Informazioni" },
                        { value: "personalizzazione", label: "Personalizzazione" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, tipoRichiesta: opt.value })}
                          className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border transition-colors ${
                            form.tipoRichiesta === opt.value
                              ? "bg-[#111111] text-white border-[#111111]"
                              : "bg-white text-[#555555] border-[#E0E0E0] hover:border-[#111111]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Messaggio *</label>
                    <textarea
                      value={form.messaggio}
                      onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
                      required
                      rows={5}
                      className={`${inputCls} resize-none`}
                      placeholder="Descrivi la tua richiesta..."
                    />
                  </div>
                  {mutation.isError && (
                    <p className="text-sm text-[#CC2222]">Errore nell'invio. Riprova o contattaci via email.</p>
                  )}
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-[#CC2222] hover:bg-[#AA1A1A] disabled:bg-[#9A9A9A] text-white font-semibold text-xs tracking-widest uppercase px-6 py-4 transition-colors flex items-center justify-center gap-2"
                  >
                    {mutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Invio in corso...
                      </>
                    ) : "Invia messaggio"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
