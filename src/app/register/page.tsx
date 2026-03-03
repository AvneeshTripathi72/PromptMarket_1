'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data.user && data.session) {
        router.push('/profile');
      } else {
        setMessage({ type: 'success', text: 'Success! Your account has been created. You can now sign in.' });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setMessage({ 
        type: 'error', 
        text: 'Connection failed. Please check your internet or if your Supabase project is active.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl fill-[1]">bolt</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900">PromptMarket</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Create Account</h1>
          <p className="text-slate-500 font-medium text-lg">Join the global elite of prompt engineers.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-card border border-slate-100 p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          {message && (
            <div className={`p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              <span className="material-symbols-outlined text-lg">{message.type === 'error' ? 'error' : 'check_circle'}</span>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">alternate_email</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-4 ring-primary/5 focus:border-primary/20 focus:bg-white transition-all font-medium text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Choose Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">lock</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-4 ring-primary/5 focus:border-primary/20 focus:bg-white transition-all font-medium text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 font-black transition-all disabled:opacity-50 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? 'Initializing...' : (
                  <>
                    Confirm Registration
                    <span className="material-symbols-outlined text-xl">person_add</span>
                  </>
                )}
              </button>
              
              <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
                <p className="text-slate-500 font-medium">
                  Already have an account? 
                  <Link href="/login" className="ml-2 text-primary font-bold hover:underline underline-offset-4">Sign In</Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
