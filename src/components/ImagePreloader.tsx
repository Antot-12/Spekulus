'use client';

import { useEffect } from 'react';

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

    // Preload images
    imageIds.forEach((id) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = `/api/images/${id}?w=1920&q=85&f=webp`;
      link.imageSrcSet = `
        /api/images/${id}?w=640&q=85&f=webp 640w,
        /api/images/${id}?w=1024&q=85&f=webp 1024w,
        /api/images/${id}?w=1920&q=85&f=webp 1920w
      `.trim();
      document.head.appendChild(link);
    });
  }, [imageIds, priority]);

  return null;
}
