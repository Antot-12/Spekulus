
import type { FC, SVGProps } from 'react';

const icons: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  spotify: (props) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.839 16.333a.496.496 0 0 1-.658.125c-2.325-1.425-5.25-1.742-8.725-.958a.5.5 0 0 1-.55-.442.496.496 0 0 1 .442-.55c3.742-.85 6.958-.492 9.558 1.1a.496.496 0 0 1 .125.658zm1.025-2.5a.625.625 0 0 1-.825.158c-2.658-1.642-6.55-2.067-9.683-1.133a.621.621 0 0 1-.708-.558.625.625 0 0 1 .558-.708c3.483-.992 7.742-.5 10.742 1.383a.621.621 0 0 1 .167.825zM12 5.75c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#1DB954"
      />
    </svg>
  ),
  appleMusic: (props) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6S6.698 2.4 12 2.4s9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6zm-1.5-12.336c-.464 0-.888.168-1.224.504-.68.68-.84 1.8.216 3.156.492.684 1.164 1.356 2.016 1.356.36 0 .732-.144 1.116-.444.696-.54 1.056-1.524.276-2.676-.552-.84-1.284-1.896-2.388-1.896zM12 4.8c-.9 0-1.74.288-2.436.84.06-.06.12-.108.18-.168.804-.804 1.944-1.296 3.192-1.296s2.388.492 3.192 1.296c.6.6.96 1.404.96 2.256s-.36 1.656-1.008 2.292c-.636.636-1.464 1.008-2.364 1.008s-1.728-.372-2.364-1.008c-.648-.636-1.008-1.476-1.008-2.376.012-1.032.492-1.956 1.272-2.652z"
        fill="currentColor"
      />
    </svg>
  ),
  youtubeMusic: (props) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 17.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
        fill="#FF0000"
      />
    </svg>
  ),
  fallback: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M6 12H18" />
      <path d="M12 6V18" />
    </svg>
  ),
};

export const MusicIcon = ({ platform, className }: { platform: string; className?: string }) => {
  const IconComponent = icons[platform] || icons.fallback;
  return <IconComponent className={className} />;
};
