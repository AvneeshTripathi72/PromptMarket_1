'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const verticalCategories = [
  { name: 'All Categories', icon: 'apps', count: 156 },
  { name: 'Midjourney', icon: 'image', count: 45 },
  { name: 'DALL-E 3', icon: 'brush', count: 32 },
  { name: 'GPT-4', icon: 'psychology', count: 28 },
  { name: 'Claude', icon: 'chat', count: 24 },
  { name: 'Stable Diffusion', icon: 'auto_awesome', count: 27 },
  { name: 'Architecture', icon: 'domain', count: 18 },
  { name: 'Nature', icon: 'eco', count: 15 },
  { name: 'Abstract', icon: 'grain', count: 12 },
  { name: 'Coding', icon: 'code', count: 21 }
];

export default function Home() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedReliability, setSelectedReliability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Relevant');
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('prompts')
          .select(`
            *,
            profiles:creator_id (
              full_name,
              username,
              avatar_url
            )
          `);
        
        if (!error && data && data.length > 0) {
          setPrompts(data);
        } else {
          const { promptData } = require('@/lib/data');
          setPrompts(promptData || []);
        }
      } catch (e) {
        const { promptData } = require('@/lib/data');
        setPrompts(promptData || []);
      }
      setLoading(false);
    }
    fetchPrompts();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredPrompts = (prompts || []).filter(prompt => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(prompt.category)) return false;
    if (selectedModels.length > 0 && !selectedModels.includes(prompt.model)) return false;
    if (selectedReliability.length > 0 && !selectedReliability.includes(prompt.reliability)) return false;
    if (searchQuery && !prompt.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Top Rated') return b.rating - a.rating;
    return 0;
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleModel = (model: string) => {
    setSelectedModels(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]);
  };

  const toggleReliability = (rel: string) => {
    setSelectedReliability(prev => prev.includes(rel) ? prev.filter(r => r !== rel) : [...prev, rel]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white border-l border-black flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-black italic">CONFIG_FILTERS_PRO</h2>
              <button onClick={() => setShowMobileFilters(false)} className="size-8 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:border-black transition-all">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 outline-none"
                >
                  <option>Relevant</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Top Rated</option>
                </select>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Categories</h4>
                <div className="space-y-3">
                  {['Midjourney', 'DALL-E 3', 'GPT-4', 'Claude', 'Stable Diffusion'].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="text-slate-600 font-medium">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Model</h4>
                <div className="space-y-3">
                  {['MIDJOURNEY V8', 'STABLE DIFFUSION 3', 'GPT-5 TURBO', 'DALL-E 4', 'MIDJOURNEY V7', 'CLAUDE 4 OPUS'].map((model) => (
                    <label key={model} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => toggleModel(model)}
                        className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="text-slate-600 font-medium">{model}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Reliability</h4>
                <div className="space-y-3">
                  {['98% Reliability', '95% Reliability', '100% Reliable', '92% Reliability', '97% Reliability'].map((rel) => (
                    <label key={rel} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedReliability.includes(rel)}
                        onChange={() => toggleReliability(rel)}
                        className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="text-slate-600 font-medium">{rel}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <main className="flex-1 transition-all duration-300 lg:ml-16">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <nav className="lg:hidden sticky top-0 z-50 w-full bg-white border-b border-black mb-10">
              <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-black p-1.5 text-white">
                    <span className="material-symbols-outlined text-xl block">electric_bolt</span>
                  </div>
                  <h1 className="text-lg font-black tracking-tighter uppercase italic">MARKET <span className="text-slate-300">PRO</span></h1>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/profile">
                    <div
                      className="size-10 border-2 border-black bg-cover bg-center cursor-pointer"
                      style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDyrRnmar-je_OLpz_YnW4YsUyEjxLLzEKr5G_wEKsMZLBqxTdGY3mCT315-wtapbd9Ia88qwnDH9-Dtk9Ga6JB9D0YU6SXqLXYUkBsKGmy21uZJwTdF2JuFI2jyfWY0IJF0NM2gJElFFqfdXfBKq2Cr74e2l-p2Or4OpsWUkf9710LL46LwqntWg86KD-6t6S2r8HuJ-MOrNFOq7BQ4Bu8zO3L-aImdNQuNKqhrTSLO3pzufzF9dJoP_X6tms6fGYdphb7H2ZWc5k)' }}
                    />
                  </Link>
                </div>
              </div>
            </nav>

            {!showSidebar && (
              <div className="lg:flex justify-start mb-8 px-4 hidden">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/20 text-white text-sm font-bold transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform">tune</span>
                  <span>Open Filters</span>
                </button>
              </div>
            )}

            <section className="relative pt-20 pb-16 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)] pointer-events-none"></div>
              
              <div className="max-w-4xl mx-auto px-4 relative z-10">
                
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
                  Master the Art of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI Prompting.</span>
                </h1>
                
                <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-12 font-medium">
                  The world's premier infrastructure for high-performance prompt engineering and AI asset management.
                </p>

                <div className="max-w-2xl mx-auto glass-effect p-2 rounded-3xl shadow-card border border-white/40 flex items-center group transition-all focus-within:ring-4 focus-within:ring-primary/10">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ml-1">
                      <span className="material-symbols-outlined text-2xl">search</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for prompts, models, or creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 outline-none px-4 text-slate-900 placeholder-slate-400 font-medium text-base bg-transparent"
                    />
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-slate-900/10">
                      Search
                    </button>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-widest mt-2">Trending:</span>
                    {['#MidjourneyV6', '#Cyberpunk', '#Prototypes', '#Logos', '#CodeReview'].map(tag => (
                        <button key={tag} className="px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all shadow-sm">
                            {tag}
                        </button>
                    ))}
                </div>
              </div>
            </section>

            <section className="mb-8 px-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    className="flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-primary transition-colors group"
                  >
                    <span>Advanced Filters</span>
                    <span className={`material-symbols-outlined transition-transform duration-300 ${showFiltersPanel ? 'rotate-180 text-primary' : 'text-slate-400 group-hover:text-primary'}`}>expand_more</span>
                  </button>
                  {(selectedCategories.length > 0 || selectedModels.length > 0 || selectedReliability.length > 0) && (
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                      <span className="text-xs font-bold text-primary tracking-tight">
                        {selectedCategories.length + selectedModels.length + selectedReliability.length} Applied
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedModels([]);
                    setSelectedReliability([]);
                  }}
                  className="text-xs text-primary font-bold hover:underline transition-all"
                >
                  Clear all filters
                </button>
              </div>

              {showFiltersPanel && (
                <div ref={dropdownRef} className="bg-white border border-slate-100 rounded-3xl shadow-card p-6 mb-12">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'service', label: 'Service options' },
                      { id: 'seller', label: 'Seller details' },
                      { id: 'budget', label: 'Budget' }
                    ].map((tab) => (
                      <div key={tab.id} className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === tab.id ? null : tab.id)}
                          className={`px-5 py-2.5 text-sm font-bold transition-all rounded-2xl border-2 flex items-center gap-2 ${
                            openDropdown === tab.id
                              ? 'text-primary border-primary bg-primary/5'
                              : 'text-slate-600 border-slate-100 hover:text-slate-900 hover:border-slate-300'
                          }`}
                        >
                          {tab.label}
                          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
                            openDropdown === tab.id ? 'rotate-180' : ''
                          }`}>
                            expand_more
                          </span>
                        </button>

                        {openDropdown === tab.id && (
                          <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-slate-100 rounded-3xl shadow-card z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in duration-200">
                            <div className="p-6">
                              {tab.id === 'service' && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Categories</h4>
                                    <div className="space-y-1">
                                      {['Midjourney', 'DALL-E 3', 'GPT-4', 'Claude', 'Stable Diffusion', 'Architecture', 'Nature', 'Abstract', 'Coding'].map((cat) => {
                                        const count = verticalCategories.find(c => c.name === cat)?.count || 0;
                                        return (
                                          <label key={cat} className="flex items-center justify-between cursor-pointer group p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat)}
                                                onChange={() => toggleCategory(cat)}
                                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                                              />
                                              <span className={`text-sm transition-colors ${selectedCategories.includes(cat) ? 'text-primary font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300">({count})</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Model Architecture</h4>
                                    <div className="space-y-1">
                                      {['Midjourney v6.1', 'Midjourney v6.0', 'DALL-E 3', 'GPT-4o', 'Stable Diffusion 3', 'Claude 3.5 Sonnet'].map((model) => (
                                        <label key={model} className="flex items-center gap-2 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                          <input
                                            type="checkbox"
                                            checked={selectedModels.includes(model)}
                                            onChange={() => toggleModel(model)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                                          />
                                          <span className={`text-sm transition-colors ${selectedModels.includes(model) ? 'text-primary font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{model}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {tab.id === 'seller' && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Seller Experience</h4>
                                    <div className="space-y-1">
                                      {[
                                        { name: 'Elite Creators', count: 428 },
                                        { name: 'Certified Pro', count: 1946 },
                                        { name: 'Verified Expert', count: 2524 },
                                        { name: 'Rising Talent', count: 12906 }
                                      ].map((seller) => (
                                        <label key={seller.name} className="flex items-center justify-between cursor-pointer group p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium">{seller.name}</span>
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-300">({seller.count})</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Reliability</h4>
                                    <div className="space-y-1">
                                      {['100% Reliable', '98% Reliability', '97% Reliability', '95% Reliability', '92% Reliability'].map((rel) => (
                                        <label key={rel} className="flex items-center gap-2 cursor-pointer group p-1.5 rounded hover:bg-slate-50 transition-colors">
                                          <input
                                            type="checkbox"
                                            checked={selectedReliability.includes(rel)}
                                            onChange={() => toggleReliability(rel)}
                                            className="w-3.5 h-3.5 text-primary border-slate-300 rounded focus:ring-primary"
                                          />
                                          <span className={`text-xs transition-colors ${selectedReliability.includes(rel) ? 'text-primary font-semibold' : 'text-slate-600 group-hover:text-slate-900'}`}>{rel}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {tab.id === 'budget' && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Price range</h4>
                                    <div className="space-y-1">
                                      {[
                                        { range: 'Under $10', min: 0, max: 9 },
                                        { range: '$10 - $20', min: 10, max: 20 },
                                        { range: '$20 - $30', min: 20, max: 30 },
                                        { range: '$30 - $50', min: 30, max: 50 },
                                        { range: '$50 and above', min: 50, max: 999 }
                                      ].map((budget) => (
                                        <label key={budget.range} className="flex items-center gap-2 cursor-pointer group p-1.5 rounded hover:bg-slate-50 transition-colors">
                                          <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 text-primary border-slate-300 rounded focus:ring-primary"
                                          />
                                          <span className="text-xs text-slate-600 group-hover:text-slate-900">{budget.range}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="px-0 pb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {filteredPrompts.length} Results Found
                </h3>
                <button 
                    onClick={() => {
                        setBulkMode(!bulkMode);
                        if (bulkMode) setSelectedPrompts(new Set());
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        bulkMode 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-primary/50'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {bulkMode ? 'check_box' : 'add_box'}
                    </span>
                    <span>{bulkMode ? 'Cancel Bulk' : 'Bulk Selection'}</span>
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-sm">
                      <div className="aspect-[4/5] bg-slate-100" />
                      <div className="p-6 space-y-4">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-12 bg-slate-50 rounded-2xl mt-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
                  {filteredPrompts.map((prompt) => (
                    <Link key={prompt.id} href={`/prompt/${prompt.id}`} className="block group">
                      <div className="bg-white rounded-[2rem] border border-slate-100 flex flex-col h-full relative overflow-hidden hover:border-primary/20 hover:shadow-card transition-all duration-300">
                        <div className="relative aspect-square overflow-hidden bg-slate-50">
                          <img
                            src={prompt.image_url || prompt.image || 'https://via.placeholder.com/400x500'}
                            alt={prompt.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4">
                             <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 uppercase tracking-wider rounded-lg shadow-sm border border-white/20">
                                {prompt.category}
                             </div>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <h4 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {prompt.title}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium mb-4">
                             by {prompt.profiles?.full_name || 'Anonymous'}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                             <span className="text-lg font-black text-slate-900">${prompt.price}</span>
                             <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-lg">
                                  <span className="material-symbols-outlined text-xs fill-[1]">star</span>
                                  <span className="text-[10px] font-bold">{prompt.rating}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prompt.model?.split(' ')[0]}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">search_off</span>
                  <p className="text-slate-500 text-lg">No prompts matches your current filters.</p>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedModels([]);
                      setSelectedReliability([]);
                      setSearchQuery('');
                    }}
                    className="mt-4 text-primary font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
        
        {bulkMode && selectedPrompts.size > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-10">
                <div className="flex items-center gap-4 pl-4 text-white">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm font-bold">shopping_cart</span>
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-none">{selectedPrompts.size} Prompts Selected</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ready for bulk action</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-6 py-3 rounded-xl bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition-all">
                        Add to Folder
                    </button>
                    <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/30 hover:brightness-110 transition-all">
                        Buy Bulk ({selectedPrompts.size})
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
