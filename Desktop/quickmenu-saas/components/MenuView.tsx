
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMenu } from '../services/menuService';
import { Menu } from '../types';

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const MenuView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      getPublicMenu(slug)
        .then(data => {
          if (data) {
            setMenu(data);
            setActiveCategory(data.categories[0] || '');
          } else {
            setError(true);
          }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error || !menu) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <i className="fa-solid fa-utensils"></i>
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Menu Not Found</h1>
      <p className="text-slate-500 max-w-xs">This menu might be private or doesn't exist.</p>
    </div>
  );

  const filteredItems = menu.items.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto shadow-2xl relative">
      {/* Visual Header */}
      <div className="relative h-56 bg-slate-900 overflow-hidden">
        <img 
          src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800`} 
          alt="Atmosphere" 
          className="w-full h-full object-cover opacity-50 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-0 right-0 text-center px-4">
          <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight">{menu.businessName}</h1>
          <div className="w-12 h-1 bg-orange-500 mx-auto mt-2 rounded-full"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[52px] z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-4 overflow-x-auto flex space-x-2 scrollbar-hide">
        {menu.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? 'bg-slate-900 text-white shadow-xl scale-105' 
                : 'bg-slate-50 text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="px-6 py-8 space-y-10">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-300 italic">
            Chef is currently preparing this section...
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="flex gap-4 items-start animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex-grow">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                  <span className="font-bold text-orange-600 ml-3">{formatCurrency(item.price, menu.currency)}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-3">{item.description}</p>
                {!item.isAvailable && (
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Sold Out</span>
                )}
              </div>
              {item.hasImage && item.imageUrl && (
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-slate-50">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Aesthetic Footer */}
      <div className="p-12 text-center bg-slate-50">
        <div className="text-slate-200 text-2xl mb-4">
          <i className="fa-solid fa-plate-wheat"></i>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Verified Digital Menu</p>
        <p className="text-[10px] text-slate-300">Powered by QuickMenu &copy; 2024</p>
      </div>

      {/* Floating Info */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-100 shadow-2xl flex items-center space-x-3 z-50">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">Always up to date</span>
      </div>
    </div>
  );
};

export default MenuView;
