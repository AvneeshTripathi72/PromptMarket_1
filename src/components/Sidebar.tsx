'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    // Clear trial session if active
    document.cookie = "trial_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Left Navigation Sidebar */}
      <nav className="w-20 lg:flex flex-col items-center sticky top-0 h-screen py-8 shrink-0 hidden z-50 border-r border-slate-100 bg-white/70 backdrop-blur-xl">
        
        <Link href="/" className="relative z-10 flex flex-col items-center mb-12 group">
          <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl block">electric_bolt</span>
          </div>
        </Link>

        <div className="relative z-10 flex flex-col items-center gap-3 w-full px-3 flex-1">
          {[
            { href: '/', icon: 'explore', label: 'Feed' },
            { href: '/packages', icon: 'auto_awesome_motion', label: 'Packs' },
            { href: '/folders', icon: 'folder', label: 'Saved' },
            { href: '/profile', icon: 'person_outline', label: 'Me' }
          ].map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center justify-center gap-1.5 w-full py-3.5 transition-all rounded-2xl relative group ${
                isActive(item.href) 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive(item.href) ? 'fill-[1]' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
              {isActive(item.href) && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
            </Link>
          ))}
        </div>
        
        {/* Bottom Actions */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-full px-4">
          <div className="w-full border-t border-slate-100 pt-6 pb-2 flex flex-col items-center gap-6">
            {user ? (
                <button 
                onClick={handleLogout}
                className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                <span className="material-symbols-outlined text-[22px]">logout</span>
                </button>
            ) : (
                <Link 
                href="/login"
                className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                >
                <span className="material-symbols-outlined text-[22px]">login</span>
                </Link>
            )}

            <div className="flex flex-col items-center bg-slate-50 w-full py-3 rounded-2xl border border-slate-100 group cursor-default">
                <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">120</span>
                <span className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Credits</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
