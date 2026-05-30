import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";

export default function ProdottiAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoria, setCategoria] = useState("");

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._st);
    (window as any)._st = setTimeout(() => setDebouncedSearch(val), 300);
  };

  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });

  const query: Record<string, string> = {};
  if (debouncedSearch) query.search = debouncedSearch;
  if (categoria) query.categoria = categoria;

  const { data, isLoading } = useQuery({
    queryKey: ["products", query],
    queryFn: async () => (await api.products.$get({ query })).json(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.products[":id"].$delete({ param: { id: String(id) } });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const products = data?.products ?? [];
  const categories = catsData?.categories ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-2xl sm:text-3xl">Prodotti</h1>
          <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mt-0.5">{data?.total ?? 0} prodotti totali</p>
        </div>
        <Link to="/admin/prodotti/nuovo">
          <span className="flex items-center gap-2 bg-[#CC2222] hover:bg-[#AA1A1A] text-white font-['Glacial_Indifference'] text-sm font-semibold tracking-wider uppercase px-4 py-3 transition-colors cursor-pointer whitespace-nowrap">
            <Plus size={14} /> <span className="hidden sm:inline">Nuovo prodotto</span><span className="sm:hidden">Nuovo</span>
          </span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cerca prodotto..."
            className="w-full pl-9 pr-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-3 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
        >
          <option value="">Tutte le categorie</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-[#E0E0E0]">
        {/* Desktop table header */}
        <div className="hidden sm:grid grid-cols-[48px_1fr_140px_100px_80px_80px_80px] gap-4 px-6 py-3 border-b border-[#E0E0E0] bg-[#F8F8F8]">
          <div />
          <p className="font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A]">Prodotto</p>
          <p className="font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A]">Categoria</p>
          <p className="font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A]">Prezzo</p>
          <p className="font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A]">Evidenza</p>
          <p className="font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A]">Custom</p>
          <div />
        </div>

        {isLoading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-[#CC2222] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <Package size={32} className="text-[#E0E0E0] mx-auto mb-4" />
            <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mb-3">Nessun prodotto trovato.</p>
            <Link to="/admin/prodotti/nuovo">
              <span className="font-['Glacial_Indifference'] text-sm text-[#CC2222] cursor-pointer hover:underline">
                Aggiungi il primo prodotto →
              </span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {products.map((p: any) => (
              <div key={p.id}>
                {/* Mobile card */}
                <div className="sm:hidden p-4 flex items-center gap-3">
                  <div className="w-14 h-14 bg-[#F8F8F8] shrink-0 overflow-hidden">
                    {p.immagineUrl ? (
                      <img src={p.immagineUrl} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-[#9A9A9A]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm truncate">{p.nome}</p>
                    <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs mt-0.5">
                      {p.categoriaNome ?? "Senza categoria"}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {p.prezzo != null && (
                        <span className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm">
                          €{p.prezzo.toFixed(2)}
                        </span>
                      )}
                      {p.inEvidenza && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#CC2222] text-white px-1.5 py-0.5 font-['Glacial_Indifference']">
                          Evidenza
                        </span>
                      )}
                      {p.personalizzabile && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#111111] text-white px-1.5 py-0.5 font-['Glacial_Indifference']">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <Link to={`/admin/prodotti/${p.id}`}>
                      <span className="p-2.5 text-[#9A9A9A] hover:text-[#111111] hover:bg-[#F8F8F8] transition-colors cursor-pointer block border border-[#E0E0E0]">
                        <Pencil size={15} />
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare "${p.nome}"?`)) deleteMutation.mutate(p.id);
                      }}
                      className="p-2.5 text-[#9A9A9A] hover:text-[#CC2222] hover:bg-red-50 transition-colors border border-[#E0E0E0]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[48px_1fr_140px_100px_80px_80px_80px] items-center gap-4 px-6 py-4">
                  <div className="w-12 h-12 bg-[#F8F8F8] shrink-0 overflow-hidden">
                    {p.immagineUrl ? (
                      <img src={p.immagineUrl} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-[#9A9A9A]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm truncate">{p.nome}</p>
                    {p.descrizioneBreve && (
                      <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs truncate">{p.descrizioneBreve}</p>
                    )}
                  </div>
                  <p className="font-['Glacial_Indifference'] text-[#555555] text-xs truncate">
                    {p.categoriaNome ?? <span className="text-[#9A9A9A]">—</span>}
                  </p>
                  <p className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm">
                    {p.prezzo != null ? `€${p.prezzo.toFixed(2)}` : <span className="text-[#9A9A9A] font-normal">—</span>}
                  </p>
                  <div className="flex justify-center">
                    <span className={`w-2 h-2 rounded-full ${p.inEvidenza ? "bg-[#CC2222]" : "bg-[#E0E0E0]"}`} />
                  </div>
                  <div className="flex justify-center">
                    <span className={`w-2 h-2 rounded-full ${p.personalizzabile ? "bg-[#111111]" : "bg-[#E0E0E0]"}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/prodotti/${p.id}`}>
                      <span className="p-2 text-[#9A9A9A] hover:text-[#111111] hover:bg-[#F8F8F8] transition-colors cursor-pointer block">
                        <Pencil size={14} />
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare "${p.nome}"?`)) deleteMutation.mutate(p.id);
                      }}
                      className="p-2 text-[#9A9A9A] hover:text-[#CC2222] hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
