'use client';

import { useEffect } from 'react';

const CLOUDINARY_CLOUD_NAME = 'dmeg16fm5';

// Map file IDs to their Cloudinary public IDs (same as imageLoader.ts)
const cloudinaryMap: Record<number, string> = {
  5: 'spekulus/backgrounds/file_5',
  6: 'spekulus/branding/file_6',
  7: 'spekulus/creators/file_7',
  8: 'spekulus/creators/file_8',
  9: 'spekulus/gallery/file_9',
  10: 'spekulus/gallery/file_10',
  11: 'spekulus/gallery/file_11',
  12: 'spekulus/gallery/file_12',
  13: 'spekulus/creators/file_13',
  23: 'spekulus/branding/file_23',
  24: 'spekulus/products/file_24',
  25: 'spekulus/products/file_25',
  27: 'spekulus/products/file_27',
  28: 'spekulus/creators/file_28',
};

function getCloudinaryUrl(id: number, width: number, quality: number = 85): string {
  const publicId = cloudinaryMap[id];
  if (publicId) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_${quality},f_auto/${publicId}`;
  }
  // Fallback to API route for unmapped images
  return `/api/images/${id}?w=${width}&q=${quality}&f=webp`;
}

interface ImagePreloaderProps {
  imageIds: number[];
  priority?: boolean;
}

/**
 * Preloads images for better perceived performance
 * Use this for critical hero images that need to load fast
 */
export function ImagePreloader({ imageIds, priority = true }: ImagePreloaderProps) {
  useEffect(() => {
    if (!priority || typeof window === 'undefined') return;

    // Preload images directly from Cloudinary CDN (no redirect)
    imageIds.forEach((id) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getCloudinaryUrl(id, 1920, 85);
      link.imageSrcSet = `
        ${getCloudinaryUrl(id, 640, 85)} 640w,
        ${getCloudinaryUrl(id, 1024, 85)} 1024w,
        ${getCloudinaryUrl(id, 1920, 85)} 1920w
      `.trim();
      document.head.appendChild(link);
    });
  }, [imageIds, priority]);

  return null;
}
