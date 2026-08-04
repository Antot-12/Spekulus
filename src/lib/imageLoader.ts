export default function imageLoader({
  src,
  width,
  quality
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // If src is already a full URL (external), return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For local API images
  if (src.startsWith('/api/images/')) {
    const params = new URLSearchParams();
    params.set('w', width.toString());
    params.set('q', (quality || 80).toString());
    params.set('f', 'webp');

    return `${src}?${params.toString()}`;
  }

  // For other local images, return as-is
  return src;
}
