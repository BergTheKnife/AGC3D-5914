import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Search, SlidersHorizontal, X, ChevronDown, ExternalLink } from "lucide-react";

function ProductDetailModal({ product, onClose }: { product: any; onClose: () => void }) {
  const colors: string[] = product.colori ? JSON.parse(product.colori) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="aspect-video bg-[#F8F8F8] relative overflow-hidden">
          {product.immagineUrl ? (
            <img src={product.immagineUrl} alt={product.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src="/logo.svg" alt="" className="h-20 opacity-10" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 transition-colors"
          >
            <X size={18} />
          </button>
          {product.personalizzabile && (
            <span className="absolute top-4 left-4 bg-[#CC2222] text-white text-[10px] font-['Glacial_Indifference'] font-bold tracking-widest uppercase px-3 py-1">
              Personalizzabile
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {product.categoriaNome && (
            <p className="font-['Glacial_Indifference'] text-[#CC2222] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              {product.categoriaNome}
            </p>
          )}
          <h2 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-2xl sm:text-3xl mb-4">{product.nome}</h2>
          {product.prezzo != null && (
            <p className="font-['Glacial_Indifference'] font-bold text-[#111111] text-3xl mb-6">€{product.prezzo.toFixed(2)}</p>
          )}

          {product.descrizioneCompleta && (
            <p className="font-['Glacial_Indifference'] text-[#555555] text-sm leading-relaxed mb-6">{product.descrizioneCompleta}</p>
          )}
          {!product.descrizioneCompleta && product.descrizioneBreve && (
            <p className="font-['Glacial_Indifference'] text-[#555555] text-sm leading-relaxed mb-6">{product.descrizioneBreve}</p>
          )}

          {/* Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {colors.length > 0 && (
              <div className="bg-[#F8F8F8] p-4">
                <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs tracking-wider uppercase mb-2">Colori disponibili</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c: string) => (
                    <span key={c} className="font-['Glacial_Indifference'] text-sm text-[#111111] bg-white border border-[#E0E0E0] px-2 py-0.5">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {product.materiali && (
              <div className="bg-[#F8F8F8] p-4">
                <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs tracking-wider uppercase mb-2">Materiali</p>
                <p className="font-['Glacial_Indifference'] text-sm text-[#111111]">{product.materiali}</p>
              </div>
            )}
            {product.dimensioni && (
              <div className="bg-[#F8F8F8] p-4">
                <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs tracking-wider uppercase mb-2">Dimensioni</p>
                <p className="font-['Glacial_Indifference'] text-sm text-[#111111]">{product.dimensioni}</p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/contatti"
              className="flex-1 bg-[#111111] hover:bg-[#2A2A2A] text-white font-['Glacial_Indifference'] font-semibold text-sm tracking-widest uppercase px-6 py-4 text-center transition-colors"
            >
              Richiedi informazioni
            </a>
            {product.personalizzabile && (
              <a
                href="/contatti"
                className="flex-1 bg-[#CC2222] hover:bg-[#AA1A1A] text-white font-['Glacial_Indifference'] font-semibold text-sm tracking-widest uppercase px-6 py-4 text-center transition-colors"
              >
                Richiedi personalizzazione
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  const colors: string[] = product.colori ? (() => { try { return JSON.parse(product.colori); } catch { return []; } })() : [];

  return (
    <div
      className="group bg-white border border-[#E0E0E0] hover:border-[#111111] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-[#F8F8F8] relative">
        {product.immagineUrl ? (
          <img
            src={product.immagineUrl}
            alt={product.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/logo.svg" alt="AGC 3D Studios" className="h-12 w-12 opacity-10" />
          </div>
        )}
        {product.personalizzabile && (
          <span className="absolute top-2 left-2 bg-[#CC2222] text-white text-[9px] font-['Glacial_Indifference'] font-bold tracking-widest uppercase px-2 py-0.5">
            Personalizzabile
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        {product.categoriaNome && (
          <p className="text-[#9A9A9A] text-[10px] font-['Glacial_Indifference'] font-semibold uppercase tracking-[0.15em] mb-1">{product.categoriaNome}</p>
        )}
        <h3 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm mb-2 line-clamp-2 flex-1">{product.nome}</h3>
        {product.descrizioneBreve && (
          <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs leading-relaxed mb-3 line-clamp-2">{product.descrizioneBreve}</p>
        )}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {colors.slice(0, 3).map((c: string) => (
              <span key={c} className="text-[#555555] text-[10px] font-['Glacial_Indifference'] bg-[#F0F0F0] px-1.5 py-0.5">{c}</span>
            ))}
            {colors.length > 3 && <span className="text-[#9A9A9A] text-[10px]">+{colors.length - 3}</span>}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F0F0F0]">
          <span className="font-['Glacial_Indifference'] font-bold text-[#111111] text-base">
            {product.prezzo != null ? `€${product.prezzo.toFixed(2)}` : "Su richiesta"}
          </span>
          <span className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A] group-hover:text-[#CC2222] transition-colors flex items-center gap-1">
            Dettagli <ExternalLink size={10} />
          </span>
        </div>
      </div>
    </div>
  );
}

const sortOptions = [
  { value: "", label: "Più recenti" },
  { value: "prezzo_asc", label: "Prezzo crescente" },
  { value: "prezzo_desc", label: "Prezzo decrescente" },
  { value: "az", label: "Alfabetico A-Z" },
  { value: "za", label: "Alfabetico Z-A" },
];

export default function CatalogoPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [minPrezzo, setMinPrezzo] = useState("");
  const [maxPrezzo, setMaxPrezzo] = useState("");
  const [personalizzabile, setPersonalizzabile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((window as any)._searchTimeout);
    (window as any)._searchTimeout = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });

  const query: Record<string, string> = {};
  if (debouncedSearch) query.search = debouncedSearch;
  if (categoria) query.categoria = categoria;
  if (sortBy) query.sortBy = sortBy;
  if (minPrezzo) query.minPrezzo = minPrezzo;
  if (maxPrezzo) query.maxPrezzo = maxPrezzo;
  if (personalizzabile) query.personalizzabile = "true";

  const { data, isLoading } = useQuery({
    queryKey: ["products", query],
    queryFn: async () => (await api.products.$get({ query })).json(),
  });

  const products = data?.products ?? [];
  const categories = catsData?.categories ?? [];

  const hasActiveFilters = !!(search || categoria || minPrezzo || maxPrezzo || personalizzabile);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoria("");
    setMinPrezzo("");
    setMaxPrezzo("");
    setPersonalizzabile(false);
    setSortBy("");
  };

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[#111111] section-py px-6">
        <div className="container-xl">
          <span className="label-eyebrow">Tutti i prodotti</span>
          <h1 className="hero-headline text-white mt-1">Catalogo</h1>
        </div>
      </section>

      <div className="container-xl py-8 lg:py-10">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cerca un prodotto..."
              className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white min-w-[200px] cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] pointer-events-none" />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-5 py-3 border font-['Glacial_Indifference'] text-sm font-medium tracking-wider uppercase transition-colors ${
              filtersOpen || hasActiveFilters
                ? "bg-[#111111] text-white border-[#111111]"
                : "bg-white text-[#111111] border-[#E0E0E0] hover:border-[#111111]"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filtri
            {hasActiveFilters && (
              <span className="bg-[#CC2222] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-[#F8F8F8] border border-[#E0E0E0] p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Categoria */}
              <div>
                <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
                  Categoria
                </label>
                <div className="relative">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="appearance-none w-full px-3 py-2.5 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white cursor-pointer"
                  >
                    <option value="">Tutte le categorie</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] pointer-events-none" />
                </div>
              </div>

              {/* Prezzo min */}
              <div>
                <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
                  Prezzo min (€)
                </label>
                <input
                  type="number"
                  value={minPrezzo}
                  onChange={(e) => setMinPrezzo(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
                />
              </div>

              {/* Prezzo max */}
              <div>
                <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
                  Prezzo max (€)
                </label>
                <input
                  type="number"
                  value={maxPrezzo}
                  onChange={(e) => setMaxPrezzo(e.target.value)}
                  placeholder="999"
                  className="w-full px-3 py-2.5 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
                />
              </div>

              {/* Personalizzabile */}
              <div>
                <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
                  Opzioni
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setPersonalizzabile(!personalizzabile)}
                    className={`w-10 h-5 relative transition-colors cursor-pointer ${personalizzabile ? "bg-[#CC2222]" : "bg-[#E0E0E0]"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${personalizzabile ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="font-['Glacial_Indifference'] text-sm text-[#111111]">Solo personalizzabili</span>
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 font-['Glacial_Indifference'] text-sm text-[#CC2222] hover:text-[#AA1A1A] transition-colors"
                >
                  <X size={14} /> Reimposta filtri
                </button>
              </div>
            )}
          </div>
        )}

        {/* Category quick tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setCategoria("")}
              className={`font-['Glacial_Indifference'] text-xs font-medium tracking-wider uppercase px-4 py-2 border transition-colors ${
                !categoria
                  ? "bg-[#111111] text-white border-[#111111]"
                  : "bg-white text-[#555555] border-[#E0E0E0] hover:border-[#111111]"
              }`}
            >
              Tutti
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setCategoria(categoria === String(cat.id) ? "" : String(cat.id))}
                className={`font-['Glacial_Indifference'] text-xs font-medium tracking-wider uppercase px-4 py-2 border transition-colors ${
                  categoria === String(cat.id)
                    ? "bg-[#111111] text-white border-[#111111]"
                    : "bg-white text-[#555555] border-[#E0E0E0] hover:border-[#111111]"
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-['Glacial_Indifference'] text-sm text-[#9A9A9A]">
            {isLoading ? "Caricamento..." : `${products.length} prodott${products.length === 1 ? "o" : "i"} trovati`}
          </p>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="font-['Glacial_Indifference'] text-xs text-[#CC2222] hover:text-[#AA1A1A] flex items-center gap-1">
              <X size={12} /> Cancella filtri
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#F8F8F8] animate-pulse">
                <div className="aspect-square" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#E0E0E0] rounded w-3/4" />
                  <div className="h-3 bg-[#E0E0E0] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-2 border-[#E0E0E0] flex items-center justify-center mx-auto mb-6">
              <Search size={24} className="text-[#9A9A9A]" />
            </div>
            <h3 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-xl mb-3">
              Nessun prodotto trovato
            </h3>
            <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mb-6">
              Prova a modificare i filtri o a cercare un altro termine
            </p>
            <button
              onClick={resetFilters}
              className="font-['Glacial_Indifference'] text-sm font-semibold tracking-wider uppercase bg-[#111111] text-white px-6 py-3 hover:bg-[#2A2A2A] transition-colors"
            >
              Reimposta filtri
            </button>
          </div>
        )}

        {/* Product grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
