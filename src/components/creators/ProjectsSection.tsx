import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { Project } from '@/lib/data';
import * as Icon from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechBadge } from '@/app/creators/[slug]/TechBadge';

type ProjectsSectionProps = {
  projects?: Project[];
  style?: React.CSSProperties;
};

export function ProjectsSection({ projects, style }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <Card className={cn("bg-card border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 opacity-0 animate-fade-in-up")} style={style}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl text-primary">
          <Icon.Briefcase className="w-6 h-6" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id || index}
              className="group relative border border-border/50 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 bg-muted/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Project Image */}
                {project.imageId && (
                  <div className="relative h-48 md:h-auto md:col-span-1 bg-muted overflow-hidden">
                    <Image
                      src={`/api/images/${project.imageId}`}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Project Content */}
                <div className={cn("p-6", project.imageId ? "md:col-span-2" : "md:col-span-3")}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.category && (
                        <Badge variant="outline" className="mt-2">
                          {project.category}
                        </Badge>
                      )}
                      {project.featured && (
                        <Badge className="mt-2 ml-2 bg-primary">
                          <Icon.Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {project.demoUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                        >
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <Icon.ExternalLink className="w-4 h-4" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                        >
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Icon.Github className="w-4 h-4" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-foreground/80 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.technologies.map((tech, techIndex) => (
                        <TechBadge key={techIndex} tech={tech} />
                      ))}
                    </div>
                  )}

                  {/* Timeline */}
                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon.Calendar className="w-3.5 h-3.5" />
                      <span>
                        {project.startDate}
                        {project.endDate && ` - ${project.endDate}`}
                        {!project.endDate && project.startDate && ' - Present'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
