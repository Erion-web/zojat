
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyMenus } from '../services/menuService';
import { Menu } from '../types';

const AdminDashboard: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getMyMenus(user.id).then(setMenus).catch(console.error);
    }
  }, [user]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Stores</h1>
          <p className="text-slate-500">Manage your permanent digital presences</p>
        </div>
        <div className="flex space-x-4">
           <button onClick={() => signOut()} className="px-4 py-3 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition-all">Sign Out</button>
           <Link 
             to="/admin/new"
             className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center"
           >
             <i className="fa-solid fa-plus mr-2"></i> New Menu
           </Link>
        </div>
      </div>

      {menus.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-store text-3xl text-slate-200"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Build your first menu</h3>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Digitize your restaurant or cafe and get a permanent URL in minutes.</p>
          <Link to="/admin/new" className="text-orange-500 font-black uppercase text-xs tracking-widest hover:underline">Start Creating &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menus.map((menu) => (
            <div key={menu.id} className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl hover:border-orange-200 transition-all duration-300">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-utensils"></i>
                  </div>
                  {menu.publicUrl ? (
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black tracking-widest rounded-full uppercase">Published</span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black tracking-widest rounded-full uppercase">Draft</span>
                  )}
                </div>
                
                <h3 className="font-bold text-2xl text-slate-800 mb-1 truncate">{menu.businessName}</h3>
                <p className="text-sm text-slate-400 font-medium mb-6">{menu.slug ? `/menu/${menu.slug}` : 'Not published yet'}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => menu.slug && navigate(`/menu/${menu.slug}`)}
                    disabled={!menu.slug}
                    className="py-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/edit/${menu.id}`)}
                    className="py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-black transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
              {menu.publicUrl && (
                <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex justify-between items-center group-hover:bg-orange-50/30 transition-colors">
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Est. {new Date(menu.createdAt).getFullYear()}</span>
                  <button 
                    onClick={() => handleCopyLink(menu.publicUrl)}
                    className="text-[10px] font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest"
                  >
                    <i className="fa-solid fa-link mr-1"></i> Copy URL
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
