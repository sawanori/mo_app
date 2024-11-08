"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Save, Trash2, Star, Clock, Sparkles } from "lucide-react";
import { useCategoryStore } from "@/lib/store/categories";
import { useMenuStore } from "@/lib/store/menu";
import { useFeaturedStore, FeaturedType } from "@/lib/store/featured";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function AdminPage() {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isUpdatingFeatured, setIsUpdatingFeatured] = useState<FeaturedType | null>(null);
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { items: menuItems, addItem, updateItem, deleteItem } = useMenuStore();
  const { featuredItems, setFeaturedItem } = useFeaturedStore();
  const { toast } = useToast();

  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory("");
      toast({
        title: "カテゴリーを追加しました",
      });
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory(null);
      toast({
        title: "カテゴリーを更新しました",
      });
    }
  };

  const handleDeleteCategory = (categoryId: number) => {
    deleteCategory(categoryId);
    const itemsToDelete = menuItems.filter(item => 
      categories.find(c => c.id === categoryId)?.name === item.category
    );
    itemsToDelete.forEach(item => deleteItem(item.id));
    setCategoryToDelete(null);
    toast({
      title: "カテゴリーを削除しました",
      description: `${itemsToDelete.length}個の商品も削除されました`,
    });
  };

  const handleAddMenuItem = () => {
    if (newMenuItem.name && newMenuItem.price && newMenuItem.category) {
      addItem({
        name: newMenuItem.name,
        price: parseInt(newMenuItem.price),
        description: newMenuItem.description,
        category: newMenuItem.category,
        image: newMenuItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      });
      setNewMenuItem({
        name: "",
        price: "",
        description: "",
        category: "",
        image: "",
      });
      toast({
        title: "商品を追加しました",
      });
    }
  };

  const handleSetFeatured = async (type: FeaturedType, itemId: string | null) => {
    setIsUpdatingFeatured(type);
    try {
      // APIリクエストをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeaturedItem(type, itemId);
      toast({
        title: "特集商品を更新しました",
        description: "変更はホームページに反映されます",
      });
    } finally {
      setIsUpdatingFeatured(null);
    }
  };

  const getFeaturedBadgeInfo = (type: FeaturedType) => {
    switch (type) {
      case "monthly":
        return { icon: <Star className="h-4 w-4" />, label: "今月のおすすめ" };
      case "limited":
        return { icon: <Clock className="h-4 w-4" />, label: "期間限定" };
      case "new":
        return { icon: <Sparkles className="h-4 w-4" />, label: "新メニュー" };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">管理画面</h1>
        
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">カテゴリー管理</TabsTrigger>
            <TabsTrigger value="items">商品管理</TabsTrigger>
            <TabsTrigger value="featured">特集商品</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="新しいカテゴリー名"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    追加
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      {editingCategory?.id === category.id ? (
                        <>
                          <Input
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, name: e.target.value })
                            }
                          />
                          <Button onClick={handleUpdateCategory}>
                            <Save className="h-4 w-4 mr-2" />
                            保存
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">{category.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                          >
                            編集
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCategoryToDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">カテゴリー</Label>
                    <Select
                      value={newMenuItem.category}
                      onValueChange={(value) =>
                        setNewMenuItem({ ...newMenuItem, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name">商品名</Label>
                    <Input
                      id="name"
                      value={newMenuItem.name}
                      onChange={(e) =>
                        setNewMenuItem({ ...newMenuItem, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">価格</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newMenuItem.price}
                      onChange={(e) =>
                        setNewMenuItem({ ...newMenuItem, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={newMenuItem.description}
                      onChange={(e) =>
                        setNewMenuItem({ ...newMenuItem, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image">画像URL</Label>
                    <Input
                      id="image"
                      value={newMenuItem.image}
                      onChange={(e) =>
                        setNewMenuItem({ ...newMenuItem, image: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <Button onClick={handleAddMenuItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    商品を追加
                  </Button>
                </div>

                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-semibold">登録済み商品一覧</h3>
                  <div className="grid gap-4">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{item.category}</Badge>
                            {Object.entries(featuredItems).map(([type, id]) => {
                              if (String(item.id) === id) {
                                const badge = getFeaturedBadgeInfo(type as FeaturedType);
                                return (
                                  <Badge key={type} variant="default" className="flex items-center gap-1">
                                    {badge.icon}
                                    {badge.label}
                                  </Badge>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            ¥{item.price.toLocaleString()}
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              deleteItem(item.id);
                              toast({
                                title: "商品を削除しました",
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="featured">
            <Card className="p-6">
              <div className="space-y-6">
                {(["monthly", "limited", "new"] as const).map((type) => {
                  const badge = getFeaturedBadgeInfo(type);
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {badge.icon}
                        <h3 className="text-lg font-semibold">{badge.label}</h3>
                      </div>
                      <div className="relative">
                        <Select
                          value={featuredItems[type] || ""}
                          onValueChange={(value) => handleSetFeatured(type, value)}
                          disabled={isUpdatingFeatured === type}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="商品を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isUpdatingFeatured === type && (
                          <div className="absolute inset-y-0 right-10 flex items-center">
                            <LoadingSpinner />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>カテゴリーを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このカテゴリーに属する全ての商品も削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}