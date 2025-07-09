import { BrainCircuit, Cpu, HeartPulse, ScanEye, type LucideProps, Sparkles } from 'lucide-react';
import type { FC } from 'react';

const icons: Record<string, FC<LucideProps>> = {
  BrainCircuit,
  Cpu,
  HeartPulse,
  ScanEye,
  Sparkles,
};

export const ProductIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = icons[name] || icons.Sparkles;
  return <IconComponent className={className} />;
};
