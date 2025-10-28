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
import { MenuItem, useMenuStore } from "@/lib/store/menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SortableItemProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

function SortableItem({ item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} data-testid={`menu-sort-item-${item.id}`}>
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            {...attributes}
            {...listeners}
            data-testid={`menu-sort-drag-${item.id}`}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Item Image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {item.mediaType === "video" ? (
              <video
                src={item.image}
                className="w-full h-full object-cover"
                muted
                loop
              />
            ) : (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                }}
              />
            )}
          </div>

          {/* Item Info */}
          <div className="flex-1">
            <h4 className="font-semibold">{item.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {item.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.subCategory}
              </Badge>
              <span className="text-sm font-bold text-primary">
                {formatPrice(item.price)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
              data-testid={`menu-sort-edit-${item.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item.id)}
              data-testid={`menu-sort-delete-${item.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface MenuItemsSortableProps {
  category: string;
  subCategory: string;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

export function MenuItemsSortable({
  category,
  subCategory,
  onEdit,
  onDelete,
}: MenuItemsSortableProps) {
  const { items, reorderItems } = useMenuStore();

  // Filter items by category and subCategory, then sort by sortOrder
  const filteredItems = items
    .filter((item) => item.category === category && item.subCategory === subCategory)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [localItems, setLocalItems] = useState(filteredItems);

  // Update local items when filtered items change
  useEffect(() => {
    setLocalItems(filteredItems);
  }, [filteredItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);

      // Update store with new order
      reorderItems(category, subCategory, newItems);
    }
  };

  if (filteredItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        このサブカテゴリーにはまだ商品がありません
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
        items={localItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3" data-testid="menu-sort-list">
          {localItems.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
