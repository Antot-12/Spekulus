"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FilePickerDialog } from '@/app/admin/creators/FilePickerDialog';
import type { Project } from '@/lib/data';
import { PlusCircle, Trash2, GripVertical, Eye, EyeOff, Upload, FolderSearch, Star } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ProjectsManagerProps = {
  creatorId: number;
  initialProjects: Project[];
  onUpdate: () => void;
};

function SortableProjectItem({
  project,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: {
  project: Project;
  onUpdate: (id: number, data: Partial<Project>) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { toast } = useToast();
  const [techString, setTechString] = useState(project.technologies?.join(', ') ?? '');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 space-y-4 bg-muted/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          <h4 className="font-semibold">{project.title || 'New Project'}</h4>
          {!project.isVisible && <Badge variant="secondary">Hidden</Badge>}
          {project.featured && <Badge className="bg-primary"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleVisibility(project.id)}
            title={project.isVisible ? 'Hide' : 'Show'}
          >
            {project.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(project.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input
            value={project.title}
            onChange={(e) => onUpdate(project.id, { title: e.target.value })}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input
            value={project.category ?? ''}
            onChange={(e) => onUpdate(project.id, { category: e.target.value })}
            placeholder="e.g., Web App, Mobile"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={project.description}
          onChange={(e) => onUpdate(project.id, { description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Demo URL</Label>
          <Input
            value={project.demoUrl ?? ''}
            onChange={(e) => onUpdate(project.id, { demoUrl: e.target.value })}
            placeholder="https://demo.com"
          />
        </div>
        <div>
          <Label>GitHub URL</Label>
          <Input
            value={project.githubUrl ?? ''}
            onChange={(e) => onUpdate(project.id, { githubUrl: e.target.value })}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <div>
        <Label>Technologies (comma-separated)</Label>
        <Textarea
          value={techString}
          onChange={(e) => setTechString(e.target.value)}
          onBlur={(e) => {
            const techs = e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
            onUpdate(project.id, { technologies: techs });
          }}
          placeholder="React, Node.js, PostgreSQL"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={project.startDate ?? ''}
            onChange={(e) => onUpdate(project.id, { startDate: e.target.value })}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={project.endDate ?? ''}
            onChange={(e) => onUpdate(project.id, { endDate: e.target.value || undefined })}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={project.featured ?? false}
            onCheckedChange={(checked) => onUpdate(project.id, { featured: checked })}
          />
          <Label>Featured</Label>
        </div>
      </div>

      <div>
        <Label>Project Image</Label>
        <div className="flex gap-2">
          <Input value={project.imageId ?? ''} disabled placeholder="Choose an image" />
          <FilePickerDialog
            onFileSelect={(fileId) => onUpdate(project.id, { imageId: fileId })}
          >
            <Button variant="outline" size="icon">
              <FolderSearch className="h-4 w-4" />
            </Button>
          </FilePickerDialog>
        </div>
      </div>
    </div>
  );
}

export function ProjectsManager({ creatorId, initialProjects, onUpdate }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadProjects();
  }, [creatorId]);

  const loadProjects = async () => {
    try {
      const res = await fetch(`/api/creator-projects?creatorId=${creatorId}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const newProjects = arrayMove(projects, oldIndex, newIndex);
      setProjects(newProjects);

      // Update order in database
      for (let i = 0; i < newProjects.length; i++) {
        await fetch('/api/creator-projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newProjects[i].id, order: i }),
        });
      }

      toast({ title: 'Order updated' });
      onUpdate();
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/creator-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          title: 'New Project',
          description: 'Project description...',
          technologies: [],
          order: projects.length,
        }),
      });
      const data = await res.json();
      setProjects([...projects, data.project]);
      toast({ title: 'Project added' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Failed to add project', variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: number, updates: Partial<Project>) => {
    try {
      await fetch('/api/creator-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      onUpdate();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/creator-projects?id=${id}`, { method: 'DELETE' });
      setProjects(projects.filter((p) => p.id !== id));
      toast({ title: 'Project deleted', variant: 'destructive' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Failed to delete project', variant: 'destructive' });
    }
  };

  const handleToggleVisibility = async (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      await handleUpdate(id, { isVisible: !project.isVisible });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          Projects Portfolio
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No projects yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={projects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {projects.map((project) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
