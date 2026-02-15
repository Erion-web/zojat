
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  hasImage: boolean;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface Menu {
  id: string;
  businessName: string;
  slug: string;
  publicUrl: string;
  logoUrl?: string;
  currency: string;
  createdAt: number;
  items: MenuItem[];
  categories: string[];
  isActive: boolean;
}

export interface StorageData {
  menus: Record<string, Menu>;
}
