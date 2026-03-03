'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

export default function PromptDetails() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const { user } = useAuth();
    const [prompt, setPrompt] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this prompt architecture? This action cannot be undone.')) return;
        
        setIsDeleting(true);
        const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', id);
        
        if (!error) {
            router.push('/profile');
        } else {
            alert('Failed to delete: ' + error.message);
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        async function fetchPrompt() {
            setLoading(true);
            try {
                // Try database fetch
                const { data, error } = await supabase
                    .from('prompts')
                    .select(`
                        *,
                        profiles:creator_id (
                            id,
                            full_name,
                            username,
                            avatar_url,
                            bio
                        ),
                        prompt_media (*)
                    `)
                    .eq('id', id)
                    .single();
                
                if (data && !error) {
                    setPrompt(data);
                } else {
                    // Fallback to local data
                    const { promptData } = require('@/lib/data');
                    const localPrompt = promptData.find((p: any) => p.id === Number(id) || p.id === id);
                    if (localPrompt) setPrompt(localPrompt);
                }
            } catch (e) {
                // Fallback on total failure
                const { promptData } = require('@/lib/data');
                const localPrompt = promptData.find((p: any) => p.id === Number(id) || p.id === id);
                if (localPrompt) setPrompt(localPrompt);
            }
            setLoading(false);
        }
        if (id) fetchPrompt();
    }, [id]);
    
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-light">Loading Architecture...</div>;
    
    if (!prompt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Prompt Not Found</h1>
                    <Link href="/" className="text-primary hover:underline">Return to Marketplace</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Main Page Content */}
            <div className="flex-1 overflow-y-auto">
                <main className="max-w-7xl mx-auto px-4 py-6">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
                        <Link href="/" className="hover:text-primary transition-colors">Marketplace</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span>{(prompt.category || 'Architecture').split(' • ')[0]}</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-primary">{prompt.title || 'Masterpiece'}</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* LEFT COLUMN: Main Content */}
                        <div className="flex-1 space-y-12">
                            {/* Hero Section & Title */}
                             <div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">{prompt.title}</h1>
                                    
                                    {/* Creator Actions */}
                                    {user && prompt.creator_id === user.id && (
                                        <div className="flex items-center gap-3">
                                            <Link href={`/edit-prompt/${prompt.id}`} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl flex items-center gap-2 hover:border-primary hover:text-primary transition-all shadow-sm">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                Edit Asset
                                            </Link>
                                            <button 
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="px-6 py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-2xl flex items-center gap-2 hover:border-red-500 hover:text-red-500 transition-all shadow-sm disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">{isDeleting ? 'sync' : 'delete'}</span>
                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shadow-sm shadow-primary/10 uppercase">
                                            {prompt.profiles?.full_name ? prompt.profiles.full_name.split(' ').map((n:any) => n[0]).join('').slice(0,2) : prompt.profiles?.username?.slice(0,2) || '??'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Created by</p>
                                            <p className="text-sm font-bold text-slate-900">{prompt.profiles?.full_name || prompt.profiles?.username || 'Elite Creator'}</p>
                                        </div>
                                    </div>
                                    <div className="h-6 w-px bg-slate-100"></div>
                                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                                        <span className="material-symbols-outlined text-[16px] fill-[1]">verified</span>
                                        {prompt.category || 'Architecture'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                        <div className="flex -space-x-1">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="size-4 rounded-full border-2 border-white bg-slate-200" />
                                            ))}
                                        </div>
                                        <span>({prompt.sales_count || '1.2K'} Reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Media Gallery with modern depth */}
                            <div className="space-y-6">
                                <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden relative group border-4 border-white shadow-card">
                                    <img
                                        alt="Main Preview"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        src={prompt.image_url}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="size-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <span className="material-symbols-outlined text-4xl">zoom_in</span>
                                        </div>
                                    </button>
                                </div>
                                
                                {/* Thumbnail Gallery */}
                                <div className="grid grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="aspect-square rounded-[1.5rem] overflow-hidden relative group border-2 border-white shadow- premium cursor-pointer transition-all hover:scale-105 active:scale-95">
                                            <img
                                                alt={`Thumbnail ${i}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                src={`https://picsum.photos/seed/thumb${i}/400/400.jpg`}
                                            />
                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prompt Description */}
                            <section className="space-y-8">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                                    <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    Prompt Details
                                </h2>
                                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                                    {prompt.full_description}
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 pt-4">
                                    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8"></div>
                                        <h4 className="font-bold text-sm text-slate-900 mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                                            Key Features
                                        </h4>
                                        <ul className="space-y-4">
                                            {[
                                                'Photorealistic texture mapping',
                                                'Dynamic lighting parameters',
                                                'Modular prompt structure',
                                                'Negative prompt optimization'
                                            ].map(item => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                                    <div className="size-1.5 rounded-full bg-primary/40" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-3xl -mr-8 -mt-8"></div>
                                        <h4 className="font-bold text-sm text-slate-900 mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-accent">settings_suggest</span>
                                            Configurations
                                        </h4>
                                        <ul className="space-y-4">
                                            {[
                                                'Optimized for Midjourney v6+',
                                                'Multi-aspect ratio support',
                                                'Custom variable placeholders',
                                                'Includes raw parameter set'
                                            ].map(item => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                                    <div className="size-1.5 rounded-full bg-accent/40" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Locked Prompt with Modern Premium Look */}
                            <section className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-slate-900">The Engineered Prompt</h2>
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        Protected Asset
                                    </div>
                                </div>
                                <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-slate-100">
                                    <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-3xl z-10 flex items-center justify-center p-8">
                                        <div className="text-center p-12 bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white max-w-lg shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                                            <div className="size-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                                <span className="material-symbols-outlined text-4xl">key_visualizer</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">Access Required</h3>
                                            <p className="text-slate-500 mb-10 font-medium leading-relaxed">
                                                Initialize synchronization with <span className="text-primary font-bold">{prompt.price} Credits</span> to reveal the high-precision engineered prompt architecture.
                                            </p>
                                            <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined">bolt</span>
                                                Unlock Architecture
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-12 select-none pointer-events-none opacity-20">
                                        <p className="font-mono text-lg leading-relaxed text-slate-900">
                                            /imagine prompt: engineering_structure_{prompt.id} <br />
                                            --style raw --v 6.0 --ar 16:9 <br />
                                            Lighting: volumetric_fog, neon_red_cyan_interplay, rim_light_700 <br />
                                            Texture: intricate_fiber_optics, weathered_chrome, facial_displacement_mapping <br />
                                            Negative: low_res, blurry, distorted_anatomy, generic_sci_fi, oversaturated_yellows
                                        </p>
                                    </div>
                                </div>
                            </section>

                            
                            {/* Modern Reviews Section */}
                            <section className="space-y-12 pt-16 border-t border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">User Experience</h2>
                                        <p className="text-slate-500 font-medium tracking-tight text-sm">Feedback from verified prompt engineers</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center justify-center p-5 bg-green-50 rounded-3xl border border-green-100 min-w-[120px]">
                                            <span className="font-black text-2xl text-green-600">92%</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 mt-1">Consistency</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-5 bg-indigo-50 rounded-3xl border border-indigo-100 min-w-[120px]">
                                            <span className="font-black text-2xl text-indigo-600">4.9</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-1">Average</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {/* Review 1 */}
                                    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">JD</div>
                                                <div>
                                                    <p className="font-bold text-sm">JohnDoe.ai</p>
                                                    <p className="text-xs text-slate-500">2 days ago • Purchased</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-xl text-xs font-bold">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                WORKS
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"The lighting parameters are absolutely spot on. I used this for a character design project and it saved me hours of tweaking. Highly recommend!"</p>
                                    </div>
                                    {/* Review 2 */}
                                    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">SM</div>
                                                <div>
                                                    <p className="font-bold text-sm">SaraMind</p>
                                                    <p className="text-xs text-slate-500">1 week ago • Purchased</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-xl text-xs font-bold">
                                                <span className="material-symbols-outlined text-sm">pending</span>
                                                PARTIAL
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"The prompt works great for MJ v6, but struggled a bit with DALL-E 3 syntax. Had to manually rewrite some parts to get the same level of detail."</p>
                                    </div>
                                    {/* Review 3 */}
                                    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-lg">AK</div>
                                                <div>
                                                    <p className="font-bold text-sm">AlexKode</p>
                                                    <p className="text-xs text-slate-500">2 weeks ago • Purchased</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-xl text-xs font-bold">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                WORKS
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"Outstanding quality and consistency. The modular structure makes it easy to adapt for different characters. Worth every credit!"</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Sticky Purchase Sidebar */}
                        <aside className="lg:w-96">
                            <div className="sticky top-24 space-y-6">
                                <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-card relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20"></div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/10">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                            </span>
                                            Instant Access
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-5xl font-black text-slate-900 tracking-tight">${prompt.price || '0'}</span>
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">USD</span>
                                    </div>
                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Platform Free</span>
                                            <span className="text-slate-900 font-bold">Included</span>
                                        </div>
                                        <div className="h-[1px] bg-slate-50"></div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Commercial License</span>
                                            <span className="text-slate-900 font-bold">Personal</span>
                                        </div>
                                    </div>
                                    <button className="w-full bg-slate-900 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-slate-900/10 hover:bg-primary hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-xl">payments</span>
                                        Purchase Now
                                    </button>
                                    <p className="mt-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secure transaction via Stripe</p>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors"></div>
                                    <h3 className="font-bold text-xs mb-8 uppercase tracking-widest text-slate-500 relative z-10">Performance Metrics</h3>
                                    <div className="grid grid-cols-2 gap-8 relative z-10 px-2">
                                        <div className="border-l border-white/10 pl-4 py-1">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">Total Sales</p>
                                            <p className="text-3xl font-black">{prompt.sales_count || 0}</p>
                                        </div>
                                        <div className="border-l border-white/10 pl-4 py-1">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">Reliability</p>
                                            <p className="text-3xl font-black">9.8/10</p>
                                        </div>
                                        <div className="col-span-2 pt-4">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-4 tracking-wider">Verified Environments</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(prompt.verified_models || []).map((model: string, idx: number) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-white/5 rounded-xl text-[10px] font-bold border border-white/10 hover:bg-white/10 transition-colors uppercase">{model}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                <footer className="mt-20 border-t border-slate-200 bg-white py-16">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg text-white">
                                <span className="material-symbols-outlined text-xl block">electric_bolt</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">PromptMarket</h2>
                        </div>
                        <div className="flex gap-10 text-sm font-bold text-slate-400 uppercase tracking-widest">
                            <a className="hover:text-primary transition-colors" href="#">Terms</a>
                            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
                            <a className="hover:text-primary transition-colors" href="#">Support</a>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[18px]">public</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
