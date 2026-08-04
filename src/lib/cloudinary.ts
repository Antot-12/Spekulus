const CLOUDINARY_CLOUD_NAME = 'dmeg16fm5';

type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
};

/**
 * Build a Cloudinary URL with transformations
 */
export function cloudinaryUrl(
  publicId: string,
  options: ImageTransformOptions = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop,
    gravity,
  } = options;

  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (gravity) transforms.push(`g_${gravity}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  const transformString = transforms.join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Get Cloudinary URL for a file ID (maps to spekulus folder structure)
 */
export function getImageUrl(fileId: number, options: ImageTransformOptions = {}): string {
  // Map file IDs to their Cloudinary public IDs based on the migration
  const folderMap: Record<number, string> = {
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

  const publicId = folderMap[fileId];

  if (publicId) {
    return cloudinaryUrl(publicId, options);
  }

  // Fallback to API route for unmapped images
  return `/api/images/${fileId}`;
}

/**
 * Placeholder blur data URL for loading state (dark background matching site)
 */
export const blurDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
