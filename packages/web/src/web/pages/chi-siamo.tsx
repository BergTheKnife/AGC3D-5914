export default function ChiSiamoPage() {
  return (
    <div className="pt-16">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="bg-[#111111] section-py-lg px-6">
        <div className="container-xl">
          <span className="label-eyebrow">Chi siamo</span>
          <h1 className="hero-headline text-white mt-1" style={{ maxWidth: "20ch" }}>
            Creatività, tecnologia<br />e passione per il dettaglio.
          </h1>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────── */}
      <section className="section-py bg-white px-6">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left: text */}
            <div>
              <h2 className="sub-headline text-[#111111] mb-7">AGC 3D Studios</h2>
              <div className="space-y-5 body-text">
                <p>
                  AGC 3D Studios è uno studio italiano dedicato alla stampa 3D e alla creazione di oggetti
                  personalizzati. Nasce dalla passione per la tecnologia additiva e dalla convinzione che
                  ogni idea meriti di prendere forma concreta.
                </p>
                <p>
                  Lavoriamo con privati, appassionati, collezionisti e piccole imprese che cercano qualcosa
                  di unico: un regalo speciale, un oggetto decorativo su misura, un gadget con la propria
                  identità, o una creazione tematica legata alle proprie passioni.
                </p>
                <p>
                  Il nostro processo parte sempre dall'ascolto. Ogni richiesta è diversa, ogni progetto è
                  trattato con cura individuale. Dalla fase di ideazione alla progettazione 3D, dalla scelta
                  dei materiali alla stampa finale, seguiamo ogni passo con attenzione.
                </p>
              </div>
            </div>

            {/* Right: process steps */}
            <div>
              <div className="bg-[#F8F8F8] p-8 lg:p-10">
                <h3 className="sub-headline text-[#111111] mb-8" style={{ fontSize: "1.25rem" }}>Il nostro processo</h3>
                <div className="space-y-6">
                  {[
                    { num: "01", title: "Ascolto",       desc: "Raccogliamo la tua idea, le tue esigenze e i tuoi gusti." },
                    { num: "02", title: "Progettazione", desc: "Traduciamo l'idea in un modello 3D preciso e dettagliato." },
                    { num: "03", title: "Stampa",        desc: "Utilizziamo materiali selezionati e tecnologie di stampa avanzate." },
                    { num: "04", title: "Finitura",      desc: "Ogni pezzo viene curato nei dettagli prima di essere consegnato." },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-5 items-start">
                      <span className="font-bold text-[#CC2222] text-xl w-9 shrink-0 leading-none pt-0.5">{step.num}</span>
                      <div>
                        <p className="font-semibold text-[#111111] text-sm mb-1">{step.title}</p>
                        <p className="caption-text leading-relaxed" style={{ maxWidth: "none" }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────── */}
      <section className="section-py bg-[#F8F8F8] px-6">
        <div className="container-xl">
          <div className="text-center mb-12 lg:mb-16">
            <span className="label-eyebrow">La nostra filosofia</span>
            <h2 className="section-headline text-[#111111]">I nostri valori</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "Personalizzazione",
                desc:  "Ogni oggetto può essere adattato al tuo gusto, colore, dimensione o testo. Nulla è standard se non lo vuoi.",
              },
              {
                title: "Qualità",
                desc:  "Materiali selezionati, stampe precise, finiture curate. La qualità non è negoziabile in nessun progetto.",
              },
              {
                title: "Creatività",
                desc:  "Ci piace spingere i confini di ciò che è possibile. Ogni idea è un'opportunità di creare qualcosa di unico.",
              },
            ].map((v) => (
              <div key={v.title} className="bg-white border border-[#E0E0E0] p-8 lg:p-10">
                <div className="w-1 h-8 bg-[#CC2222] mb-6" />
                <h3 className="font-bold text-[#111111] text-lg mb-3">{v.title}</h3>
                <p className="caption-text leading-relaxed" style={{ maxWidth: "none" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="section-py bg-[#111111] px-6">
        <div className="container-xl text-center">
          <h2 className="section-headline text-white mb-5 mx-auto" style={{ maxWidth: "18ch" }}>
            Hai un'idea? Parliamone.
          </h2>
          <p className="lead-text text-white/70 mx-auto mb-9" style={{ maxWidth: "50ch" }}>
            Contattaci per discutere il tuo progetto o per scoprire cosa possiamo realizzare per te.
          </p>
          <a href="/contatti" className="btn btn-primary">Contattaci</a>
        </div>
      </section>

    </div>
  );
}
