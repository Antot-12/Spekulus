/**
 * Generates a simple blur placeholder data URL
 * This is a lightweight base64 SVG blur placeholder that works in both browser and Node.js
 */
export function getBlurDataURL(width: number = 10, height: number = 10): string {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgb(100,100,120);stop-opacity:0.8"/><stop offset="100%" style="stop-color:rgb(60,60,80);stop-opacity:0.8"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad)"/><rect width="100%" height="100%" fill="rgba(255,255,255,0.05)"/></svg>`;

  if (typeof window === 'undefined' && typeof Buffer !== 'undefined') {
    // Node.js environment
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  } else {
    // Browser environment
    const base64 = btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  }
}

