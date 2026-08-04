"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Experience } from '@/lib/data';
import { PlusCircle, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
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

type ExperienceManagerProps = {
  creatorId: number;
  initialExperience: Experience[];
  onUpdate: () => void;
};

function SortableExperienceItem({
  experience,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: {
  experience: Experience;
  onUpdate: (id: number, data: Partial<Experience>) => void;
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
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [techString, setTechString] = useState(experience.technologies?.join(', ') ?? '');

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
          <div>
            <h4 className="font-semibold">{experience.position || 'New Position'}</h4>
            <p className="text-sm text-muted-foreground">{experience.company}</p>
          </div>
          {!experience.isVisible && <Badge variant="secondary">Hidden</Badge>}
          {!experience.endDate && <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Current</Badge>}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleVisibility(experience.id)}
            title={experience.isVisible ? 'Hide' : 'Show'}
          >
            {experience.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(experience.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Company</Label>
          <Input
            value={experience.company}
            onChange={(e) => onUpdate(experience.id, { company: e.target.value })}
          />
        </div>
        <div>
          <Label>Position</Label>
          <Input
            value={experience.position}
            onChange={(e) => onUpdate(experience.id, { position: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <Input
          value={experience.location ?? ''}
          onChange={(e) => onUpdate(experience.id, { location: e.target.value })}
          placeholder="City, Country or Remote"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={experience.description}
          onChange={(e) => onUpdate(experience.id, { description: e.target.value })}
          rows={4}
          placeholder="Job responsibilities, achievements..."
        />
      </div>

      <div>
        <Label>Technologies (comma-separated)</Label>
        <Textarea
          value={techString}
          onChange={(e) => setTechString(e.target.value)}
          onBlur={(e) => {
            const techs = e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
            onUpdate(experience.id, { technologies: techs });
          }}
          placeholder="React, Node.js, AWS"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={experience.startDate}
            onChange={(e) => onUpdate(experience.id, { startDate: e.target.value })}
          />
        </div>
        <div>
          <Label>End Date (leave empty for current)</Label>
          <Input
            type="date"
            value={experience.endDate ?? ''}
            onChange={(e) => onUpdate(experience.id, { endDate: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  );
}

export function ExperienceManager({ creatorId, initialExperience, onUpdate }: ExperienceManagerProps) {
  const [experience, setExperience] = useState<Experience[]>(initialExperience);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadExperience();
  }, [creatorId]);

  const loadExperience = async () => {
    try {
      const res = await fetch(`/api/creator-experience?creatorId=${creatorId}`);
      const data = await res.json();
      setExperience(data.experience || []);
    } catch (error) {
      console.error('Failed to load experience:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experience.findIndex((e) => e.id === active.id);
      const newIndex = experience.findIndex((e) => e.id === over.id);

      const newExperience = arrayMove(experience, oldIndex, newIndex);
      setExperience(newExperience);

      // Update order in database
      for (let i = 0; i < newExperience.length; i++) {
        await fetch('/api/creator-experience', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newExperience[i].id, order: i }),
        });
      }

      toast({ title: 'Order updated' });
      onUpdate();
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/creator-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          company: 'Company Name',
          position: 'Position Title',
          startDate: new Date().toISOString().split('T')[0],
          description: 'Job responsibilities...',
          technologies: [],
          order: experience.length,
        }),
      });
      const data = await res.json();
      setExperience([...experience, data.experience]);
      toast({ title: 'Experience added' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Failed to add experience', variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: number, updates: Partial<Experience>) => {
    try {
      await fetch('/api/creator-experience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      setExperience(experience.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      onUpdate();
    } catch (error) {
      console.error('Failed to update experience:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/creator-experience?id=${id}`, { method: 'DELETE' });
      setExperience(experience.filter((e) => e.id !== id));
      toast({ title: 'Experience deleted', variant: 'destructive' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Failed to delete experience', variant: 'destructive' });
    }
  };

  const handleToggleVisibility = async (id: number) => {
    const exp = experience.find((e) => e.id === id);
    if (exp) {
      await handleUpdate(id, { isVisible: !exp.isVisible });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          Work Experience
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {experience.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No experience yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={experience.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {experience.map((exp) => (
                  <SortableExperienceItem
                    key={exp.id}
                    experience={exp}
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
