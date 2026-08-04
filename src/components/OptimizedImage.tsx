"use client";

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Site background color as a tiny placeholder
const PLACEHOLDER_COLOR = 'hsl(222, 83%, 9%)';

type OptimizedImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  showLoadingBg?: boolean;
};

export function OptimizedImage({
  className,
  showLoadingBg = true,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={cn(
        className,
        !isLoaded && showLoadingBg && 'bg-[hsl(222,83%,9%)]',
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}
      onLoad={(e) => {
        setIsLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
