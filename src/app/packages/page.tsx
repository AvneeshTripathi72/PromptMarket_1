'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Packages() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageName: string, priceAmount: number) => {
    setLoading(packageName);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName, priceAmount }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        // Fallback for demo when Stripe is not configured
        if (data.error.includes('Stripe Secret Key is missing') || data.error.includes('Missing Stripe Secret Key')) {
            alert('SYSTEM NOTE: Stripe is not configured. Redirecting to mock success for demo.');
            window.location.href = '/profile?session_id=mock_success';
        } else {
            alert(data.error);
        }
      }
    } catch (err) {
      console.error('Checkout Error:', err);
      alert('Neural sync failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 pb-32">
      {/* Dynamic Background Element */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header Section */}
      <section className="mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-slate-100">
            <span className="material-symbols-outlined text-[14px]">token</span>
            Resource Acquisition
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 mb-6 uppercase italic">
          System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Upgrades</span>
        </h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
           Elite infrastructure for the modern prompt engineer. <br className="hidden md:block"/> 
           Acquire high-performance credits to fuel your production pipeline.
        </p>
      </section>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 items-end">
        {/* Package 1 */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-10">
          <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">rocket_launch</span>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">Starter Protocol</h3>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-10">Entry-Level Module</p>
          
          <div className="space-y-4 mb-12">
            {[
              '50 System Credits',
              '5 Technical Templates',
              'Standard Matrix Access',
              'Community Directory'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="size-5 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500 text-[14px] font-black">check</span>
                </div>
                <span className="text-slate-600 text-xs font-bold uppercase tracking-tight">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">$49.00</span>
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">FIX_VAL</span>
            </div>
            <button 
              onClick={() => handlePurchase('Starter Protocol', 49)}
              disabled={loading !== null}
              className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading === 'Starter Protocol' ? 'INITIALIZING...' : 'ACQUIRE START_MOD'}
              <span className="material-symbols-outlined text-lg">{loading === 'Starter Protocol' ? 'sync' : 'arrow_forward'}</span>
            </button>
          </div>
        </div>

        {/* Package 2 - FEATURED PRO */}
        <div className="bg-slate-900 rounded-[3rem] flex flex-col group hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 transition-all duration-500 p-12 relative overflow-hidden h-fit md:h-[650px] border border-white/5">
          {/* Animated Glow Backdrop */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-700"></div>
          
          <div className="absolute top-6 right-8 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-primary/30">
            Peak Performance
          </div>

          <div className="size-16 bg-white/5 rounded-3xl flex items-center justify-center mb-10 border border-white/10 group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500">
            <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors">diamond</span>
          </div>
          
          <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight italic">Professional Sync</h3>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] mb-12">Production Ready</p>
          
          <div className="space-y-5 mb-14">
            {[
              '250 System Credits',
              '25 Technical Templates',
              'Advanced Architecture',
              'Direct Override Support',
              'Alpha Release Access'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className="size-6 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[16px] font-black">verified</span>
                </div>
                <span className="text-white text-[13px] font-black uppercase tracking-tight">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-10">
              <span className="text-5xl font-black text-primary tracking-tighter shadow-primary/20">$129.00</span>
              <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">OPT_UPGRADE</span>
            </div>
            <button 
                onClick={() => handlePurchase('Professional Sync', 129)}
                disabled={loading !== null}
                className="w-full py-6 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading === 'Professional Sync' ? 'AUTHORIZING...' : 'UPGRADE PROTOCOL'}
              <span className="material-symbols-outlined text-xl">{loading === 'Professional Sync' ? 'sync' : 'bolt'}</span>
            </button>
          </div>
        </div>

        {/* Package 3 */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-10">
          <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 transition-all duration-500">
            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-slate-900 transition-colors">corporate_fare</span>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">Mainframe Access</h3>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-10">Enterprise Solution</p>
          
          <div className="space-y-4 mb-12">
            {[
              'Unlimited Grid Output',
              'Custom Vector Dev',
              'API Layer Protocol',
              'Dedicated Node Lead',
              'System Core Reports'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="size-5 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-[14px]">check</span>
                </div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-tight italic">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-black text-slate-300 tracking-tighter opacity-50">$499.00</span>
              <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">ENT_GRID</span>
            </div>
            <button 
              onClick={() => handlePurchase('Mainframe Access', 499)}
              disabled={loading !== null}
              className="w-full py-5 bg-white border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-900/5"
            >
              {loading === 'Mainframe Access' ? 'ESTABLISHING...' : 'REQUEST MAINFRAME'}
              <span className="material-symbols-outlined text-lg">{loading === 'Mainframe Access' ? 'sync' : 'lan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trust Banner - MODERN HIGH TECH */}
      <div className="bg-slate-900 rounded-[3rem] p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[30%] h-[60%] bg-primary/20 blur-[150px] rounded-full"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10">
                <span className="material-symbols-outlined text-[12px]">security</span>
                Global Network Integrity
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6 uppercase leading-tight">
               Standardized by <span className="text-primary italic">12,000+</span> Operators Worldwide
            </h2>
            <p className="text-slate-400 text-sm font-medium tracking-tight leading-relaxed">
              High-performance infrastructure optimized for prompt asset engineering. Our dedicated grid ensures sub-millisecond data synchronization across global edge nodes.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20">
            <div className="text-center group">
              <p className="text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors duration-300">99.8%</p>
              <div className="h-0.5 w-10 bg-primary/30 mx-auto my-3 group-hover:w-full transition-all"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Service Uptime</p>
            </div>
            <div className="text-center group">
              <p className="text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors duration-300">24/7</p>
              <div className="h-0.5 w-10 bg-primary/30 mx-auto my-3 group-hover:w-full transition-all"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Core Sync</p>
            </div>
            <div className="text-center group col-span-2 sm:col-span-1">
              <p className="text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors duration-300">&lt;15ms</p>
              <div className="h-0.5 w-10 bg-primary/30 mx-auto my-3 group-hover:w-full transition-all"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Global Latency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
