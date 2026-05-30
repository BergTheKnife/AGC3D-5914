import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";

function CategoryForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial?: { nome: string; descrizione?: string; ordine?: number };
  onSave: (data: { nome: string; descrizione: string; ordine: number }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [descrizione, setDescrizione] = useState(initial?.descrizione ?? "");
  const [ordine, setOrdine] = useState(String(initial?.ordine ?? 0));

  return (
    <div className="bg-[#F8F8F8] border border-[#E0E0E0] p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="sm:col-span-2">
          <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
            Nome categoria *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
            placeholder="es. Decorazioni"
          />
        </div>
        <div>
          <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
            Ordine
          </label>
          <input
            type="number"
            value={ordine}
            onChange={(e) => setOrdine(e.target.value)}
            className="w-full px-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
            placeholder="0"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-['Glacial_Indifference'] text-xs font-semibold tracking-wider uppercase text-[#9A9A9A] mb-2">
          Descrizione
        </label>
        <input
          type="text"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          className="w-full px-4 py-3 border border-[#E0E0E0] focus:border-[#111111] outline-none font-['Glacial_Indifference'] text-sm bg-white"
          placeholder="Breve descrizione della categoria"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => nome.trim() && onSave({ nome: nome.trim(), descrizione, ordine: parseInt(ordine) || 0 })}
          disabled={loading || !nome.trim()}
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#2A2A2A] disabled:bg-[#9A9A9A] text-white font-['Glacial_Indifference'] text-sm font-medium px-5 py-2.5 transition-colors"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
          Salva
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 bg-white border border-[#E0E0E0] hover:border-[#111111] text-[#555555] font-['Glacial_Indifference'] text-sm font-medium px-5 py-2.5 transition-colors"
        >
          <X size={14} /> Annulla
        </button>
      </div>
    </div>
  );
}

export default function CategorieAdmin() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });

  const addMutation = useMutation({
    mutationFn: async (data: { nome: string; descrizione: string; ordine: number }) => {
      const res = await api.categories.$post({ json: data });
      const json = await res.json();
      if (!res.ok) throw new Error((json as any).message);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setShowAdd(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; nome: string; descrizione: string; ordine: number }) => {
      const res = await api.categories[":id"].$put({ param: { id: String(id) }, json: data });
      const json = await res.json();
      if (!res.ok) throw new Error((json as any).message);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.categories[":id"].$delete({ param: { id: String(id) } });
      const json = await res.json();
      if (!res.ok) throw new Error((json as any).message);
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: any) => setDeleteError(e.message),
  });

  const categories = data?.categories ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Glacial_Indifference'] font-bold text-[#111111] text-3xl">Categorie</h1>
          <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mt-1">{categories.length} categorie</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-[#CC2222] hover:bg-[#AA1A1A] text-white font-['Glacial_Indifference'] text-sm font-semibold tracking-wider uppercase px-5 py-3 transition-colors"
        >
          <Plus size={14} /> Nuova categoria
        </button>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-[#CC2222] font-['Glacial_Indifference'] text-sm px-4 py-3 mb-6 flex items-center gap-2">
          <AlertCircle size={14} />
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {showAdd && (
        <div className="mb-6">
          <h2 className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-base mb-3">Nuova categoria</h2>
          <CategoryForm
            onSave={(d) => addMutation.mutate(d)}
            onCancel={() => setShowAdd(false)}
            loading={addMutation.isPending}
          />
          {addMutation.isError && (
            <p className="font-['Glacial_Indifference'] text-sm text-[#CC2222] mt-2">{(addMutation.error as any)?.message}</p>
          )}
        </div>
      )}

      <div className="bg-white border border-[#E0E0E0]">
        {isLoading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-[#CC2222] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-sm mb-3">Nessuna categoria creata.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="font-['Glacial_Indifference'] text-sm text-[#CC2222] hover:underline"
            >
              Crea la prima categoria →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {categories.map((cat: any) => (
              <div key={cat.id}>
                {editingId === cat.id ? (
                  <div className="p-4">
                    <CategoryForm
                      initial={{ nome: cat.nome, descrizione: cat.descrizione, ordine: cat.ordine }}
                      onSave={(d) => editMutation.mutate({ id: cat.id, ...d })}
                      onCancel={() => setEditingId(null)}
                      loading={editMutation.isPending}
                    />
                  </div>
                ) : (
                  <div className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-['Glacial_Indifference'] font-semibold text-[#111111] text-sm">{cat.nome}</p>
                      {cat.descrizione && (
                        <p className="font-['Glacial_Indifference'] text-[#9A9A9A] text-xs mt-0.5">{cat.descrizione}</p>
                      )}
                    </div>
                    <span className="font-['Glacial_Indifference'] text-xs text-[#9A9A9A] shrink-0">Ordine: {cat.ordine}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setEditingId(cat.id); setShowAdd(false); }}
                        className="p-2 text-[#9A9A9A] hover:text-[#111111] hover:bg-[#F8F8F8] transition-colors"
                        title="Modifica"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { setDeleteError(null); deleteMutation.mutate(cat.id); }}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-[#9A9A9A] hover:text-[#CC2222] hover:bg-red-50 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
