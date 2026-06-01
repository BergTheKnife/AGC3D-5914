import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { uploadImage } from "../../lib/upload";
import { parseList } from "../../lib/parse";
import AdminLayout from "./layout";
import { ArrowLeft, Plus, X, Upload, Loader2, Save, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductForm {
  nome: string;
  categoriaId: string;
  prezzo: string;
  colori: string[];
  coloriArticolo: string[];
  materiali: string;
  larghezza: string;
  altezza: string;
  profondita: string;
  descrizioneBreve: string;
  descrizioneCompleta: string;
  personalizzabile: boolean;
  inEvidenza: boolean;
  immagini: string[];
}

const DEFAULT_FORM: ProductForm = {
  nome: "",
  categoriaId: "",
  prezzo: "",
  colori: [],
  coloriArticolo: [],
  materiali: "",
  larghezza: "",
  altezza: "",
  profondita: "",
  descrizioneBreve: "",
  descrizioneCompleta: "",
  personalizzabile: false,
  inEvidenza: false,
  immagini: [],
};

function parseImages(p: any): string[] {
  const out: string[] = parseList(p.immagini);
  // legacy single image
  const single = p.immagineUrl ?? p.immagine_url;
  if (single && !out.includes(single)) out.unshift(single);
  return out;
}

/* ---------- Fullscreen lightbox ---------- */
function Lightbox({
  images,
  index,
  onClose,
  onNav,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onNav]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-10"
        aria-label="Chiudi"
      >
        <X size={28} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav((index - 1 + images.length) % images.length); }}
            className="absolute left-2 sm:left-6 p-2 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full z-10"
            aria-label="Precedente"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav((index + 1) % images.length); }}
            className="absolute right-2 sm:right-6 p-2 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full z-10"
            aria-label="Successiva"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={`Immagine ${index + 1}`}
        className="max-w-[92vw] max-h-[88vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onNav(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProdottiForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const isNew = !params.id || params.id === "nuovo";
  const productId = isNew ? null : params.id;

  const [form, setForm] = useState<ProductForm>(() => {
    // Pre-fill image coming from the AI Stylizer ("Carica in catalogo")
    if (isNew && typeof window !== "undefined") {
      const pre = sessionStorage.getItem("prefillProductImage");
      if (pre) {
        sessionStorage.removeItem("prefillProductImage");
        return { ...DEFAULT_FORM, immagini: [pre] };
      }
    }
    return DEFAULT_FORM;
  });
  const [colorInput, setColorInput] = useState("");
  const [articleColorInput, setArticleColorInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load categories
  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });
  const categories = (catsData as any)?.categories ?? [];

  // Load product if editing — uses the literal ":id" route with param
  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await api.products[":id"].$get({ param: { id: productId! } });
      return res.json();
    },
    enabled: !!productId,
  });

  useEffect(() => {
    const p = (productData as any)?.product;
    if (p) {
      setForm({
        nome: p.nome ?? "",
        categoriaId: p.categoriaId != null ? String(p.categoriaId) : "",
        prezzo: p.prezzo != null ? String(p.prezzo) : "",
        colori: parseList(p.colori),
        coloriArticolo: parseList(p.coloriArticolo),
        materiali: p.materiali ?? "",
        larghezza: p.larghezza != null ? String(p.larghezza) : "",
        altezza: p.altezza != null ? String(p.altezza) : "",
        profondita: p.profondita != null ? String(p.profondita) : "",
        descrizioneBreve: p.descrizioneBreve ?? "",
        descrizioneCompleta: p.descrizioneCompleta ?? "",
        personalizzabile: !!p.personalizzabile,
        inEvidenza: !!p.inEvidenza,
        immagini: parseImages(p),
      });
    }
  }, [productData]);

  // Create
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.products.$post({ json: data });
      if (!res.ok) {
        const body = (await res.json()) as any;
        throw new Error(body.message ?? body.error ?? "Errore durante la creazione");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/prodotti");
    },
    onError: (err: any) => setError(err.message),
  });

  // Update — backend uses PUT on /:id
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.products[":id"].$put({ param: { id: productId! }, json: data });
      if (!res.ok) {
        const body = (await res.json()) as any;
        throw new Error(body.message ?? body.error ?? "Errore durante il salvataggio");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
      navigate("/admin/prodotti");
    },
    onError: (err: any) => setError(err.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      setForm((f) => ({ ...f, immagini: [...f.immagini, ...urls] }));
    } catch (err: any) {
      setUploadError("Upload fallito: " + (err.message ?? "errore sconosciuto"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, immagini: f.immagini.filter((x) => x !== url) }));
  };

  const moveImage = (from: number, to: number) => {
    setForm((f) => {
      if (to < 0 || to >= f.immagini.length) return f;
      const arr = [...f.immagini];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return { ...f, immagini: arr };
    });
  };

  const addColor = () => {
    const c = colorInput.trim();
    if (c && !form.colori.includes(c)) {
      setForm((f) => ({ ...f, colori: [...f.colori, c] }));
    }
    setColorInput("");
  };

  const removeColor = (c: string) => {
    setForm((f) => ({ ...f, colori: f.colori.filter((x) => x !== c) }));
  };

  const addArticleColor = () => {
    const c = articleColorInput.trim();
    if (c && !form.coloriArticolo.includes(c)) {
      setForm((f) => ({ ...f, coloriArticolo: [...f.coloriArticolo, c] }));
    }
    setArticleColorInput("");
  };

  const removeArticleColor = (c: string) => {
    setForm((f) => ({ ...f, coloriArticolo: f.coloriArticolo.filter((x) => x !== c) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.nome.trim()) {
      setError("Il nome è obbligatorio");
      return;
    }
    const payload: Record<string, any> = {
      nome: form.nome.trim(),
      colori: JSON.stringify(form.colori),
      coloriArticolo: JSON.stringify(form.coloriArticolo),
      materiali: form.materiali || null,
      larghezza: form.larghezza !== "" ? parseFloat(form.larghezza) : null,
      altezza: form.altezza !== "" ? parseFloat(form.altezza) : null,
      profondita: form.profondita !== "" ? parseFloat(form.profondita) : null,
      descrizioneBreve: form.descrizioneBreve || null,
      descrizioneCompleta: form.descrizioneCompleta || null,
      personalizzabile: form.personalizzabile,
      inEvidenza: form.inEvidenza,
      immagineUrl: form.immagini[0] ?? null, // keep legacy field = cover
      immagini: JSON.stringify(form.immagini),
    };
    if (form.categoriaId) payload.categoriaId = parseInt(form.categoriaId);
    if (form.prezzo !== "") payload.prezzo = parseFloat(form.prezzo);

    if (isNew) createMutation.mutate(payload);
    else updateMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isNew && loadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-[#9A9A9A]" size={28} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/prodotti")}
            className="p-2 hover:bg-[#F0F0F0] transition-colors shrink-0"
            aria-label="Indietro"
          >
            <ArrowLeft size={18} className="text-[#555555]" />
          </button>
          <div>
            <h1 className="font-['Glacial_Indifference'] font-bold text-xl sm:text-2xl text-[#111111]">
              {isNew ? "Nuovo Prodotto" : "Modifica Prodotto"}
            </h1>
            <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mt-0.5">
              {isNew ? "Aggiungi un nuovo prodotto al catalogo" : "Modifica le informazioni del prodotto"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-['Glacial_Indifference'] text-sm">
              {error}
            </div>
          )}

          {/* Info base */}
          <div className="bg-white border border-[#E0E0E0] p-5 sm:p-6 space-y-5">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">
              Informazioni Base
            </h2>
            <div>
              <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">
                Nome <span className="text-[#CC2222]">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="es. Vaso Geometrico"
                className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">Categoria</label>
                <select
                  value={form.categoriaId}
                  onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
                  className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors bg-white"
                >
                  <option value="">Nessuna categoria</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">Prezzo (€)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.prezzo}
                  onChange={(e) => setForm((f) => ({ ...f, prezzo: e.target.value }))}
                  placeholder="es. 29.90"
                  className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">Materiale</label>
              <input
                type="text"
                value={form.materiali}
                onChange={(e) => setForm((f) => ({ ...f, materiali: e.target.value }))}
                placeholder="es. PLA, Resina"
                className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>
            <div>
              <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">Dimensioni (cm)</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  ["larghezza", "Larghezza"],
                  ["altezza", "Altezza"],
                  ["profondita", "Profondità"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <div className="relative">
                      <input
                        type="number" min="0" step="0.1"
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder="0"
                        className="w-full border border-[#E0E0E0] pl-4 pr-9 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-['Glacial_Indifference'] text-xs text-[#9A9A9A] pointer-events-none">cm</span>
                    </div>
                    <p className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Descrizioni */}
          <div className="bg-white border border-[#E0E0E0] p-5 sm:p-6 space-y-5">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">Descrizioni</h2>
            <div>
              <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">Descrizione Breve</label>
              <input
                type="text"
                value={form.descrizioneBreve}
                onChange={(e) => setForm((f) => ({ ...f, descrizioneBreve: e.target.value }))}
                placeholder="Breve descrizione per le card catalogo"
                className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>
            <div>
              <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">Descrizione Completa</label>
              <textarea
                value={form.descrizioneCompleta}
                onChange={(e) => setForm((f) => ({ ...f, descrizioneCompleta: e.target.value }))}
                rows={5}
                placeholder="Descrizione dettagliata del prodotto..."
                className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Colori articolo */}
          <div className="bg-white border border-[#E0E0E0] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">Colori Articolo</h2>
              <p className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A] mt-0.5">Colori effettivi dell'articolo</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={articleColorInput}
                onChange={(e) => setArticleColorInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArticleColor(); } }}
                placeholder="es. Nero, Oro..."
                className="flex-1 border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
              <button
                type="button"
                onClick={addArticleColor}
                className="px-4 py-2.5 bg-[#111111] text-white font-['Glacial_Indifference'] text-sm flex items-center gap-1.5 hover:bg-[#333333] transition-colors shrink-0"
              >
                <Plus size={14} /> Aggiungi
              </button>
            </div>
            {form.coloriArticolo.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.coloriArticolo.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F0F0] font-['Glacial_Indifference'] text-sm text-[#333333]">
                    {c}
                    <button type="button" onClick={() => removeArticleColor(c)} className="text-[#9A9A9A] hover:text-[#CC2222] transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Colori disponibili (su richiesta) */}
          <div className="bg-white border border-[#E0E0E0] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">Colori Disponibili</h2>
              <p className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A] mt-0.5">Colori aggiuntivi disponibili su richiesta</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
                placeholder="es. Rosso, Bianco..."
                className="flex-1 border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
              <button
                type="button"
                onClick={addColor}
                className="px-4 py-2.5 bg-[#111111] text-white font-['Glacial_Indifference'] text-sm flex items-center gap-1.5 hover:bg-[#333333] transition-colors shrink-0"
              >
                <Plus size={14} /> Aggiungi
              </button>
            </div>
            {form.colori.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.colori.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F0F0] font-['Glacial_Indifference'] text-sm text-[#333333]">
                    {c}
                    <button type="button" onClick={() => removeColor(c)} className="text-[#9A9A9A] hover:text-[#CC2222] transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Immagini — multi upload + lightbox */}
          <div className="bg-white border border-[#E0E0E0] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">
                Immagini
              </h2>
              {form.immagini.length > 0 && (
                <span className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A]">{form.immagini.length} foto</span>
              )}
            </div>

            {form.immagini.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.immagini.map((url, i) => (
                  <div key={url} className="relative group aspect-square bg-[#F0F0F0] overflow-hidden">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightboxIndex(i)}
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[9px] font-semibold uppercase tracking-wider bg-[#CC2222] text-white px-1.5 py-0.5 font-['Glacial_Indifference']">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded hover:bg-black/80 transition-colors"
                      aria-label="Rimuovi"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        disabled={i === 0}
                        className="bg-black/60 text-white p-1 rounded disabled:opacity-30 hover:bg-black/80"
                        aria-label="Sposta a sinistra"
                      >
                        <ChevronLeft size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        disabled={i === form.immagini.length - 1}
                        className="bg-black/60 text-white p-1 rounded disabled:opacity-30 hover:bg-black/80"
                        aria-label="Sposta a destra"
                      >
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-[#E0E0E0] py-8 flex flex-col items-center gap-2 hover:border-[#111111] transition-colors group"
            >
              {uploading ? (
                <Loader2 size={22} className="animate-spin text-[#9A9A9A]" />
              ) : (
                <Upload size={22} className="text-[#9A9A9A] group-hover:text-[#111111] transition-colors" />
              )}
              <span className="font-['Glacial_Indifference'] text-sm text-[#9A9A9A] group-hover:text-[#111111] transition-colors">
                {uploading ? "Caricamento..." : "Carica una o più immagini"}
              </span>
              <span className="font-['Glacial_Indifference'] text-xs text-[#BBBBBB]">
                JPG, PNG, WEBP, GIF, HEIC, SVG…
              </span>
            </button>

            {uploadError && (
              <p className="font-['Glacial_Indifference'] text-sm text-[#CC2222]">{uploadError}</p>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Opzioni */}
          <div className="bg-white border border-[#E0E0E0] p-5 sm:p-6 space-y-4">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">Opzioni</h2>
            <label className="flex items-center justify-between cursor-pointer gap-4">
              <div>
                <p className="font-['Glacial_Indifference'] text-sm font-medium text-[#333333]">Personalizzabile</p>
                <p className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A]">Il cliente può richiedere personalizzazioni</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, personalizzabile: !f.personalizzabile }))}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.personalizzabile ? "bg-[#111111]" : "bg-[#E0E0E0]"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.personalizzabile ? "translate-x-5" : ""}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer gap-4">
              <div>
                <p className="font-['Glacial_Indifference'] text-sm font-medium text-[#333333]">In Evidenza</p>
                <p className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A]">Mostra in homepage nella sezione featured</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, inEvidenza: !f.inEvidenza }))}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.inEvidenza ? "bg-[#CC2222]" : "bg-[#E0E0E0]"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.inEvidenza ? "translate-x-5" : ""}`} />
              </button>
            </label>
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pb-8">
            <button
              type="submit"
              disabled={isPending || uploading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#CC2222] hover:bg-[#AA1A1A] text-white font-['Glacial_Indifference'] font-semibold text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isNew ? "Crea Prodotto" : "Salva Modifiche"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/prodotti")}
              className="px-6 py-3 border border-[#E0E0E0] font-['Glacial_Indifference'] text-sm text-[#555555] hover:bg-[#F8F8F8] transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>

      {lightboxIndex !== null && form.immagini.length > 0 && (
        <Lightbox
          images={form.immagini}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={(i) => setLightboxIndex(i)}
        />
      )}
    </AdminLayout>
  );
}
