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
import { SubCategory, useCategoryStore } from "@/lib/store/categories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMenuStore } from "@/lib/store/menu";

interface SortableItemProps {
  subCategory: SubCategory;
  mainCategoryName: string;
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (subCategoryId: number) => void;
}

function SortableItem({ subCategory, mainCategoryName, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subCategory.id });

  const menuItems = useMenuStore((state) => state.items);
  const itemCount = menuItems.filter(
    item => item.category === mainCategoryName && item.subCategory === subCategory.name
  ).length;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} data-testid={`subcat-sort-item-${subCategory.id}`}>
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            {...attributes}
            {...listeners}
            data-testid={`subcat-sort-drag-${subCategory.id}`}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* SubCategory Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{subCategory.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {itemCount}品
              </Badge>
              <Badge variant="outline" className="text-xs">
                {subCategory.displayType === "image" ? "画像背景" : "テキスト"}
              </Badge>
            </div>
            {subCategory.backgroundImage && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subCategory.backgroundImage}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(subCategory)}
              data-testid={`subcat-sort-edit-${subCategory.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(subCategory.id)}
              data-testid={`subcat-sort-delete-${subCategory.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface SubCategoriesSortableProps {
  mainCategoryId: number;
  mainCategoryName: string;
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (mainCategoryId: number, subCategoryId: number) => void;
}

export function SubCategoriesSortable({
  mainCategoryId,
  mainCategoryName,
  onEdit,
  onDelete,
}: SubCategoriesSortableProps) {
  const { mainCategories, reorderSubCategories } = useCategoryStore();

  const mainCategory = mainCategories.find(cat => cat.id === mainCategoryId);
  const subCategories = mainCategory?.subCategories || [];

  // Sort by sortOrder
  const sortedSubCategories = [...subCategories].sort((a, b) => a.sortOrder - b.sortOrder);

  const [localSubCategories, setLocalSubCategories] = useState(sortedSubCategories);

  // Update local subcategories when they change
  useEffect(() => {
    setLocalSubCategories(sortedSubCategories);
  }, [subCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localSubCategories.findIndex((sub) => sub.id === active.id);
      const newIndex = localSubCategories.findIndex((sub) => sub.id === over.id);

      const newSubCategories = arrayMove(localSubCategories, oldIndex, newIndex);
      setLocalSubCategories(newSubCategories);

      // Update store with new order
      reorderSubCategories(mainCategoryId, newSubCategories);
    }
  };

  if (sortedSubCategories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        このメインカテゴリーにはまだサブカテゴリーがありません
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
        items={localSubCategories.map((sub) => sub.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3" data-testid="subcat-sort-list">
          {localSubCategories.map((subCategory) => (
            <SortableItem
              key={subCategory.id}
              subCategory={subCategory}
              mainCategoryName={mainCategoryName}
              onEdit={onEdit}
              onDelete={(subCategoryId) => onDelete(mainCategoryId, subCategoryId)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
