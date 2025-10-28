"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MainCategory, useCategoryStore } from "@/lib/store/categories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SortableItemProps {
  mainCategory: MainCategory;
  onEdit: (mainCategory: MainCategory) => void;
  onDelete: (mainCategoryId: number) => void;
}

function SortableItem({ mainCategory, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mainCategory.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* MainCategory Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg">{mainCategory.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {mainCategory.subCategories.length}個のサブカテゴリー
              </Badge>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {mainCategory.subCategories.map((sub) => (
                <Badge key={sub.id} variant="outline" className="text-xs">
                  {sub.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(mainCategory)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(mainCategory.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface MainCategoriesSortableProps {
  onEdit: (mainCategory: MainCategory) => void;
  onDelete: (mainCategoryId: number) => void;
}

export function MainCategoriesSortable({
  onEdit,
  onDelete,
}: MainCategoriesSortableProps) {
  const { mainCategories, reorderMainCategories } = useCategoryStore();

  // Sort by sortOrder
  const sortedMainCategories = [...mainCategories].sort((a, b) => a.sortOrder - b.sortOrder);

  const [localMainCategories, setLocalMainCategories] = useState(sortedMainCategories);

  // Update local main categories when they change
  useEffect(() => {
    setLocalMainCategories(sortedMainCategories);
  }, [mainCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localMainCategories.findIndex((cat) => cat.id === active.id);
      const newIndex = localMainCategories.findIndex((cat) => cat.id === over.id);

      const newMainCategories = arrayMove(localMainCategories, oldIndex, newIndex);
      setLocalMainCategories(newMainCategories);

      // Update store with new order
      reorderMainCategories(newMainCategories);
    }
  };

  if (sortedMainCategories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        まだメインカテゴリーがありません
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localMainCategories.map((cat) => cat.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {localMainCategories.map((mainCategory) => (
            <SortableItem
              key={mainCategory.id}
              mainCategory={mainCategory}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
