import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Link } from "wouter";
import { Package, Tag, Plus, ArrowRight } from "lucide-react";
import { authClient } from "../../lib/auth";

export default function AdminDashboard() {
  const { data: session } = authClient.useSession();

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await api.products.$get({ query: {} })).json(),
  });

  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });

  const totalProducts = productsData?.total ?? 0;
  const totalCats = catsData?.categories?.length ?? 0;
  const featured = productsData?.products?.filter((p: any) => p.inEvidenza).length ?? 0;
  const personalizzabili = productsData?.products?.filter((p: any) => p.personalizzabile).length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mb-1">Benvenuto,</p>
        <h1 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-3xl">
          {session?.user?.name ?? "Admin"}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Prodotti totali", value: totalProducts, icon: <Package size={20} />, color: "#111111" },
          { label: "Categorie", value: totalCats, icon: <Tag size={20} />, color: "#555555" },
          { label: "In evidenza", value: featured, icon: <Package size={20} />, color: "#CC2222" },
          { label: "Personalizzabili", value: personalizzabili, icon: <Package size={20} />, color: "#555555" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E0E0E0] p-6">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <p className="font-['Glacial_Indifference'] font-bold text-[#111111] text-3xl mb-1">{stat.value}</p>
            <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link to="/admin/prodotti/nuovo">
          <div className="bg-[#CC2222] hover:bg-[#AA1A1A] p-6 cursor-pointer transition-colors flex items-center justify-between group">
            <div>
              <p className="font-['Glacial_Indifference'] font-bold text-white text-lg mb-1">Aggiungi prodotto</p>
              <p className="font-['Glacial_Indifference'] text-white/70 text-sm">Inserisci un nuovo prodotto nel catalogo</p>
            </div>
            <Plus size={24} className="text-white group-hover:rotate-90 transition-transform" />
          </div>
        </Link>
        <Link to="/admin/categorie">
          <div className="bg-[#111111] hover:bg-[#2A2A2A] p-6 cursor-pointer transition-colors flex items-center justify-between group">
            <div>
              <p className="font-['Glacial_Indifference'] font-bold text-white text-lg mb-1">Gestisci categorie</p>
              <p className="font-['Glacial_Indifference'] text-white/70 text-sm">Aggiungi, modifica o elimina categorie</p>
            </div>
            <Tag size={24} className="text-white" />
          </div>
        </Link>
      </div>

      {/* Recent products */}
      <div className="bg-white border border-[#E0E0E0]">
        <div className="p-6 border-b border-[#E0E0E0] flex items-center justify-between">
          <h2 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-lg">Prodotti recenti</h2>
          <Link to="/admin/prodotti">
            <span className="flex items-center gap-1 font-['Glacial_Indifference'] text-xs text-[#9A9A9A] hover:text-[#111111] transition-colors cursor-pointer">
              Vedi tutti <ArrowRight size={12} />
            </span>
          </Link>
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          {productsData?.products?.slice(0, 5).map((p: any) => (
            <div key={p.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F8F8F8] shrink-0 overflow-hidden">
                {p.immagineUrl ? (
                  <img src={p.immagineUrl} alt={p.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={14} className="text-[#9A9A9A]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Glacial_Indifference'] font-medium text-[#111111] text-sm truncate">{p.nome}</p>
                <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs">{p.categoriaNome ?? "Senza categoria"}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {p.prezzo != null && (
                  <span className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm">€{p.prezzo.toFixed(2)}</span>
                )}
                <Link to={`/admin/prodotti/${p.id}`}>
                  <span className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A] hover:text-[#111111] cursor-pointer transition-colors border border-[#E0E0E0] px-3 py-1">
                    Modifica
                  </span>
                </Link>
              </div>
            </div>
          ))}
          {!productsData?.products?.length && (
            <div className="px-6 py-10 text-center">
              <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm">Nessun prodotto ancora.</p>
              <Link to="/admin/prodotti/nuovo">
                <span className="inline-block mt-3 font-['Glacial_Indifference'] text-sm text-[#CC2222] cursor-pointer hover:underline">
                  Aggiungi il primo prodotto →
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
