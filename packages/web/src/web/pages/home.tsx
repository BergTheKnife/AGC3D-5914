import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ArrowRight, Layers, Palette, Ruler, Star } from "lucide-react";
import { ProductDetailModal } from "./catalogo";

function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white border border-[#E0E0E0] hover:border-[#111111] hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      <div className="aspect-square overflow-hidden bg-[#F8F8F8]">
        {product.immagineUrl ? (
          <img
            src={product.immagineUrl}
            alt={product.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/logo.svg" alt="AGC 3D Studios" className="h-16 w-16 opacity-10" />
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        {product.personalizzabile && (
          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase bg-[#CC2222] text-white px-2 py-0.5 mb-2">
            Personalizzabile
          </span>
        )}
        <h3 className="font-semibold text-[#111111] text-sm leading-snug mb-1.5 line-clamp-2">{product.nome}</h3>
        {product.categoriaNome && (
          <p className="text-[#9A9A9A] text-[11px] uppercase tracking-widest mb-2">{product.categoriaNome}</p>
        )}
        {product.prezzo != null && (
          <p className="font-bold text-[#111111] text-base mt-auto">€{product.prezzo.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}

const features = [
  { icon: <Layers size={22} />, title: "Stampa 3D professionale", desc: "Materiali di qualità e tecnologie di stampa avanzate per ogni creazione." },
  { icon: <Palette size={22} />, title: "Personalizzazione totale", desc: "Colori, dimensioni, testi e design completamente su misura per te." },
  { icon: <Ruler size={22} />, title: "Su misura", desc: "Oggetti unici per regali, eventi, collezioni tematiche e molto altro." },
  { icon: <Star size={22} />, title: "Qualità garantita", desc: "Cura per ogni dettaglio, dalla progettazione alla finitura finale." },
];

const categories = [
  { name: "Decorazioni",          icon: "🏺", desc: "Elementi decorativi unici per la casa" },
  { name: "Idee regalo",          icon: "🎁", desc: "Regali originali e personalizzati" },
  { name: "Gadget",               icon: "⚙️", desc: "Accessori pratici e originali" },
  { name: "Articoli personalizzati", icon: "✏️", desc: "Creazioni con il tuo nome o logo" },
  { name: "Oggetti tematici",     icon: "🎭", desc: "Collezioni a tema per ogni passione" },
  { name: "Creazioni su misura",  icon: "🔧", desc: "Progettazione dal concept alla realtà" },
];

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { data } = useQuery({
    queryKey: ["products-featured"],
    queryFn: async () => {
      const res = await api.products.$get({ query: { inEvidenza: "true" } });
      return res.json();
    },
  });

  const featured = data?.products?.slice(0, 4) ?? [];

  return (
    <div className="pt-16">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        className="relative min-h-[auto] lg:min-h-[100svh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/marble-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/40" />
        <div className="relative z-10 container-xl w-full py-8 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">

            {/* Text */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <span className="label-eyebrow">Creazioni 3D</span>
              <h1 className="hero-headline text-[#111111] mb-4 lg:mb-5 animate-fade-up delay-100">
                La creatività<br />
                <span className="text-[#CC2222]">che prende forma.</span>
              </h1>
              <p className="lead-text max-w-[42ch] mx-auto lg:mx-0 mb-6 lg:mb-8 animate-fade-up delay-200">
                Oggetti 3D personalizzati, creazioni su misura, idee regalo uniche.
                Realizziamo la tua idea con passione e precisione.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 animate-fade-up delay-300">
                <Link to="/catalogo">
                  <span className="btn btn-primary">Scopri il catalogo</span>
                </Link>
                <Link to="/contatti">
                  <span className="btn btn-secondary">Contattaci</span>
                </Link>
              </div>
            </div>

            {/* Image — desktop only (hidden on mobile to avoid brand redundancy) */}
            <div className="hidden lg:flex justify-center lg:justify-end order-1 lg:order-2">
              <img
                src="/hero-logo.png"
                alt="AGC 3D Studios"
                className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[600px] h-auto object-contain opacity-95"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO ─────────────────────────────────────────── */}
      <section className="bg-[#111111] section-py">
        <div className="container-xl text-center">
          <span className="label-eyebrow">Chi siamo</span>
          <h2 className="section-headline text-white mb-6 mx-auto" style={{ maxWidth: "22ch" }}>
            Dall'idea alla forma. Dal design alla realtà.
          </h2>
          <p className="lead-text text-[#9A9A9A] mx-auto mb-4" style={{ maxWidth: "58ch" }}>
            AGC 3D Studios è uno studio italiano specializzato nella stampa 3D e nella creazione
            di oggetti personalizzati. Combiniamo tecnologia e creatività per dare forma a ogni idea,
            con attenzione ai dettagli e passione per la qualità.
          </p>
          <p className="lead-text text-[#9A9A9A] mx-auto mb-10" style={{ maxWidth: "58ch" }}>
            Realizziamo decorazioni, gadget, idee regalo, articoli tematici e creazioni completamente
            su misura per privati e aziende.
          </p>
          <Link to="/chi-siamo">
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-white border-b border-white pb-0.5 hover:text-[#CC2222] hover:border-[#CC2222] transition-colors cursor-pointer">
              Scopri di più <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      </section>

      {/* ── COSA CREIAMO ─────────────────────────────────── */}
      <section className="section-py bg-[#F8F8F8]">
        <div className="container-xl">
          <div className="text-center mb-12 lg:mb-16">
            <span className="label-eyebrow">Le nostre creazioni</span>
            <h2 className="section-headline text-[#111111]">Cosa realizziamo</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 items-stretch">
            {categories.map((cat) => (
              <Link key={cat.name} to="/catalogo" className="flex">
                <div className="group bg-white border border-[#E0E0E0] hover:border-[#111111] p-5 lg:p-6 text-center cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col items-center justify-start w-full">
                  <div className="text-2xl lg:text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold text-[#111111] text-xs lg:text-sm leading-snug mb-1.5">{cat.name}</h3>
                  <p className="text-[#9A9A9A] text-xs leading-relaxed hidden lg:block">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section-py bg-white">
          <div className="container-xl">
            <div className="flex items-end justify-between mb-10 lg:mb-12">
              <div>
                <span className="label-eyebrow">In evidenza</span>
                <h2 className="section-headline text-[#111111]">Prodotti in evidenza</h2>
              </div>
              <Link to="/catalogo">
                <span className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#CC2222] hover:border-[#CC2222] transition-colors cursor-pointer">
                  Vedi tutti <ArrowRight size={13} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
              {featured.map((product: any) => (
                <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link to="/catalogo">
                <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-[#111111] border-b border-[#111111] pb-0.5">
                  Vedi tutto il catalogo <ArrowRight size={13} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="section-py bg-[#111111]">
        <div className="container-xl">
          <div className="text-center mb-12 lg:mb-16">
            <span className="label-eyebrow">Perché sceglierci</span>
            <h2 className="section-headline text-white">Il nostro approccio</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {features.map((f) => (
              <div key={f.title} className="border border-[#2A2A2A] p-7 hover:border-[#CC2222] transition-colors duration-200">
                <div className="text-[#CC2222] mb-5">{f.icon}</div>
                <h3 className="font-semibold text-white text-[0.9375rem] mb-3 leading-snug" style={{ textWrap: "balance" }}>{f.title}</h3>
                <p className="caption-text leading-relaxed" style={{ maxWidth: "none" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="container-xl">
          <div className="bg-[#CC2222] px-8 py-14 sm:px-12 lg:px-20 lg:py-20 text-center flex flex-col items-center">
            <h2 className="section-headline text-white mb-5 mx-auto" style={{ maxWidth: "20ch" }}>
              Hai un'idea in mente?
            </h2>
            <p className="lead-text !text-[#111111] mx-auto mb-10" style={{ maxWidth: "52ch" }}>
              Realizziamo creazioni completamente personalizzate. Raccontaci la tua idea
              e la trasformeremo in realtà con la stampa 3D.
            </p>
            <Link to="/contatti">
              <span className="btn" style={{ background: "#fff", color: "#CC2222" }}>
                Richiedi una creazione su misura
              </span>
            </Link>
          </div>
        </div>
      </section>

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
