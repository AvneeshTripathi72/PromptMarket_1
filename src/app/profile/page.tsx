'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';


export default function Profile() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [userPrompts, setUserPrompts] = useState<any[]>([]);
    const [loadingPrompts, setLoadingPrompts] = useState(true);
    const [userFolders, setUserFolders] = useState<any[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [activeSection, setActiveSection] = useState<'prompts' | 'sales' | 'packages' | 'folders'>('prompts');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchUserPrompts();
            fetchUserFolders();
        }
    }, [user]);

    const fetchUserFolders = async () => {
        setLoadingFolders(true);
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setUserFolders(data);
        }
        setLoadingFolders(false);
    };

    const fetchUserPrompts = async () => {
        setLoadingPrompts(true);
        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('creator_id', user?.id)
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setUserPrompts(data);
        }
        setLoadingPrompts(false);
    };

    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();
        
        if (data) setProfile(data);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadRes.ok) {
            console.error('Failed to upload to R2');
            return;
        }

        const { url: publicUrl } = await uploadRes.json();

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

        if (!updateError) {
            fetchProfile();
        }
    };

    const handleDelete = async (promptId: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you certain you wish to deconstruct this asset from the registry? This erasure is permanent.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('prompts')
                .delete()
                .eq('id', promptId);

            if (!error) {
                // Use optimistic clearing for instantaneous feedback
                setUserPrompts(prev => prev.filter(p => String(p.id) !== String(promptId)));
            } else {
                alert('Erasure protocol failed: ' + error.message);
            }
        } catch (err: any) {
            console.error('Core deletion error:', err);
        }
    };

    if (authLoading) return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-spin mb-4">
                <span className="material-symbols-outlined text-primary">sync</span>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Neural Connection Establishing...</p>
        </div>
    );
    if (!user) return (
        <div className="flex-1 flex flex-col items-center justify-center p-10">
            <h2 className="text-3xl font-black mb-4">Neural Protocol Required</h2>
            <Link href="/login" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                Login to Access Feed
            </Link>
        </div>
    );

    return (
        <div className="flex-1 p-6 sm:p-10 w-full relative z-10">
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 mb-12 shadow-card border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-primary/10 duration-700"></div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                />

                <div className="flex flex-col md:flex-row gap-10 items-start relative z-10 transition-all">
                    <div 
                        className="relative group/avatar cursor-pointer shrink-0" 
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[2rem] overflow-hidden border-4 border-white shadow-card p-1 bg-white relative">
                            <img
                                src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5NVkO5I5Y5ADmTu5nHMEiGCYl68Vq3XbAUO40vdKlbhDYxoE2wCfDFQLp88bR26qaiQKfBx0CDZdmyilOhB3evvEwvUfMQOnybArTv4owqwuNhYytyh9Jie5Qwwt5sTJRDpFuPtY7YRKZgkMyg63f7lnBCxAx7PagW6kMcpuXyqEgc3hwXhJcGAvMUfRyvP66ChahF-zXw_EnLTWmiLNRBAvbEpMuwoza7OWgMk3-XHxmuQkB9cIG-Y_oj3LCkt6ztRl7DpxKLpo'}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover rounded-[1.6rem] bg-slate-50 transition-transform duration-700 group-hover/avatar:scale-110"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all backdrop-blur-[2px]">
                                <span className="material-symbols-outlined text-white text-3xl">camera_alt</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 size-10 bg-emerald-500 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                            <span className="material-symbols-outlined text-sm">bolt</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full text-center md:text-left pt-2">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                            <div className="space-y-3">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 break-words max-w-[500px]">
                                        {profile?.full_name || user.email?.split('@')[0]}
                                    </h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                            <span className="material-symbols-outlined text-xs fill-[1]">verified</span>
                                            Verified Pro
                                        </div>
                                        {profile?.role === 'admin' && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                                                <span className="material-symbols-outlined text-xs fill-[1]">shield_person</span>
                                                System Admin
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center md:justify-start gap-2">
                                    <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                                    {profile?.username || `@${user.email?.split('@')[0]}`}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50/50 p-1.5 rounded-[1.5rem] border border-slate-100/50">
                                {[
                                    { id: 'prompts', icon: 'grid_view', label: 'Prompts' },
                                    { id: 'sales', icon: 'account_balance_wallet', label: 'Wallet' },
                                    { id: 'packages', icon: 'inventory_2', label: 'Packages' },
                                    { id: 'folders', icon: 'folder', label: 'Collections' }
                                ].map(section => (
                                    <button 
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id as any)}
                                        className={`px-5 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all duration-500 group/nav ${
                                            activeSection === section.id 
                                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                                                : 'text-slate-400 hover:text-slate-900 hover:bg-white'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${activeSection === section.id ? '' : 'group-hover/nav:scale-110'}`}>{section.icon}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{section.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="max-w-3xl mb-10 p-6 rounded-[2rem] bg-slate-50/30 border border-slate-100/50">
                             <p className="text-slate-600 font-medium leading-relaxed text-base sm:text-lg">
                                {profile?.bio || 'Initializing neural identity architecture... Protocol awaiting configuration.'}
                             </p>
                        </div>

                        <div className="grid grid-cols-3 gap-10 lg:gap-24 relative">
                            <div className="group/stat">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-4">Portfolio</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter transition-transform group-hover/stat:scale-110 duration-500 origin-left">
                                        {userPrompts.length.toString().padStart(2, '0')}
                                    </p>
                                    <span className="text-xs font-bold text-slate-300 uppercase">Assets</span>
                                </div>
                            </div>
                            <div className="group/stat">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-4">Earnings</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter transition-transform group-hover/stat:scale-110 duration-500 origin-left">
                                        {userPrompts.reduce((acc, p) => acc + ((p.downloads || 0) * (p.price || 0)), 0).toLocaleString()}
                                    </p>
                                    <span className="text-xs font-bold text-emerald-500 uppercase">SYC</span>
                                </div>
                            </div>
                            <div className="group/stat">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-4">Balance</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-4xl font-black text-primary tracking-tighter transition-transform group-hover/stat:scale-110 duration-500 origin-left">
                                        {profile?.credits || 0}
                                    </p>
                                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                        <span className="material-symbols-outlined text-[20px] fill-[1]">monetization_on</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeSection === 'prompts' && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
                        <div className="flex flex-col gap-6 w-full lg:col-span-1">
                            <Link href="/post-prompt" className="aspect-[4/3] rounded-[2rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center p-8 group hover:border-primary/50 transition-all cursor-pointer bg-white shadow-premium hover:shadow-2xl">
                                <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all">
                                    <span className="material-symbols-outlined text-primary text-3xl">add_circle</span>
                                </div>
                                <p className="font-black text-slate-400 group-hover:text-primary transition-colors text-sm uppercase tracking-widest">Prompt Adder</p>
                            </Link>

                            <Link href="/bulk-upload" className="aspect-[4/3] rounded-[2rem] border-2 border-dashed border-accent/20 flex flex-col items-center justify-center p-8 group hover:border-accent/50 transition-all cursor-pointer bg-white shadow-premium hover:shadow-2xl">
                                <div className="size-16 rounded-3xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-all">
                                    <span className="material-symbols-outlined text-accent text-3xl">layers</span>
                                </div>
                                <p className="font-black text-slate-400 group-hover:text-accent transition-colors text-sm uppercase tracking-widest text-center">Bulk Prompt</p>
                            </Link>
                        </div>

                        {loadingPrompts ? (
                            <div className="lg:col-span-3 py-20 text-center">
                                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Neural Data...</p>
                            </div>
                        ) : userPrompts.length > 0 ? (
                            userPrompts.map((prompt) => (
                                <div key={prompt.id} className="relative group bg-white rounded-[2.5rem] overflow-hidden shadow-card hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full hover:-translate-y-2">
                                    <Link 
                                        href={`/prompt/${prompt.id}`} 
                                        className="absolute inset-0 z-10"
                                        aria-label={`View details for ${prompt.title}`}
                                    />

                                    <div className="absolute top-5 right-5 z-[40] flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <Link 
                                            href={`/edit-prompt/${prompt.id}`} 
                                            onClick={(e) => e.stopPropagation()} 
                                            className="size-11 rounded-2xl bg-white text-slate-900 hover:text-primary hover:scale-110 shadow-2xl flex items-center justify-center transition-all border border-slate-100"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </Link>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(prompt.id, e);
                                            }}
                                            className="size-11 rounded-2xl bg-white text-slate-400 hover:text-red-500 hover:scale-110 shadow-2xl flex items-center justify-center transition-all border border-slate-100"
                                            title="Permanently remove asset"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>

                                    <div className="relative aspect-square overflow-hidden bg-slate-900">
                                        <img
                                            src={prompt.image_url || prompt.image || 'https://via.placeholder.com/400'}
                                            alt={prompt.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-slate-900 uppercase tracking-widest border border-white/20">
                                            {prompt.category}
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <h4 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors mb-6 line-clamp-2">
                                            {prompt.title}
                                        </h4>
                                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-lg fill-[1]">bolt</span>
                                                <span className="text-xl font-black text-slate-900">${prompt.price}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl">
                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                    <span className="text-xs font-bold">{prompt.downloads || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="lg:col-span-3 py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">inventory_2</span>
                                <p className="text-slate-500 font-bold mb-6">Your portfolio is currently a void.</p>
                                <Link href="/post-prompt" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all inline-block text-sm">
                                    Deploy First Asset
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeSection === 'sales' && (
                <div className="space-y-8 relative">
                    <button 
                        onClick={() => setActiveSection('prompts')}
                        className="absolute top-0 right-0 p-2 rounded-lg hover:bg-slate-100 transition-colors z-20"
                    >
                        <span className="material-symbols-outlined text-slate-600 text-xl">close</span>
                    </button>

                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Internal Wallet</h1>
                        <p className="text-slate-500 mt-2 text-base sm:text-lg">Track your earnings and usage across the marketplace.</p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                            <div className="bg-primary rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-primary-100 text-sm font-medium uppercase tracking-widest opacity-80">Available Credits</p>
                                    <div className="mt-4 flex items-baseline gap-2">
                                        <span className="text-5xl sm:text-6xl font-bold tracking-tighter">{profile?.credits || 0}.00</span>
                                        <span className="text-xl sm:text-2xl font-medium opacity-70">CR</span>
                                    </div>
                                    <div className="mt-8 flex items-center gap-4">
                                        <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            <span className="text-sm font-medium">+12.5% this month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-slate-800 font-bold">Credit Activity (30 Days)</h3>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">Month</button>
                                        <button className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">Year</button>
                                    </div>
                                </div>
                                <div className="h-48 w-full">
                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 150">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                                <stop offset="0%" stopColor="#2b4bee" stopOpacity="0.15"></stop>
                                                <stop offset="100%" stopColor="#2b4bee" stopOpacity="0"></stop>
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,120 C50,110 80,40 120,60 S180,100 250,80 S350,20 420,40 S500,10 500,10 L500,150 L0,150 Z" fill="url(#chartGradient)"></path>
                                        <path d="M0,120 C50,110 80,40 120,60 S180,100 250,80 S350,20 420,40 S500,10 500,10" fill="none" stroke="#2b4bee" strokeLinecap="round" strokeWidth="3"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                                <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="text-slate-800 font-bold text-sm sm:text-base">Recent Activity</h3>
                                    <button className="text-primary text-sm font-semibold hover:underline text-xs sm:text-sm">View All</button>
                                </div>
                                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
                                    <div className="p-3 sm:p-5 hover:bg-slate-50/80 transition-colors group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 sm:size-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm sm:text-lg">shopping_cart</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">Cyberpunk Portrait</p>
                                                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Prompt Purchase • Today</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-red-500">-20.00</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">CR</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-5 hover:bg-slate-50/80 transition-colors group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 sm:size-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm sm:text-lg">sell</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">Minimalist Logo Gen</p>
                                                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Sale Earning • Yesterday</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-500">+45.00</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">CR</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">trending_down</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Spent</p>
                                <p className="text-xl font-bold text-slate-800">450.00 CR</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifetime Earned</p>
                                <p className="text-xl font-bold text-slate-800">12.4K CR</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">auto_graph</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profit Margin</p>
                                <p className="text-xl font-bold text-emerald-500">84%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'packages' && (
                <div className="space-y-8 relative">
                    <button 
                        onClick={() => setActiveSection('prompts')}
                        className="absolute top-0 right-0 p-2 rounded-lg hover:bg-slate-100 transition-colors z-20"
                    >
                        <span className="material-symbols-outlined text-slate-600 text-xl">close</span>
                    </button>

                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Premium Packages</h1>
                        <p className="text-slate-500 mt-2 text-base sm:text-lg">One-time purchase bundles designed for creators and businesses.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                            <div className="h-2 bg-primary"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined">rocket_launch</span>
                                    </div>
                                    <span className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Best Value</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Starter Bundle</h3>
                                <p className="text-slate-500 text-sm mb-6">Perfect for individual creators starting their AI journey.</p>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">50 Prompt Credits</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">5 High-Quality Prompt Templates</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">Basic Analytics Dashboard</span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold text-slate-800">$49</span>
                                        <span className="text-slate-400 text-sm">/one-time</span>
                                    </div>
                                    <button className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-primary transition-all active:scale-95">Get Started</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-primary/20 shadow-lg shadow-primary/5 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform scale-105">
                            <div className="h-2 bg-primary"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined">diamond</span>
                                    </div>
                                    <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Popular</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Creator Pro</h3>
                                <p className="text-slate-500 text-sm mb-6">Unleash your full potential with advanced tools and features.</p>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">200 Prompt Credits</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">15 Premium Prompt Templates</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">Advanced Prompt Architecture</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">Priority Support</span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold text-slate-800">$129</span>
                                        <span className="text-slate-400 text-sm">/one-time</span>
                                    </div>
                                    <button className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">Get Started</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                            <div className="h-2 bg-slate-800"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-slate-100 text-slate-800">
                                        <span className="material-symbols-outlined">corporate_fare</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Enterprise Plan</h3>
                                <p className="text-slate-500 text-sm mb-6">Complete solution for agencies and large organizations.</p>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">Unlimited Prompt Credits</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">Custom Prompt Engineering</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">API Access & Integration</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-600">Dedicated Account Manager</span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold text-slate-800">$499</span>
                                        <span className="text-slate-400 text-sm">/one-time</span>
                                    </div>
                                    <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-all active:scale-95">Contact Sales</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                <span className="material-symbols-outlined">verified</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Secure Purchase</h4>
                                <p className="text-xs text-slate-500">Fast delivery, direct to your profile dashboard.</p>
                            </div>
                        </div>
                        <div className="flex -space-x-2">
                             {[1,2,3,4].map(i => (
                                <div key={i} className="size-8 rounded-full border-2 border-white bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=${i})` }}></div>
                             ))}
                             <div className="size-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">+1.2k creators are already using these.</div>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'folders' && (
                <div className="space-y-8 relative">
                    <button 
                        onClick={() => setActiveSection('prompts')}
                        className="absolute top-0 right-0 p-2 rounded-lg hover:bg-slate-100 transition-colors z-20"
                    >
                        <span className="material-symbols-outlined text-slate-600 text-xl">close</span>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Your Folders</h1>
                            <p className="text-slate-500 mt-2 text-base sm:text-lg">Organize your prompts into custom collections.</p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
                            <span className="material-symbols-outlined">create_new_folder</span>
                            <span>New Folder</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 tracking-tight">
                        {userFolders.map((folder) => (
                            <div key={folder.id} className="group bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col items-center text-center hover:-translate-y-2">
                                <div className={`size-20 rounded-[2rem] ${folder.color || 'bg-slate-900'} text-white flex items-center justify-center mb-6 shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform duration-500`}>
                                    <span className="material-symbols-outlined text-4xl">{folder.icon || 'folder'}</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-1">{folder.name}</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{folder.asset_count || 0} System Assets</p>
                                
                                <div className="mt-8 flex items-center gap-3 w-full">
                                    <Link href="/folders" className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-900/10 hover:shadow-primary/20 text-center">
                                        Access Vault
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                         <div className="flex items-center gap-4">
                             <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center">
                                 <span className="material-symbols-outlined">analytics</span>
                             </div>
                             <div>
                                 <h4 className="font-extrabold text-slate-800">Organization Power</h4>
                                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                    You have {userFolders.length} active vaults with {userPrompts.length} total prompts synchronized.
                                 </p>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
}
