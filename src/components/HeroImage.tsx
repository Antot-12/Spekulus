'use client';

import React from 'react';

type HeroImageProps = {
  imageId: number | null;
  alt?: string;
  className?: string;
};

export function HeroImage({ imageId, alt = 'Image', className = '' }: HeroImageProps) {
  if (!imageId) {
    return <div className="text-sm text-muted">No image available</div>;
  }

  return (
    <img
      src={`/api/images/${imageId}`}
      alt={alt}
      className={`rounded-md shadow-md ${className}`}
    />
  );
}
