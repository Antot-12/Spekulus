'use client';

import { useEffect } from 'react';
import { cloudinaryUrl } from '@/lib/cloudinary';

interface ImagePreloaderProps {
  /** Array of objects with imageId and cloudinaryId */
  images: Array<{ imageId?: number | null; cloudinaryId?: string | null }>;
  priority?: boolean;
}

function getImageSrc(image: { imageId?: number | null; cloudinaryId?: string | null }, width: number): string | null {
  if (image.cloudinaryId) {
    return cloudinaryUrl(image.cloudinaryId, { width, quality: 85 });
  }
  if (image.imageId) {
    return `/api/images/${image.imageId}?w=${width}&q=85&f=webp`;
  }
  return null;
}

/**
 * Preloads images for better perceived performance
 * Use this for critical hero images that need to load fast
 */
export function ImagePreloader({ images, priority = true }: ImagePreloaderProps) {
  useEffect(() => {
    if (!priority || typeof window === 'undefined') return;

    // Preload images
    images.forEach((image) => {
      const src1920 = getImageSrc(image, 1920);
      if (!src1920) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src1920;

      const src640 = getImageSrc(image, 640);
      const src1024 = getImageSrc(image, 1024);

      if (src640 && src1024) {
        link.imageSrcSet = `
          ${src640} 640w,
          ${src1024} 1024w,
          ${src1920} 1920w
        `.trim();
      }

      document.head.appendChild(link);
    });
  }, [images, priority]);

  return null;
}
