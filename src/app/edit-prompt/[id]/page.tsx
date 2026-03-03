'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EditPrompt() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    platform: 'Midjourney',
    category: 'Illustration',
    promptText: '',
    price: '',
    image: '',
    creator_id: ''
  });

  useEffect(() => {
    if (promptId) {
      fetchPrompt();
    }
  }, [promptId]);

  const fetchPrompt = async () => {
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      const isTrial = document.cookie.includes('trial_session=true');
      
      let user = sbUser;
      if (!user && isTrial) {
        user = { id: 'trial-id-000' } as any;
      }

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();

      if (error) throw error;
      
      if (data.creator_id !== user.id) {
        setMessage({ type: 'error', text: 'Unauthorized. You do not own this prompt.' });
        setLoading(false);
        return;
      }

      setFormData({
        title: data.title || '',
        platform: data.model || 'Midjourney',
        category: data.category || 'Illustration',
        promptText: data.description || '',
        price: data.price?.toString() || '0',
        image: data.image_url || '',
        creator_id: data.creator_id || ''
      });
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setMessage({ type: 'error', text: 'Failed to load prompt details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      const isTrial = document.cookie.includes('trial_session=true');
      
      let user = sbUser;
      if (!user && isTrial) {
        user = { id: 'trial-id-000' } as any;
      }

      if (!user || (user.id !== formData.creator_id)) throw new Error('Unauthorized or session expired.');

      let imageUrl = formData.image;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image to R2');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const { error } = await supabase
        .from('prompts')
        .update({
          title: formData.title,
          category: formData.category,
          model: formData.platform,
          price: parseInt(formData.price) || 0,
          fiat_price: `$${formData.price}.00`,
          description: formData.promptText,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', promptId)
        .eq('creator_id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Your prompt has been updated successfully!' });
      setTimeout(() => router.push('/profile'), 2000);
    } catch (err: any) {
      console.error('Update Error:', err);
      setMessage({ type: 'error', text: err.message || 'Something went wrong while updating.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Prompt Architecture...</p>
    </div>
  );

  return (
    <div className="flex-1 p-6 sm:p-10 w-full relative z-10">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Form Area */}
          <div className="flex-1 max-w-4xl">
            <header className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
                <span className="material-symbols-outlined text-xs fill-[1]">edit_note</span>
                Architect Studio
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-6">
                Refine Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Creation</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
                Updating your prompt configuration to maintain peak market performance and synchronization.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
              {message && (
                <div className={`p-5 rounded-[2rem] mb-8 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  <div className={`size-10 rounded-xl flex items-center justify-center ${message.type === 'error' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                    <span className="material-symbols-outlined text-xl">{message.type === 'error' ? 'error' : 'check_circle'}</span>
                  </div>
                  {message.text}
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-card border border-slate-100 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="grid grid-cols-1 gap-8 relative z-10">
                  <div className="group">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 group-focus-within:text-primary transition-colors">Prompt Title</label>
                    <div className="relative">
                        <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 text-lg"
                        placeholder="Enter a descriptive title..."
                        type="text"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200">
                             <span className="material-symbols-outlined">title</span>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">AI Platform</label>
                      <div className="relative">
                        <select
                          name="platform"
                          value={formData.platform}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none appearance-none font-bold text-slate-800 cursor-pointer"
                        >
                          <option>ChatGPT</option>
                          <option>Midjourney</option>
                          <option>DALL-E 3</option>
                          <option>Stable Diffusion</option>
                          <option>Claude</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Category</label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none appearance-none font-bold text-slate-800 cursor-pointer"
                        >
                          <option>Illustration</option>
                          <option>Photography</option>
                          <option>Copywriting</option>
                          <option>Programming</option>
                          <option>Marketing</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50 space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Engineered Prompt Command</label>
                    <div className="relative group/textarea">
                        <textarea
                        name="promptText"
                        value={formData.promptText}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none font-mono text-sm leading-relaxed min-h-[180px] transition-all"
                        placeholder="Paste your meticulously crafted prompt architecture here..."
                        ></textarea>
                        <div className="absolute top-5 right-5 text-slate-200 group-focus-within/textarea:text-primary transition-colors">
                            <span className="material-symbols-outlined text-2xl">code</span>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50 space-y-6 relative z-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Credit Valuation</label>
                      <div className="relative group">
                        <input
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          className="w-full px-6 py-4 pl-14 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none font-black text-slate-900 text-xl"
                          type="number"
                        />
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary">
                          <span className="material-symbols-outlined text-2xl fill-[1]">monetization_on</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Update Prototype</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label 
                        htmlFor="image-upload"
                        className="flex items-center justify-center gap-3 w-full h-[60px] bg-slate-900 text-white rounded-2xl cursor-pointer hover:bg-primary transition-all active:scale-95 shadow-lg shadow-slate-900/10 font-bold text-sm"
                      >
                        <span className="material-symbols-outlined text-xl">image</span>
                        <span>{imageFile ? 'New Image Ready' : 'Replace Media Asset'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
                <Link 
                  href="/profile"
                  className="px-8 py-4 font-black text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3 text-xs uppercase tracking-widest bg-white border border-slate-100 rounded-2xl hover:border-slate-300"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                  Abort Changes
                </Link>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                    className="flex-1 sm:flex-none px-10 py-5 bg-primary text-white font-black hover:brightness-110 shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs rounded-2xl active:scale-95 disabled:opacity-50" 
                    type="submit"
                    disabled={submitting}
                    >
                    <span>{submitting ? 'Syncing...' : 'Deploy Updates'}</span>
                    <span className="material-symbols-outlined text-lg">{submitting ? 'sync' : 'published_with_changes'}</span>
                    </button>
                </div>
              </div>
            </form>
          </div>

          {/* Real-time Preview Sidebar */}
          <div className="lg:w-96">
            <div className="sticky top-10">
              <header className="mb-8 flex items-center justify-between px-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Architecture Preview</h2>
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                     <span className="material-symbols-outlined text-lg">visibility</span>
                </div>
              </header>

              <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-card border border-slate-100 flex flex-col relative hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-square overflow-hidden bg-slate-900">
                  <img
                    src={formData.image || 'https://via.placeholder.com/400'}
                    alt="Preview Prototype"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest border border-white/20 shadow-sm">
                    {formData.category}
                  </div>
                  <div className="absolute top-6 right-6 size-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-primary shadow-sm">
                       <span className="material-symbols-outlined text-[20px] fill-[1]">bolt</span>
                  </div>
                </div>
                <div className="p-10">
                  <h4 className="font-black text-2xl text-slate-900 mb-8 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {formData.title || 'Untitled Prototype'}
                  </h4>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">${formData.price}</span>
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">USD</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                             <span className="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                       <div className="size-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                            <span className="material-symbols-outlined text-lg">info</span>
                       </div>
                       <h4 className="font-bold text-slate-900 text-sm">Deployment Guide</h4>
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Changes takes exactly 2-3 seconds to propagate through the global neural network. Ensure your price reflects the complexity of the command.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
