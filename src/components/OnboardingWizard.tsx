import React, { useState } from "react";
import { 
  Building2, 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
}

interface OnboardingWizardProps {
  licenseKey: string;
  onComplete: (niche: string, products: Product[]) => void;
}

export default function OnboardingWizard({ licenseKey, onComplete }: OnboardingWizardProps) {
  const [niche, setNiche] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  
  // Single product entry state
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddProduct = () => {
    if (!prodName.trim()) {
      setErrorMsg("Please enter a product name.");
      return;
    }
    if (!prodDesc.trim()) {
      setErrorMsg("Please provide a description of the product.");
      return;
    }
    if (products.length >= 10) {
      setErrorMsg("You can register up to 10 products per business workspace.");
      return;
    }

    const newProd: Product = {
      id: "prod_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: prodName.trim(),
      description: prodDesc.trim()
    };

    setProducts(prev => [...prev, newProd]);
    setProdName("");
    setProdDesc("");
    setErrorMsg(null);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) {
      setErrorMsg("Please specify your business market niche.");
      return;
    }
    if (products.length === 0) {
      setErrorMsg("Please add at least one product description to train your workspace.");
      return;
    }

    onComplete(niche.trim(), products);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6 bg-radial-gradient">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.02)_0%,transparent_100%)] pointer-events-none" />
      
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-3xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black font-display text-zinc-100 tracking-tight">Set Up Your Creatives Lab Workspace</h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Welcome to Creatives Lab! Register your core market niche and describe your products so our analytical AI knows exactly what makes your offer convert.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Niche Input Block */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> 1. What is Your Market Niche?
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">e.g. DTC Skincare, SaaS, E-Commerce Fitness</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. DTC Botanical Skincare"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-750 rounded-xl px-4 py-3.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 font-semibold"
            />
          </div>

          {/* Product Form Entry Block */}
          <div className="space-y-4 border-t border-zinc-900 pt-6">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> 2. Add Your Products ({products.length}/10)
            </label>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Describe up to 10 products that you offer. Be specific about features, core value propositions, and customer pain points.
            </p>

            {/* Product entry card */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Product Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Youth Glow Serum"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Product Description & Key Pain Points Solved</label>
                <textarea
                  rows={2}
                  placeholder="e.g. A lightweight hyaluronic acid serum that targets fine lines and dark circles. Solves dull, dry skin problems for working moms over 30."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 resize-none leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleAddProduct}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-zinc-100 font-bold text-[10px] uppercase font-mono rounded-xl transition-all flex items-center gap-1 ml-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Product to Workspace
              </button>
            </div>
          </div>

          {/* Added products review stack */}
          {products.length > 0 && (
            <div className="space-y-3">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Registered Products List</span>
              <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {products.map((p, idx) => (
                  <div 
                    key={p.id}
                    className="flex justify-between items-start bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-xl text-xs"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-400 font-bold">#{idx + 1}</span>
                        <h4 className="font-bold text-zinc-200">{p.name}</h4>
                      </div>
                      <p className="text-zinc-400 leading-relaxed line-clamp-2">{p.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(p.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Alert */}
          {errorMsg && (
            <div className="bg-red-950/15 border border-red-900/30 p-3.5 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submission and Active Activation */}
          <div className="border-t border-zinc-900 pt-6 flex justify-between items-center">
            <div className="text-[10px] font-mono text-zinc-500 leading-relaxed">
              <span>Licensed Workspace Key:</span>
              <span className="block font-bold text-zinc-400 truncate w-44">{licenseKey}</span>
            </div>
            
            <button
              type="submit"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-amber-900/10 cursor-pointer"
            >
              <span>Initialize My Workspace</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 animate-pulse" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
