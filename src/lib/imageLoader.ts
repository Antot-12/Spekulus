const CLOUDINARY_CLOUD_NAME = 'dmeg16fm5';

// Map file IDs to their Cloudinary public IDs
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

export default function imageLoader({
  src,
  width,
  quality
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const q = quality || 80;

  // If it's our API route, convert directly to Cloudinary URL
  if (src.startsWith('/api/images/')) {
    const id = parseInt(src.replace('/api/images/', '').split('?')[0]);
    const publicId = cloudinaryMap[id];

    if (publicId) {
      // Return optimized Cloudinary URL directly
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_${q},f_auto/${publicId}`;
    }

    // Fallback to API route for unmapped images
    return `${src}?w=${width}&q=${q}&f=webp`;
  }

  // If it's already a Cloudinary URL, add transformations
  if (src.includes('res.cloudinary.com')) {
    const match = src.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) {
      const publicId = match[1];
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_${q},f_auto/${publicId}`;
    }
    return src;
  }

  // For external URLs, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For local images, return as-is
  return src;
}
