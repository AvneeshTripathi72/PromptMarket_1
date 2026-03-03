'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

export default function FoldersPage() {
  const { user, loading: authLoading } = useAuth();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchFolders() {
      if (!user) return;
      setLoading(true);
      try {
          const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (!error && data && data.length > 0) {
            setFolders(data);
          } else {
            // Fallback to beautiful mock data IF no real data exists
            setFolders([
                { id: 'mock-1', name: 'Cyberpunk Collection', asset_count: 12, icon: 'bolt', color: 'bg-indigo-500' },
                { id: 'mock-2', name: 'Architecture Viz', asset_count: 8, icon: 'domain', color: 'bg-emerald-500' },
                { id: 'mock-3', name: 'GPT Workflows', asset_count: 5, icon: 'psychology', color: 'bg-blue-500' },
                { id: 'mock-4', name: 'Marketing Assets', asset_count: 15, icon: 'campaign', color: 'bg-amber-500' },
                { id: 'mock-5', name: 'UI Components', asset_count: 20, icon: 'grid_view', color: 'bg-rose-500' },
                { id: 'mock-6', name: 'Abstract Art', asset_count: 7, icon: 'palette', color: 'bg-purple-500' }
            ]);
          }
      } catch (err) {
          console.error('Vault internal error:', err);
      }
      setLoading(false);
    }
    if (!authLoading) fetchFolders();
  }, [user, authLoading]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !user) return;

    setActionLoading(true);
    try {
      // Generate a nice random color and icon for the new folder
      const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-blue-500', 'bg-rose-500', 'bg-purple-500', 'bg-slate-900'];
      const icons = ['folder', 'star', 'rocket', 'psychology', 'inventory_2', 'architecture'];
      
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];

      const { data, error } = await supabase
        .from('folders')
        .insert({
          name: newFolderName,
          user_id: user.id,
          color: randomColor,
          icon: randomIcon,
          asset_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [data, ...prev.filter(f => typeof f.id !== 'string')]); // Remove mocks when one is created
      setNewFolderName('');
      setIsCreating(false);
    } catch (err: any) {
      alert('Neural sync failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: any) => {
    if (typeof folderId === 'string' && folderId.startsWith('mock-')) {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        return;
    }

    if (!confirm('Are you certain you wish to deconstruct this vault? All metadata will be lost.')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
      setFolders(prev => prev.filter(f => f.id !== folderId));
    } catch (err: any) {
      alert('Erasure failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) return (
    <div className="flex-1 flex flex-col items-center justify-center">
        <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">folder_managed</span>
        </div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest text-center px-6">Establishing Connection to Neural Vault Architecture...</p>
    </div>
  );

  return (
    <div className="flex-1 p-6 sm:p-10 w-full max-w-7xl mx-auto relative z-10">
      {/* Premium Header */}
      <section className="mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                <span className="material-symbols-outlined text-[20px]">folder_managed</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Neural Storage</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Collection <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent italic">Vault</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            The infrastructure for organized prompt engineering and high-fidelity asset management. 
            Maintain systematic control over stylistic versions and technical variations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2.5 px-8 py-4 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-primary transition-all shadow-xl shadow-slate-900/10 hover:shadow-primary/20 active:scale-95">
            <span className="material-symbols-outlined text-[18px]">library_add</span>
            <span>Bulk Sync</span>
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2.5 px-8 py-4 bg-white border border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-2xl hover:border-primary/50 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
            <span>Initialize Vault</span>
          </button>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Create Folder Card */}
        {isCreating && (
             <div className="group bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 flex flex-col h-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Vault Configuration</h3>
                
                <form onSubmit={handleCreateFolder} className="mt-auto space-y-6">
                    <input 
                        autoFocus
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Neural Label..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-600"
                    />
                    <div className="flex gap-2">
                        <button 
                            disabled={actionLoading}
                            type="submit"
                            className="flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            Deploy
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="size-12 flex items-center justify-center bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 transition-all"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </form>
             </div>
        )}

        {folders.map((folder) => (
          <div 
            key={folder.id} 
            className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:border-primary/20 hover:shadow-card transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${folder.color || 'bg-primary'}/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000`}></div>

            {/* Icon Box */}
            <div className={`size-14 rounded-3xl ${folder.color || 'bg-slate-900'} text-white flex items-center justify-center mb-8 shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform duration-500`}>
              <span className="material-symbols-outlined text-2xl">{folder.icon || 'folder'}</span>
            </div>

            {/* Content */}
            <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight group-hover:text-primary transition-colors">
              {folder.name}
            </h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">
              {folder.asset_count || folder.count || 0} System Assets
            </p>
            
            {/* Actions */}
            <div className="flex items-center gap-3 w-full mt-auto relative z-10">
              <button className="flex-1 py-4 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary transition-all shadow-lg shadow-slate-900/10 hover:shadow-primary/20 hover:-translate-y-1">
                Access Vault
              </button>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                }}
                disabled={actionLoading}
                className="size-12 flex items-center justify-center rounded-2xl border border-slate-100 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              </button>
            </div>
          </div>
        ))}
        
        {/* Interactive Placeholder */}
        {!isCreating && (
            <div 
                onClick={() => setIsCreating(true)}
                className="group bg-slate-50/30 backdrop-blur-sm border-2 border-dashed border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-white transition-all min-h-[290px] cursor-pointer"
            >
                <div className="size-14 rounded-full border-2 border-slate-100 flex items-center justify-center mb-4 text-slate-300 group-hover:text-primary group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500">
                    <span className="material-symbols-outlined text-3xl">add_circle</span>
                </div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Neural Prototype</p>
            </div>
        )}
      </div>

      {/* Organization Meta Card - Now Premium */}
      <div className="bg-slate-900 rounded-[3rem] p-12 sm:p-16 text-white relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 rounded-full blur-[120px] -mr-20 group-hover:bg-primary/30 transition-colors duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="size-24 rounded-3xl bg-white text-slate-900 flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700">
            <span className="material-symbols-outlined text-4xl font-black">folder_zip</span>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">Optimization Global</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tighter leading-tight">Sync <span className="text-primary italic">Infrastructure</span></h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
               Maintain systematic control over client assets, stylistic versions, and technical variations with our enterprise-grade encrypted vault system.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 lg:border-l lg:border-white/10 lg:pl-16">
             <div className="text-center">
                <p className="text-5xl font-black text-white mb-2">{folders.filter(f => typeof f.id !== 'string' || !f.id.startsWith('mock-')).length.toString().padStart(2, '0')}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Live Vaults</p>
             </div>
             <div className="text-center">
                <p className="text-5xl font-black text-white mb-2">
                    {folders.reduce((acc, f) => acc + (f.asset_count || f.count || 0), 0).toString().padStart(2, '0')}
                </p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Assets Sync</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
