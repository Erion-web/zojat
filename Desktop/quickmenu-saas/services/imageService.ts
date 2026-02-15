
export const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Quality 0.7 for strong compression
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

import { supabase } from './supabaseClient';

export const uploadToExternalStorage = async (compressedDataUrl: string): Promise<string> => {
  // 1. Convert Data URL to Blob
  const res = await fetch(compressedDataUrl);
  const blob = await res.blob();
  
  // 2. Generate Path: {random_id}.webp
  // Fallback for environments without crypto.randomUUID (e.g. non-HTTPS local network)
  let randomId;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    randomId = crypto.randomUUID();
  } else {
    randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  const fileName = `${randomId}.webp`;
  const filePath = `${fileName}`;

  // 3. Upload to Supabase
  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(filePath, blob, {
      contentType: 'image/webp',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // 4. Get Public URL
  const { data } = supabase.storage
    .from('menu-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
