
import { Menu, MenuItem } from '../types';
import { supabase } from './supabaseClient';

export const getMyMenus = async (userId: string): Promise<Menu[]> => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform to match local type if needed, or update types
  return data.map(d => ({
    id: d.id,
    businessName: d.business_name,
    slug: d.slug,
    publicUrl: d.public_url,
    currency: d.currency,
    createdAt: new Date(d.created_at).getTime(),
    categories: [], // Fetched separately or joined
    items: [],      // Fetched separately or joined
    isActive: true
  }));
};

export const getFullMenu = async (id: string): Promise<Menu | null> => {
  const { data: menuData, error: menuError } = await supabase
    .from('menus')
    .select('*')
    .eq('id', id)
    .single();

  if (menuError || !menuData) return null;

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('menu_id', id)
    .order('sort_order');

  const { data: itemsData } = await supabase
    .from('items')
    .select('*')
    .eq('menu_id', id)
    .order('sort_order');

  const categories = categoriesData?.map(c => c.name) || [];
  
  const items: MenuItem[] = itemsData?.map(i => ({
    id: i.id,
    name: i.name,
    price: i.price,
    description: i.description,
    category: categoriesData?.find(c => c.id === i.category_id)?.name || '', // Map ID to name
    hasImage: i.has_image,
    imageUrl: i.image_url,
    isAvailable: i.is_available
  })) || [];

  return {
    id: menuData.id,
    businessName: menuData.business_name,
    slug: menuData.slug,
    publicUrl: menuData.public_url,
    currency: menuData.currency,
    createdAt: new Date(menuData.created_at).getTime(),
    categories,
    items,
    isActive: true
  };
};

export const createMenu = async (userId: string, businessName: string, currency: string) => {
  const { data, error } = await supabase
    .from('menus')
    .insert({
      user_id: userId,
      business_name: businessName,
      currency,
      is_published: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveFullMenu = async (menu: Menu, userId: string) => {
  // 1. Update Menu Details
  const { error: menuError } = await supabase
    .from('menus')
    .update({
      business_name: menu.businessName,
      currency: menu.currency,
      slug: menu.slug,
      public_url: menu.publicUrl,
      is_published: !!menu.publicUrl
    })
    .eq('id', menu.id);

  if (menuError) throw menuError;

  // 2. Sync Categories (Delete all and re-create for MVP simplicity, or Upsert)
  // For MVP: Delete existing categories/items for this menu and re-insert is easiest but risky.
  // Better: Upsert.
  
  // A. Categories
  // First, get existing to map names to IDs or just wipe and recreate
  // Strategy: Wipe and Recreate is robust for MVP "Save" button logic
  await supabase.from('items').delete().eq('menu_id', menu.id);
  await supabase.from('categories').delete().eq('menu_id', menu.id);

  // Insert Categories
  const categoryInserts = menu.categories.map((name, index) => ({
    menu_id: menu.id,
    name,
    sort_order: index
  }));
  
  const { data: newCategories, error: catError } = await supabase
    .from('categories')
    .insert(categoryInserts)
    .select();
    
  if (catError) throw catError;

  // Map category names back to IDs for Items
  const catMap = new Map(newCategories.map(c => [c.name, c.id]));

  // B. Items
  const itemInserts = menu.items.map((item, index) => ({
    menu_id: menu.id,
    category_id: catMap.get(item.category),
    name: item.name,
    price: item.price,
    description: item.description,
    has_image: item.hasImage,
    image_url: item.imageUrl,
    is_available: item.isAvailable,
    sort_order: index
  }));

  const { error: itemError } = await supabase
    .from('items')
    .insert(itemInserts);

  if (itemError) throw itemError;
};

export const checkSlugAvailability = async (slug: string): Promise<boolean> => {
  const { data } = await supabase
    .from('menus')
    .select('id')
    .eq('slug', slug)
    .maybeSingle(); // Use maybeSingle to avoid error if not found
    
  return !data;
};

// Public Access
export const getPublicMenu = async (slug: string): Promise<Menu | null> => {
   const { data: menuData, error } = await supabase
    .from('menus')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !menuData) return null;

  // Reuse getFullMenu logic or extract it common
  return getFullMenu(menuData.id);
};
