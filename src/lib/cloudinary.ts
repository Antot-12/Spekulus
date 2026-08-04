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
 * Build a Cloudinary URL with transformations from a public ID
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
 * Build a Cloudinary URL from cloudinaryId (stored in database)
 * Use this when you have the cloudinaryId from the file record
 */
export function getCloudinaryUrlFromId(
  cloudinaryId: string | null | undefined,
  options: ImageTransformOptions = {}
): string | null {
  if (!cloudinaryId) return null;
  return cloudinaryUrl(cloudinaryId, options);
}

/**
 * Placeholder blur data URL for loading state (dark background matching site)
 */
export const blurDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
