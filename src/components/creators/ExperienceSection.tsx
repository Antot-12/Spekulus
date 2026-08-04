import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Experience } from '@/lib/data';
import * as Icon from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechBadge } from '@/app/creators/[slug]/TechBadge';

type ExperienceSectionProps = {
  experience?: Experience[];
  style?: React.CSSProperties;
};

function calculateDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  }

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ExperienceSection({ experience, style }: ExperienceSectionProps) {
  if (!experience || experience.length === 0) return null;

  // Sort by start date (most recent first)
  const sortedExperience = [...experience].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <Card className={cn("bg-card border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 opacity-0 animate-fade-in-up")} style={style}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl text-primary">
          <Icon.Briefcase className="w-6 h-6" />
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

          <div className="space-y-8">
            {sortedExperience.map((exp, index) => (
              <div key={exp.id || index} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center z-10">
                  {!exp.endDate && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>

                <div className="bg-muted/30 rounded-lg p-5 border border-border/50 hover:border-primary/50 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold font-headline text-foreground">
                        {exp.position}
                      </h3>
                      <p className="text-lg text-primary font-semibold mt-1">
                        {exp.company}
                      </p>
                      {exp.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Icon.MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </p>
                      )}
                    </div>

                    {!exp.endDate && (
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50">
                        Current
                      </Badge>
                    )}
                  </div>

                  {/* Timeline dates */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Icon.Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </span>
                    <span className="text-xs">
                      ({calculateDuration(exp.startDate, exp.endDate)})
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/80 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {exp.description}
                  </p>

                  {/* Technologies */}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, techIndex) => (
                        <TechBadge key={techIndex} tech={tech} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
