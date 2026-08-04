const CLOUDINARY_CLOUD_NAME = 'dmeg16fm5';

/**
 * Custom image loader for Next.js Image component.
 *
 * For images with cloudinaryId in the database, components should use
 * cloudinaryUrl() directly from @/lib/cloudinary.
 *
 * This loader handles the fallback case when images are served via
 * /api/images/ route (which redirects to Cloudinary if available).
 */
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

  // If it's already a Cloudinary URL, add transformations
  if (src.includes('res.cloudinary.com')) {
    const match = src.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) {
      const publicId = match[1];
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_${q},f_auto/${publicId}`;
    }
    return src;
  }

  // If it's our API route, pass through with query params
  // The API route will redirect to Cloudinary if the file has cloudinaryId
  if (src.startsWith('/api/images/')) {
    return `${src}?w=${width}&q=${q}&f=webp`;
  }

  // For external URLs, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For local images, return as-is
  return src;
}
