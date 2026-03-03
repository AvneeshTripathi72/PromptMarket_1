'use client';

import Link from 'next/link';

const trendingHighlights = [
  {
    id: 1,
    title: 'Trending Now',
    icon: 'trending_up',
    items: [
      { name: 'AI Portrait Generator', category: 'Midjourney', change: '+24%', users: '2.3k' },
      { name: 'Code Review Assistant', category: 'GPT-4', change: '+18%', users: '1.8k' },
      { name: 'Logo Design Pro', category: 'DALL-E 3', change: '+15%', users: '1.5k' },
      { name: 'Content Writer', category: 'Claude', change: '+12%', users: '1.2k' }
    ]
  },
  {
    id: 2,
    title: 'ChatGPT Highlights',
    icon: 'smart_toy',
    items: [
      { name: 'Business Strategy GPT', category: 'GPT-5 Turbo', change: '+32%', users: '3.1k' },
      { name: 'Data Analysis Pro', category: 'GPT-4', change: '+28%', users: '2.7k' },
      { name: 'Creative Writing', category: 'GPT-4', change: '+22%', users: '2.1k' },
      { name: 'Code Generator', category: 'GPT-5 Turbo', change: '+19%', users: '1.9k' }
    ]
  },
  {
    id: 3,
    title: 'Midjourney Picks',
    icon: 'image',
    items: [
      { name: 'Cyberpunk Cityscape', category: 'Midjourney V8', change: '+45%', users: '4.2k' },
      { name: 'Fantasy Characters', category: 'Midjourney V7', change: '+38%', users: '3.8k' },
      { name: 'Architectural Renders', category: 'Midjourney V8', change: '+31%', users: '3.3k' },
      { name: 'Abstract Art', category: 'Midjourney V7', change: '+26%', users: '2.9k' }
    ]
  }
];

const categories = [
  { name: 'Midjourney', count: 45, color: 'bg-purple-100 text-purple-700' },
  { name: 'GPT-4', count: 32, color: 'bg-green-100 text-green-700' },
  { name: 'DALL-E 3', count: 28, color: 'bg-blue-100 text-blue-700' },
  { name: 'Claude', count: 24, color: 'bg-orange-100 text-orange-700' },
  { name: 'Stable Diffusion', count: 21, color: 'bg-pink-100 text-pink-700' }
];

const topCreators = [
  { name: '@neon_arc', prompts: 45, rating: 4.9 },
  { name: '@logic_smith', prompts: 38, rating: 4.8 },
  { name: '@archizoom', prompts: 32, rating: 4.7 },
  { name: '@sec_dev', prompts: 28, rating: 5.0 }
];

export default function TrendingSidebar() {
  return (
    <div className="w-[22rem] hidden xl:block relative z-10 shrink-0">
      <div className="sticky top-0 h-screen flex flex-col pt-10 pb-6">
        <div className="px-8 mt-4 mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">insights</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Market Pulse</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Real-time trending data & insights</p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-10 no-scrollbar">
          {/* Trending Highlights */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Trending Now</h3>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full">
                <div className="size-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-600 uppercase">Live</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {trendingHighlights.slice(0, 2).map((section) => (
                <div key={section.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">{section.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{section.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Updated just now</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {section.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between group/item">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover/item:text-primary transition-colors">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium text-slate-400">{item.category}</span>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                          {item.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Creators card with modern depth */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full translate-x-10 -translate-y-10"></div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10">Elite Creators</h3>
            <div className="space-y-6 relative z-10 w-full">
              {topCreators.slice(0, 3).map((creator, index) => (
                <div key={index} className="flex items-center justify-between cursor-pointer border-b border-white/5 pb-4 group">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs group-hover:bg-primary group-hover:border-primary transition-all">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">{creator.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{creator.prompts} prompts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                    <span className="material-symbols-outlined text-sm fill-[1]">star</span>
                    <span>{creator.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Bundles with premium look */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Featured Packages</h3>
            <div className="space-y-4">
                {[
                    { name: 'Starter Protocol', price: '49 ACC', icon: 'rocket_launch' },
                    { name: 'Professional Sync', price: '129 ACC', icon: 'diamond' }
                ].map((pkg, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer bg-slate-50 rounded-2xl p-3 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all">
                        <div className="size-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-xl">{pkg.icon}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{pkg.name}</p>
                            <p className="text-[10px] text-primary font-bold mt-1 tracking-wider">{pkg.price}</p>
                        </div>
                        <span className="material-symbols-outlined text-lg text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </div>
                ))}
            </div>
            <Link href="/packages" className="block text-center mt-8 py-3.5 bg-slate-900 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all">View All Packages</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
