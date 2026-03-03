'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BulkUpload() {
  const [prompts, setPrompts] = useState([{ id: 1, title: '', content: '', category: 'Midjourney' }]);

  const addPrompt = () => {
    setPrompts([...prompts, { id: Date.now(), title: '', content: '', category: 'Midjourney' }]);
  };

  const removePrompt = (id: number) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 p-6 sm:p-10 w-full relative z-10 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-xs fill-[1]">cloud_upload</span>
            Asset Studio
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
            Bulk <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Synchronization</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
            Scalable infrastructure for high-volume prompt architecture deployment.
          </p>
        </div>
        <Link 
            href="/profile" 
            className="size-14 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-all hover:scale-110 shadow-sm"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </Link>
      </header>

      {/* Main Upload Zone */}
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 sm:p-12 mb-10 shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mt-48 pointer-events-none"></div>
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 mb-12 text-center group hover:bg-slate-50 hover:border-primary/50 transition-all cursor-pointer relative z-10">
          <div className="size-20 bg-primary/10 text-primary flex items-center justify-center rounded-[2rem] mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
            <span className="material-symbols-outlined text-4xl">upload_file</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Batch Import Engine</h3>
          <p className="text-slate-500 max-w-sm font-medium text-sm leading-relaxed mb-6">Drag and drop architecture files or browse system storage.</p>
          <div className="flex gap-2">
               {['.CSV', '.JSON', '.XLSX'].map(format => (
                   <span key={format} className="px-3 py-1 bg-white border border-slate-100 text-[10px] font-black text-slate-400 rounded-lg">{format}</span>
               ))}
          </div>
        </div>

        <div className="flex items-center gap-6 mb-12 opacity-50 relative z-10">
          <div className="h-px bg-slate-100 flex-1"></div>
          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest leading-none">OR HANDCRAFT MANUALLY</span>
          <div className="h-px bg-slate-100 flex-1"></div>
        </div>

        {/* Manual Grid Entry */}
        <div className="grid grid-cols-1 gap-8 relative z-10">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="relative bg-slate-50/50 rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 group transition-all hover:bg-white hover:shadow-card hover:border-primary/10">
              <div className="absolute top-8 left-[-12px] h-10 px-4 bg-primary text-white flex items-center justify-center font-black text-[10px] uppercase rounded-r-2xl shadow-lg shadow-primary/20">
                PROMPT_{index + 1}
              </div>
              <button 
                onClick={() => removePrompt(prompt.id)}
                className="absolute top-8 right-8 size-10 rounded-xl bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                disabled={prompts.length === 1}
              >
                <span className="material-symbols-outlined text-xl">delete_outline</span>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div className="group">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 group-focus-within:text-primary transition-colors">Architecture Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cyberpunk Nexus VI" 
                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-slate-900"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 group-focus-within:text-primary transition-colors">Model Category</label>
                  <div className="relative">
                      <select className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none cursor-pointer font-bold text-slate-900 appearance-none">
                        <option>Midjourney</option>
                        <option>GPT-4</option>
                        <option>DALL-E 3</option>
                        <option>Claude</option>
                        <option>Stable Diffusion</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="md:col-span-2 group">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 group-focus-within:text-primary transition-colors">Engineered Command Text</label>
                  <textarea 
                    rows={4} 
                    placeholder="Paste the primary command string here..." 
                    className="w-full bg-white border border-slate-100 rounded-3xl px-6 py-5 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none font-mono text-sm leading-relaxed"
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={addPrompt}
            className="w-full py-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-400 font-black hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-4 group active:scale-[0.99]"
          >
            <div className="size-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                 <span className="material-symbols-outlined text-2xl">add_circle</span>
            </div>
            <span className="uppercase tracking-widest text-xs">Register Additional Prototype</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-20 p-4">
        <Link href="/profile" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest leading-none bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
          Discard Process
        </Link>
        <button className="w-full sm:w-auto px-12 py-5 bg-primary text-white font-black transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 group">
          <span>Finalize Protocol ({prompts.length})</span>
          <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">rocket_launch</span>
        </button>
      </div>

      {/* Meta Branding Panel */}
      <div className="rounded-[3rem] bg-slate-900 p-10 sm:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="size-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] flex items-center justify-center text-primary shadow-2xl shadow-black/20">
            <span className="material-symbols-outlined text-4xl fill-[1]">inventory</span>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Bulk Synthesis Protocol <span className="text-primary italic">v4.0</span></h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                Global infrastructure for large-scale asset synchronization. Optimized for 100+ concurrent deployments with zero latency grid mapping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
