"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { GripVertical, LayoutList } from 'lucide-react';
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

type SectionsOrderManagerProps = {
  creatorId: number;
  initialOrder: string[];
  initialHidden: string[];
  onUpdate: (order: string[], hidden: string[]) => void;
};

const SECTION_LABELS: Record<string, string> = {
  about: '👤 About Me',
  projects: '💼 Projects Portfolio',
  experience: '🏢 Work Experience',
  featuredProject: '⭐ Featured Project',
  contributions: '🤝 Contributions',
  skills: '🔧 Skills & Competencies',
  achievements: '🏆 Achievements',
  education: '🎓 Education & Certifications',
  music: '🎵 Music',
  personal: '💭 Personal',
  gallery: '📸 Gallery',
};

function SortableSectionItem({
  section,
  isHidden,
  onToggle
}: {
  section: string;
  isHidden: boolean;
  onToggle: (section: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 border rounded-lg p-3 transition-colors ${
        isHidden ? 'bg-muted/10 opacity-60' : 'bg-muted/30 hover:bg-muted/50'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <span className={`text-sm font-medium flex-1 ${isHidden ? 'line-through text-muted-foreground' : ''}`}>
        {SECTION_LABELS[section] || section}
      </span>
      <Switch
        checked={!isHidden}
        onCheckedChange={() => onToggle(section)}
        aria-label={`Toggle ${SECTION_LABELS[section] || section}`}
      />
    </div>
  );
}

export function SectionsOrderManager({ creatorId, initialOrder, initialHidden, onUpdate }: SectionsOrderManagerProps) {
  const [sections, setSections] = useState<string[]>(initialOrder);
  const [hiddenSections, setHiddenSections] = useState<string[]>(initialHidden);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveChanges = async (newOrder: string[], newHidden: string[]) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: creatorId,
          sectionsOrder: newOrder,
          hiddenSections: newHidden,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast({ title: 'Sections updated' });
      onUpdate(newOrder, newHidden);
    } catch (error) {
      toast({ title: 'Failed to update sections', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s === active.id);
      const newIndex = sections.findIndex((s) => s === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      await saveChanges(newSections, hiddenSections);
    }
  };

  const handleToggle = async (section: string) => {
    const newHidden = hiddenSections.includes(section)
      ? hiddenSections.filter((s) => s !== section)
      : [...hiddenSections, section];

    setHiddenSections(newHidden);
    await saveChanges(sections, newHidden);
  };

  const handleReset = async () => {
    const defaultOrder = [
      'about',
      'projects',
      'experience',
      'featuredProject',
      'contributions',
      'skills',
      'achievements',
      'education',
      'music',
      'personal',
      'gallery',
    ];
    const defaultHidden: string[] = [];

    setSections(defaultOrder);
    setHiddenSections(defaultHidden);
    await saveChanges(defaultOrder, defaultHidden);
    toast({ title: 'Reset to default' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          <LayoutList className="w-5 h-5" />
          Sections Order
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleReset} disabled={isSaving}>
          Reset to Default
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop to reorder. Toggle switch to show/hide sections.
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section}
                  section={section}
                  isHidden={hiddenSections.includes(section)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
