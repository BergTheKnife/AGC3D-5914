import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { uploadImage } from "../../lib/upload";
import AdminLayout from "./layout";
import { ArrowLeft, Plus, X, Upload, Loader2, Save } from "lucide-react";

interface ProductForm {
  nome: string;
  categoriaId: string;
  prezzo: string;
  colori: string[];
  materiali: string;
  dimensioni: string;
  descrizioneBreve: string;
  descrizioneCompleta: string;
  personalizzabile: boolean;
  inEvidenza: boolean;
  immagineUrl: string;
}

const DEFAULT_FORM: ProductForm = {
  nome: "",
  categoriaId: "",
  prezzo: "",
  colori: [],
  materiali: "",
  dimensioni: "",
  descrizioneBreve: "",
  descrizioneCompleta: "",
  personalizzabile: false,
  inEvidenza: false,
  immagineUrl: "",
};

export default function ProdottiForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const isNew = !params.id || params.id === "nuovo";
  const productId = isNew ? null : params.id;

  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM);
  const [colorInput, setColorInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load categories
  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });
  const categories = (catsData as any)?.categories ?? [];

  // Load product if editing
  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => (await (api.products as any)[productId!].$get()).json(),
    enabled: !!productId,
  });

  useEffect(() => {
    if (productData && (productData as any).product) {
      const p = (productData as any).product;
      setForm({
        nome: p.nome ?? "",
        categoriaId: p.categoriaId ?? p.categoria_id ?? "",
        prezzo: p.prezzo != null ? String(p.prezzo) : "",
        colori: (() => {
          try {
            return Array.isArray(p.colori) ? p.colori : JSON.parse(p.colori || "[]");
          } catch {
            return [];
          }
        })(),
        materiali: p.materiali ?? "",
        dimensioni: p.dimensioni ?? "",
        descrizioneBreve: p.descrizioneBreve ?? p.descrizione_breve ?? "",
        descrizioneCompleta: p.descrizioneCompleta ?? p.descrizione_completa ?? "",
        personalizzabile: !!(p.personalizzabile),
        inEvidenza: !!(p.inEvidenza ?? p.in_evidenza),
        immagineUrl: p.immagineUrl ?? p.immagine_url ?? "",
      });
    }
  }, [productData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.products.$post({ json: data });
      if (!res.ok) {
        const body = await res.json() as any;
        throw new Error(body.error ?? "Errore durante la creazione");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/prodotti");
    },
    onError: (err: any) => setError(err.message),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await (api.products as any)[productId!].$patch({ json: data });
      if (!res.ok) {
        const body = await res.json() as any;
        throw new Error(body.error ?? "Errore durante il salvataggio");
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
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, immagineUrl: url }));
    } catch (err: any) {
      setUploadError("Upload fallito: " + (err.message ?? "errore sconosciuto"));
    } finally {
      setUploading(false);
    }
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
      materiali: form.materiali || null,
      dimensioni: form.dimensioni || null,
      descrizioneBreve: form.descrizioneBreve || null,
      descrizioneCompleta: form.descrizioneCompleta || null,
      personalizzabile: form.personalizzabile,
      inEvidenza: form.inEvidenza,
      immagineUrl: form.immagineUrl || null,
    };
    if (form.categoriaId) payload.categoriaId = form.categoriaId;
    if (form.prezzo !== "") payload.prezzo = parseFloat(form.prezzo);

    if (isNew) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
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
            className="p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
          >
            <ArrowLeft size={18} className="text-[#555555]" />
          </button>
          <div>
            <h1 className="font-['Glacial_Indifference'] font-bold text-2xl text-[#111111]">
              {isNew ? "Nuovo Prodotto" : "Modifica Prodotto"}
            </h1>
            <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mt-0.5">
              {isNew ? "Aggiungi un nuovo prodotto al catalogo" : "Modifica le informazioni del prodotto"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-['Glacial_Indifference'] text-sm">
              {error}
            </div>
          )}

          {/* Card: Info base */}
          <div className="bg-white border border-[#E0E0E0] p-6 space-y-5">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">
              Informazioni Base
            </h2>

            {/* Nome */}
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

            {/* Categoria + Prezzo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">
                  Categoria
                </label>
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
                <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">
                  Prezzo (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.prezzo}
                  onChange={(e) => setForm((f) => ({ ...f, prezzo: e.target.value }))}
                  placeholder="es. 29.90"
                  className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            </div>

            {/* Materiali + Dimensioni */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">
                  Materiali
                </label>
                <input
                  type="text"
                  value={form.materiali}
                  onChange={(e) => setForm((f) => ({ ...f, materiali: e.target.value }))}
                  placeholder="es. PLA, Resina"
                  className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>
              <div>
                <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">
                  Dimensioni
                </label>
                <input
                  type="text"
                  value={form.dimensioni}
                  onChange={(e) => setForm((f) => ({ ...f, dimensioni: e.target.value }))}
                  placeholder="es. 10x10x15 cm"
                  className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: Descrizioni */}
          <div className="bg-white border border-[#E0E0E0] p-6 space-y-5">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">
              Descrizioni
            </h2>
            <div>
              <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">
                Descrizione Breve
              </label>
              <input
                type="text"
                value={form.descrizioneBreve}
                onChange={(e) => setForm((f) => ({ ...f, descrizioneBreve: e.target.value }))}
                placeholder="Breve descrizione per le card catalogo"
                className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>
            <div>
              <label className="block font-['Glacial_Indifference'] text-sm font-medium text-[#333333] mb-1.5">
                Descrizione Completa
              </label>
              <textarea
                value={form.descrizioneCompleta}
                onChange={(e) => setForm((f) => ({ ...f, descrizioneCompleta: e.target.value }))}
                rows={5}
                placeholder="Descrizione dettagliata del prodotto..."
                className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Card: Colori */}
          <div className="bg-white border border-[#E0E0E0] p-6 space-y-4">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">
              Colori Disponibili
            </h2>
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
                className="px-4 py-2.5 bg-[#111111] text-white font-['Glacial_Indifference'] text-sm flex items-center gap-1.5 hover:bg-[#333333] transition-colors"
              >
                <Plus size={14} />
                Aggiungi
              </button>
            </div>
            {form.colori.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.colori.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F0F0] font-['Glacial_Indifference'] text-sm text-[#333333]"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => removeColor(c)}
                      className="text-[#9A9A9A] hover:text-[#CC2222] transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card: Immagine */}
          <div className="bg-white border border-[#E0E0E0] p-6 space-y-4">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">
              Immagine
            </h2>

            {form.immagineUrl && (
              <div className="relative w-full aspect-video bg-[#F0F0F0] overflow-hidden">
                <img
                  src={form.immagineUrl}
                  alt="Anteprima"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, immagineUrl: "" }))}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {!form.immagineUrl && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-[#E0E0E0] py-10 flex flex-col items-center gap-3 hover:border-[#111111] transition-colors group"
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-[#9A9A9A]" />
                ) : (
                  <Upload size={24} className="text-[#9A9A9A] group-hover:text-[#111111] transition-colors" />
                )}
                <span className="font-['Glacial_Indifference'] text-sm text-[#9A9A9A] group-hover:text-[#111111] transition-colors">
                  {uploading ? "Caricamento..." : "Clicca per caricare un'immagine"}
                </span>
              </button>
            )}

            {form.immagineUrl && !uploading && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="font-['Glacial_Indifference'] text-sm text-[#9A9A9A] hover:text-[#111111] underline transition-colors"
              >
                Sostituisci immagine
              </button>
            )}

            {uploadError && (
              <p className="font-['Glacial_Indifference'] text-sm text-[#CC2222]">{uploadError}</p>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Manual URL fallback */}
            <div>
              <label className="block font-['Glacial_Indifference'] text-xs text-[#9A9A9A] mb-1">
                Oppure inserisci URL immagine manualmente
              </label>
              <input
                type="url"
                value={form.immagineUrl}
                onChange={(e) => setForm((f) => ({ ...f, immagineUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-[#E0E0E0] px-4 py-2.5 font-['Glacial_Indifference'] text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>
          </div>

          {/* Card: Opzioni */}
          <div className="bg-white border border-[#E0E0E0] p-6 space-y-4">
            <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm uppercase tracking-wider">
              Opzioni
            </h2>
            {/* Personalizzabile */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-['Glacial_Indifference'] text-sm font-medium text-[#333333]">Personalizzabile</p>
                <p className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A]">Il cliente può richiedere personalizzazioni</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, personalizzabile: !f.personalizzabile }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.personalizzabile ? "bg-[#111111]" : "bg-[#E0E0E0]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.personalizzabile ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </label>

            {/* In Evidenza */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-['Glacial_Indifference'] text-sm font-medium text-[#333333]">In Evidenza</p>
                <p className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A]">Mostra in homepage nella sezione featured</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, inEvidenza: !f.inEvidenza }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.inEvidenza ? "bg-[#CC2222]" : "bg-[#E0E0E0]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.inEvidenza ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pb-8">
            <button
              type="submit"
              disabled={isPending || uploading}
              className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-['Glacial_Indifference'] font-medium text-sm hover:bg-[#333333] transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
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
    </AdminLayout>
  );
}
