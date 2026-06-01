import { useState, useRef } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./layout";
import { uploadImage } from "../../lib/upload";
import { stylizeImage } from "../../lib/stylize";
import {
  Upload,
  Loader2,
  Wand2,
  Download,
  RefreshCw,
  PackagePlus,
  X,
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";

const DEFAULT_PROMPT = `Agisci come un art director di product photography di fascia altissima e come un retoucher e-commerce luxury.

Prendi l'immagine che ho caricato e trasformala in una fotografia da catalogo premium, moderna, pulita, iper-definita e commercialmente perfetta, come se fosse stata scattata in studio con una fotocamera full frame top di gamma e ottiche professionali di altissimo livello.

OBIETTIVO:
Creare una rielaborazione super premium del prodotto, mantenendo però fedelmente ogni sua caratteristica reale. Il prodotto deve restare assolutamente riconoscibile e coerente con l'originale.

REGOLE FONDAMENTALI:
- Non alterare la forma del prodotto.
- Non cambiare proporzioni, silhouette, volumi, spessori o geometrie.
- Non semplificare né attenuare i dettagli fini.
- Mantieni perfettamente texture, trama superficiale, pattern, stratificazioni, micro-rilievi, giunzioni, bordi, finitura del materiale e ogni dettaglio visibile.
- Mantieni colori realistici e fedeli all'originale, migliorandone solo precisione, profondità e pulizia.
- Mantieni l'aspetto autentico del materiale stampato in 3D, senza farlo sembrare plastica generica o rendering CGI artificiale.
- Aumenta nitidezza e definizione solo in modo professionale, senza aloni, oversharpening o effetto finto.
- Non perdere dettagli nelle alte luci né nelle ombre.
- Mantieni una resa estremamente realistica, fotografica e non illustrativa.

LOOK DESIDERATO:
- Stile catalogo luxury / premium product photography.
- Qualità da campagna commerciale di brand design contemporaneo.
- Immagine molto pulita, elegante, sofisticata, moderna.
- Sensazione di scatto realizzato con attrezzatura fotografica top di gamma, illuminazione da studio controllata e post-produzione professionale.
- Profondità, tridimensionalità, contrasto raffinato, micro-contrasto accurato e separazione eccellente tra soggetto e sfondo.

LUCE E ATMOSFERA:
- Usa un'illuminazione morbida ma scolpente, con ombre controllate e transizioni graduali.
- Mantieni o ricrea uno sfondo premium con luce LED soffusa, coerente con il soggetto e con i colori presenti nell'immagine originale.
- L'effetto LED deve essere elegante, diffuso, moderno, mai eccessivo o pacchiano.
- Puoi variare il glow luminoso sullo sfondo in modo creativo, ma sempre in tono con il prodotto.
- Lo sfondo deve valorizzare il soggetto senza rubargli attenzione.
- Evita riflessi sporchi, dominanti casuali, flare invadenti o effetti speciali artificiosi.

RESA DEL PRODOTTO:
- Il soggetto deve essere il protagonista assoluto.
- Migliora leggibilità visiva, volume, presenza scenica e percezione premium.
- Evidenzia la qualità della superficie e la precisione della lavorazione.
- Fai emergere texture, colore, materiale e design con realismo estremo.
- Se presenti parti lucide, opache o satinate, differenziale correttamente.
- Se la foto mostra una superficie d'appoggio, rendila pulita, elegante e coerente con un set fotografico professionale.

COMPOSIZIONE:
- Mantieni inquadratura e posa del prodotto coerenti con l'originale, salvo piccoli miglioramenti eleganti.
- Correggi eventuali imperfezioni prospettiche o distrazioni visive.
- Migliora equilibrio, pulizia e centralità della composizione.
- Lascia una percezione da scatto editoriale di fascia alta, adatto a catalogo, e-commerce premium o ADV prodotto.

QUALITÀ FINALE:
- Ultra high definition.
- Dettaglio finissimo e realistico.
- Colori premium, puliti e ricchi.
- Nessun effetto cartoon, pittorico o CGI.
- Nessuna deformazione.
- Nessuna perdita di dettaglio.
- Nessun cambiamento arbitrario del design.

OUTPUT:
Genera una versione finale che sembri fotografata con una Sony A1 II o Canon EOS R5 Mark II o Nikon Z8, con ottica professionale macro/product photography, luce da studio di lusso e post-produzione high-end.

RIFERIMENTO VISIVO:
La resa finale deve sembrare ottenuta con una fotocamera flagship contemporanea, sensore full frame ad altissima risoluzione, nitidezza impeccabile, gamma tonale ricca, dettaglio microstrutturale elevatissimo e qualità ottica da lente professionale top tier.

TARGET ESTETICO:
Fotografia prodotto da catalogo di lusso, perfetta per e-commerce premium, scheda prodotto, advertising, hero image, social ADV e presentazione commerciale high-end.

Per lo sfondo, crea un'illuminazione LED soft e moderna, coerente con il prodotto e con l'immagine di partenza: glow diffuso, elegante, contemporaneo, con variazioni cromatiche raffinate e mai aggressive. Mantieni uno stile premium minimal, con atmosfera tecnologica e design-forward, simile a un set fotografico di alto livello.`;

interface Item {
  id: string;
  source: string; // original uploaded image url
  results: string[]; // history of generated versions (oldest -> newest)
  selected: number; // index of selected result in results[]
  status: "idle" | "processing" | "done" | "error";
  error?: string;
  // per-item repeat prompt UI
  repeatOpen: boolean;
  repeatPrompt: string;
}

async function downloadImage(url: string, name: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank");
  }
}

export default function Stilizzatore() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [useCustom, setUseCustom] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activePrompt = () => (useCustom ? prompt : undefined);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const newItems: Item[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          source: url,
          results: [],
          selected: 0,
          status: "idle",
          repeatOpen: false,
          repeatPrompt: "",
        });
      }
      setItems((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      setUploadError("Caricamento fallito: " + (err.message ?? "errore"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const patch = (id: string, p: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const processItem = async (id: string, customPrompt?: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    patch(id, { status: "processing", error: undefined });
    try {
      const out = await stylizeImage(item.source, customPrompt);
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                results: [...it.results, out],
                selected: it.results.length, // select newest
                status: "done",
                repeatOpen: false,
                repeatPrompt: "",
              }
            : it
        )
      );
    } catch (err: any) {
      patch(id, { status: "error", error: err.message ?? "Errore" });
    }
  };

  const processAll = async () => {
    const targets = items.filter((i) => i.status !== "processing");
    const cp = activePrompt();
    await Promise.allSettled(targets.map((i) => processItem(i.id, cp)));
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const loadToCatalog = (url: string) => {
    sessionStorage.setItem("prefillProductImage", url);
    navigate("/admin/prodotti/nuovo");
  };

  const anyIdle = items.some((i) => i.results.length === 0 && i.status !== "processing");
  const anyProcessing = items.some((i) => i.status === "processing");

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-2xl sm:text-3xl mb-2 flex items-center gap-3">
            <Wand2 className="text-[#CC2222]" size={28} />
            Stilizzatore immagini
          </h1>
          <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm">
            Carica le foto degli articoli e trasformale in scatti premium da catalogo con l'AI.
          </p>
        </div>

        {/* Prompt box */}
        <div className="bg-white border border-[#E0E0E0] mb-6">
          <button
            onClick={() => setPromptOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm">
              Prompt di elaborazione
              <span className="ml-2 font-normal text-[#9A9A9A]">
                {useCustom ? "(personalizzato)" : "(premium predefinito)"}
              </span>
            </span>
            {promptOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {promptOpen && (
            <div className="px-5 pb-5 border-t border-[#F0F0F0] pt-4">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="w-4 h-4 accent-[#CC2222]"
                />
                <span className="font-['Glacial_Indifference'] text-sm text-[#555555]">
                  Usa un prompt personalizzato (sostituisce quello predefinito)
                </span>
              </label>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!useCustom}
                rows={10}
                className={`w-full border border-[#E0E0E0] p-3 font-['Glacial_Indifference'] text-xs leading-relaxed resize-y focus:outline-none focus:border-[#111111] ${
                  useCustom ? "bg-white text-[#111111]" : "bg-[#F8F8F8] text-[#9A9A9A]"
                }`}
              />
              {useCustom && (
                <button
                  onClick={() => {
                    setPrompt(DEFAULT_PROMPT);
                  }}
                  className="mt-2 font-['Glacial_Indifference'] text-xs text-[#CC2222] hover:text-[#AA1A1A]"
                >
                  Ripristina prompt predefinito
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload zone */}
        <div className="mb-6">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-[#E0E0E0] hover:border-[#111111] transition-colors py-10 flex flex-col items-center justify-center gap-3 group"
          >
            {uploading ? (
              <Loader2 size={26} className="text-[#CC2222] animate-spin" />
            ) : (
              <Upload size={26} className="text-[#9A9A9A] group-hover:text-[#111111] transition-colors" />
            )}
            <span className="font-['Glacial_Indifference'] text-sm text-[#555555]">
              {uploading ? "Caricamento..." : "Carica una o più foto"}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          {uploadError && (
            <p className="font-['Glacial_Indifference'] text-sm text-[#CC2222] mt-2">{uploadError}</p>
          )}
        </div>

        {/* Process all */}
        {items.length > 0 && anyIdle && (
          <button
            onClick={processAll}
            disabled={anyProcessing}
            className="w-full sm:w-auto bg-[#CC2222] hover:bg-[#AA1A1A] disabled:opacity-60 text-white font-['Glacial_Indifference'] font-semibold text-sm tracking-widest uppercase px-8 py-4 flex items-center justify-center gap-2 mb-8 transition-colors"
          >
            {anyProcessing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {anyProcessing ? "Elaborazione in corso..." : `Elabora ${items.filter((i) => i.results.length === 0).length} foto`}
          </button>
        )}

        {/* Items grid */}
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[#E0E0E0] p-4 sm:p-5">
              <div className="flex items-start justify-between mb-4">
                <span className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A] uppercase tracking-wider">
                  {item.results.length > 0
                    ? `${item.results.length} ${item.results.length === 1 ? "versione" : "versioni"}`
                    : "Da elaborare"}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#9A9A9A] hover:text-[#CC2222] transition-colors"
                  aria-label="Rimuovi"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <p className="font-['Glacial_Indifference'] text-[10px] text-[#9A9A9A] uppercase tracking-wider mb-2">
                    Originale
                  </p>
                  <div className="aspect-square bg-[#F8F8F8] border border-[#F0F0F0] overflow-hidden">
                    <img src={item.source} alt="Originale" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Result */}
                <div>
                  <p className="font-['Glacial_Indifference'] text-[10px] text-[#9A9A9A] uppercase tracking-wider mb-2">
                    Risultato {item.status === "processing" && "(in elaborazione...)"}
                  </p>
                  <div className="aspect-square bg-[#F8F8F8] border border-[#F0F0F0] overflow-hidden flex items-center justify-center relative">
                    {item.status === "processing" ? (
                      <div className="flex flex-col items-center gap-2 text-[#9A9A9A]">
                        <Loader2 size={28} className="animate-spin text-[#CC2222]" />
                        <span className="font-['Glacial_Indifference'] text-xs">Elaborazione...</span>
                      </div>
                    ) : item.results.length > 0 ? (
                      <img
                        src={item.results[item.selected]}
                        alt="Risultato"
                        className="w-full h-full object-contain"
                      />
                    ) : item.status === "error" ? (
                      <div className="text-center px-4">
                        <p className="font-['Glacial_Indifference'] text-xs text-[#CC2222]">{item.error}</p>
                        <button
                          onClick={() => processItem(item.id, activePrompt())}
                          className="mt-2 font-['Glacial_Indifference'] text-xs text-[#111111] underline"
                        >
                          Riprova
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#D0D0D0]">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* History thumbnails (for comparison) */}
              {item.results.length > 1 && (
                <div className="mt-4">
                  <p className="font-['Glacial_Indifference'] text-[10px] text-[#9A9A9A] uppercase tracking-wider mb-2">
                    Tentativi — clicca per confrontare
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {item.results.map((r, i) => (
                      <button
                        key={r}
                        onClick={() => patch(item.id, { selected: i })}
                        className={`relative w-16 h-16 shrink-0 overflow-hidden border-2 transition-colors ${
                          i === item.selected ? "border-[#CC2222]" : "border-transparent hover:border-[#E0E0E0]"
                        }`}
                      >
                        <img src={r} alt={`v${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 font-['Glacial_Indifference']">
                          v{i + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {item.results.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() =>
                        downloadImage(item.results[item.selected], `agc3d-premium-v${item.selected + 1}.png`)
                      }
                      className="flex-1 bg-[#111111] hover:bg-[#2A2A2A] text-white font-['Glacial_Indifference'] font-semibold text-xs tracking-widest uppercase px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={15} /> Scarica
                    </button>
                    <button
                      onClick={() => patch(item.id, { repeatOpen: !item.repeatOpen })}
                      className="flex-1 border border-[#E0E0E0] hover:border-[#111111] text-[#111111] font-['Glacial_Indifference'] font-semibold text-xs tracking-widest uppercase px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                    >
                      <RefreshCw size={15} /> Ripeti elaborazione
                    </button>
                    <button
                      onClick={() => loadToCatalog(item.results[item.selected])}
                      className="flex-1 bg-[#CC2222] hover:bg-[#AA1A1A] text-white font-['Glacial_Indifference'] font-semibold text-xs tracking-widest uppercase px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                    >
                      <PackagePlus size={15} /> Carica in catalogo
                    </button>
                  </div>

                  {/* Repeat prompt panel */}
                  {item.repeatOpen && (
                    <div className="bg-[#F8F8F8] border border-[#F0F0F0] p-3">
                      <p className="font-['Glacial_Indifference'] text-xs text-[#555555] mb-2">
                        Nuovo prompt per questa elaborazione (lascia vuoto per riusare quello predefinito):
                      </p>
                      <textarea
                        value={item.repeatPrompt}
                        onChange={(e) => patch(item.id, { repeatPrompt: e.target.value })}
                        rows={4}
                        placeholder="Scrivi un nuovo prompt..."
                        className="w-full border border-[#E0E0E0] p-2 font-['Glacial_Indifference'] text-xs resize-y focus:outline-none focus:border-[#111111] mb-2"
                      />
                      <button
                        onClick={() =>
                          processItem(item.id, item.repeatPrompt.trim() ? item.repeatPrompt : activePrompt())
                        }
                        disabled={item.status === "processing"}
                        className="bg-[#111111] hover:bg-[#2A2A2A] disabled:opacity-60 text-white font-['Glacial_Indifference'] font-semibold text-xs tracking-widest uppercase px-5 py-2.5 flex items-center gap-2 transition-colors"
                      >
                        {item.status === "processing" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Wand2 size={14} />
                        )}
                        Rielabora
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Single process button if not yet processed */}
              {item.results.length === 0 && item.status !== "processing" && (
                <button
                  onClick={() => processItem(item.id, activePrompt())}
                  className="mt-4 w-full sm:w-auto border border-[#E0E0E0] hover:border-[#111111] text-[#111111] font-['Glacial_Indifference'] font-semibold text-xs tracking-widest uppercase px-6 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <Wand2 size={15} /> Elabora questa foto
                </button>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16 text-[#D0D0D0]">
            <ImageIcon size={48} className="mx-auto mb-4" />
            <p className="font-['Glacial_Indifference'] text-sm text-[#9A9A9A]">
              Nessuna foto caricata. Inizia caricando le immagini dei tuoi articoli.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
