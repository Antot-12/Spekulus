
import { Award, GitMerge, Users, Rocket, Lightbulb, Star, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

const icons: Record<string, FC<LucideProps>> = {
  Award,
  GitMerge,
  Users,
  Rocket,
  Lightbulb,
  Star,
};

export const AchievementIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = icons[name] || icons.Award;
  return <IconComponent className={className} />;
};
