import { ScanFace, Activity, Home, Frame, Languages, GitMerge, Sparkles, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

const icons: Record<string, FC<LucideProps>> = {
  ScanFace,
  Activity,
  Home,
  Frame,
  Languages,
  GitMerge,
  Sparkles,
};

export const AdvantageIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = icons[name] || icons.Sparkles;
  return <IconComponent className={className} />;
};
