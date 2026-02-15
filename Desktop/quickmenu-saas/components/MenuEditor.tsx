import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateAIMenu } from '../services/geminiService';
import { compressImage, uploadToExternalStorage } from '../services/imageService';
import { checkSlugAvailability, createMenu, getFullMenu, saveFullMenu } from '../services/menuService';
import { Menu, MenuItem } from '../types';
import { slugify } from '../utils'; // We need to reimplement utils or move these

const MenuEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [categories, setCategories] = useState<string[]>(['Main', 'Drinks', 'Appetizers']);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedMenu, setPublishedMenu] = useState<Menu | null>(null);
  const [cuisineType, setCuisineType] = useState('Italian');

  // Load existing menu
  useEffect(() => {
    if (isEditing && id) {
      getFullMenu(id).then(menu => {
        if (menu) {
          setBusinessName(menu.businessName);
          setCurrency(menu.currency);
          setCategories(menu.categories);
          setItems(menu.items);
        }
      });
    }
  }, [isEditing, id]);

  // Helper for environments where crypto.randomUUID might be restricted (non-HTTPS)
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleAddItem = (category?: string) => {
    if (categories.length === 0) {
      alert("Please create a category first (e.g., 'Main Dishes').");
      return;
    }
    
    try {
      const newItem: MenuItem = {
        id: generateId(),
        name: '',
        price: 0,
        description: '',
        category: category || categories[0],
        hasImage: false,
        isAvailable: true
      };
      setItems([...items, newItem]);
    } catch (err: any) {
      console.error(err);
      alert(`Error adding item: ${err.message}`);
    }
  };

  const handleAddCategory = () => {
    const name = prompt("Enter category name:");
    if (name && !categories.includes(name)) {
      setCategories([...categories, name]);
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Delete category "${cat}"? Items in it will keep their category but be unfiltered if the category is gone.`)) {
      setCategories(categories.filter(c => c !== cat));
    }
  };

  const updateItem = (itemId: string, updates: Partial<MenuItem>) => {
    setItems(items.map(item => item.id === itemId ? { ...item, ...updates } : item));
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    try {
      const compressed = await compressImage(file);
      const url = await uploadToExternalStorage(compressed); // We'll update this service next
      updateItem(itemId, { imageUrl: url, hasImage: true });
    } catch (err: any) {
      console.error(err);
      alert(`Image processing failed: ${err.message || 'Unknown error'}`);
    }
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleAISuggest = async () => {
    if (!businessName) return alert("Please enter a business name first!");
    setIsLoadingAI(true);
    try {
      const result = await generateAIMenu(cuisineType, businessName);
      setCategories(result.categories);
      setItems(result.items.map(i => ({
        ...i,
        id: generateId(),
        hasImage: false,
        isAvailable: true
      })) as MenuItem[]);
    } catch (err: any) {
      alert(`AI generation failed: ${err.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSave = async () => {
    if (!businessName) return alert("Business name is required");
    if (!user) return alert("You must be logged in");
    
    setIsPublishing(true);

    try {
      // 1. Ensure Menu Exists
      let menuId = id;
      if (!isEditing) {
        const newMenu = await createMenu(user.id, businessName, currency);
        menuId = newMenu.id;
      }

      if (!menuId) throw new Error("Failed to create menu ID");

      // 2. Generate/Validate Slug
      let slug = (isEditing && publishedMenu?.slug) ? publishedMenu.slug : slugify(businessName);
      
      // Basic uniqueness check if creating new or changing name (simplified for MVP: append random if taken)
      // Logic: if availability check fails, append unique string
      let isAvailable = await checkSlugAvailability(slug);
      if (!isAvailable && !isEditing) {
          slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      const publicUrl = `${window.location.origin}/menu/${slug}`;

      const menuData: Menu = {
        id: menuId,
        businessName,
        slug,
        publicUrl,
        currency,
        createdAt: Date.now(),
        items,
        categories,
        isActive: true
      };

      await saveFullMenu(menuData, user.id);
      setPublishedMenu(menuData);
      
      if (!isEditing) {
         // Optionally navigate to edit mode to prevent duplicate creations on refresh
         window.history.replaceState(null, '', `/admin/edit/${menuId}`);
      }
      
    } catch (error: any) {
      console.error(error);
      alert(`Failed to publish menu: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (publishedMenu) {
    return (
      <div className="p-4 md:p-12 max-w-2xl mx-auto flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">
          <i className="fa-solid fa-check"></i>
        </div>
        <h1 className="text-3xl font-bold mb-2">Successfully Published!</h1>
        <p className="text-slate-500 mb-8">Your permanent digital menu is now live and ready for customers.</p>
        
        <div className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-xl mb-8">
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-center">
             <QRCodeSVG value={publishedMenu.publicUrl} size={200} level="H" includeMargin={true} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Public Link</p>
          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
            <span className="flex-grow text-slate-700 truncate font-mono text-sm">{publishedMenu.publicUrl}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(publishedMenu.publicUrl);
                alert("Link copied!");
              }}
              className="p-2 text-orange-500 hover:bg-white rounded-lg transition-colors"
            >
              <i className="fa-solid fa-copy"></i>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.print()} 
              className="py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center"
            >
              <i className="fa-solid fa-print mr-2"></i> Print QR
            </button>
            <button 
              onClick={() => navigate(`/menu/${publishedMenu.slug}`)}
              className="py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              Preview Menu
            </button>
          </div>
        </div>
        
        <button onClick={() => navigate('/admin')} className="text-slate-400 font-medium hover:text-slate-600">
          Go back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate('/admin')} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-3xl font-bold text-slate-800">{isEditing ? 'Edit Menu' : 'New Permanent Menu'}</h1>
      </div>

      <div className="space-y-8 pb-24">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4">Store Identity</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-500 mb-1">Business Name</label>
              <input 
                type="text" 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="e.g. Matisse Cafe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Currency</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="ALL">Lek (L)</option>
              </select>
            </div>
          </div>
        </section>

        {/* AI Generator */}
        {!isEditing && (
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-xs font-bold text-orange-700 uppercase mb-1">Cuisine Style</label>
              <input 
                type="text" 
                value={cuisineType} 
                onChange={(e) => setCuisineType(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg outline-none"
                placeholder="e.g. Modern Fusion, Brunch Spot..."
              />
            </div>
            <button 
              onClick={handleAISuggest}
              disabled={isLoadingAI}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {isLoadingAI ? 'Generating...' : 'Auto-fill with AI'}
            </button>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-4">

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Catalog</h2>
            <div className="flex space-x-2">
               <button onClick={handleAddCategory} className="text-sm font-bold text-slate-500 hover:text-orange-500">Manage Categories</button>
               <button onClick={() => handleAddItem()} className="text-orange-500 font-bold">+ Add Item</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
              <span key={cat} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 flex items-center">
                {cat}
                <button onClick={() => handleDeleteCategory(cat)} className="ml-2 text-slate-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>

          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-6 relative group">
              <div className="w-full md:w-32 flex flex-col space-y-2">
                <div className="relative w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-image text-slate-300 text-3xl"></i>
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-white text-xs font-bold">
                    <span>Change</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(item.id, e.target.files[0])} 
                    />
                  </label>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-400">PHOTO</span>
                  <button 
                    onClick={() => updateItem(item.id, { hasImage: !item.hasImage, imageUrl: !item.hasImage ? item.imageUrl : undefined })}
                    className={`w-10 h-5 rounded-full relative transition-colors ${item.hasImage ? 'bg-orange-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${item.hasImage ? 'translate-x-6' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              </div>

              <div className="flex-grow space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      className="text-lg font-bold w-full bg-transparent border-b border-transparent focus:border-orange-200 outline-none"
                      placeholder="Item name..."
                    />
                  </div>
                  <div className="flex items-center bg-slate-50 px-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 mr-1 text-sm">{currency}</span>
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                      className="w-full py-1.5 bg-transparent font-bold outline-none"
                    />
                  </div>
                </div>
                <textarea 
                  value={item.description} 
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  className="w-full text-sm text-slate-500 bg-transparent border-none focus:ring-0 outline-none resize-none"
                  rows={2}
                  placeholder="Tell the story of this dish..."
                ></textarea>
                <select 
                  value={item.category} 
                  onChange={(e) => updateItem(item.id, { category: e.target.value })}
                  className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
          <div className="max-w-4xl mx-auto flex justify-end space-x-4">
            <button onClick={() => navigate('/admin')} className="px-6 py-3 font-bold text-slate-500">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={isPublishing}
              className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {isPublishing ? 'Publishing...' : 'Publish Permanent Menu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;