"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Plus, Save, Trash2, Star, Clock, Sparkles, Edit } from "lucide-react";
import { useCategoryStore } from "@/lib/store/categories";
import { useMenuStore } from "@/lib/store/menu";
import { useFeaturedStore, FeaturedType } from "@/lib/store/featured";
import { useThemeStore, ColorTheme, COLOR_THEMES } from "@/lib/store/theme";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { MenuItemsSortable } from "@/components/menu-items-sortable";
import { SubCategoriesSortable } from "@/components/subcategories-sortable";
import { MainCategoriesSortable } from "@/components/main-categories-sortable";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isUpdatingFeatured, setIsUpdatingFeatured] = useState<FeaturedType | null>(null);

  // サブカテゴリー用のstate
  const [newSubCategory, setNewSubCategory] = useState<{
    mainCategoryId: number;
    name: string;
    displayType: "text" | "image";
    backgroundImage: string;
  } | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<{
    mainCategoryId: number;
    subCategoryId: number;
    name: string;
    displayType: "text" | "image";
    backgroundImage: string;
  } | null>(null);

  const { mainCategories, addMainCategory, updateMainCategory, deleteMainCategory, addSubCategory, updateSubCategory, deleteSubCategory, fetchCategories } = useCategoryStore();
  const { items: menuItems, addItem, updateItem, deleteItem, fetchItems } = useMenuStore();
  const { featuredItems, setFeaturedItem, fetchFeaturedItems } = useFeaturedStore();
  const { currentTheme, setTheme, fetchTheme } = useThemeStore();
  const { toast } = useToast();

  // 認証チェック
  useEffect(() => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        if (authData.state?.isAuthenticated === true) {
          setIsAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        router.push("/admin/login");
      }
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  // データ取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchItems();
      fetchFeaturedItems();
      fetchTheme();
    }
  }, [isAuthenticated, fetchCategories, fetchItems, fetchFeaturedItems, fetchTheme]);

  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subCategory: "",
    image: "",
    cardSize: "normal" as "normal" | "large",
    mediaType: "image" as "image" | "video",
  });

  const [editingMenuItem, setEditingMenuItem] = useState<{
    id: number;
    name: string;
    price: string;
    description: string;
    category: string;
    subCategory: string;
    image: string;
    cardSize: "normal" | "large";
    mediaType: "image" | "video";
  } | null>(null);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addMainCategory(newCategory.trim());
      setNewCategory("");
      toast({
        title: "カテゴリーを追加しました",
      });
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateMainCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory(null);
      toast({
        title: "カテゴリーを更新しました",
      });
    }
  };

  const handleDeleteCategory = (categoryId: number) => {
    deleteMainCategory(categoryId);
    const itemsToDelete = menuItems.filter(item =>
      mainCategories.find(c => c.id === categoryId)?.name === item.category
    );
    itemsToDelete.forEach(item => deleteItem(item.id));
    setCategoryToDelete(null);
    toast({
      title: "カテゴリーを削除しました",
      description: `${itemsToDelete.length}個の商品も削除されました`,
    });
  };

  // サブカテゴリーのハンドラー
  const handleAddSubCategory = () => {
    if (newSubCategory && newSubCategory.name.trim()) {
      addSubCategory(
        newSubCategory.mainCategoryId,
        newSubCategory.name.trim(),
        newSubCategory.displayType,
        newSubCategory.backgroundImage || undefined
      );
      setNewSubCategory(null);
      toast({
        title: "サブカテゴリーを追加しました",
      });
    }
  };

  const handleUpdateSubCategory = () => {
    if (editingSubCategory && editingSubCategory.name.trim()) {
      updateSubCategory(
        editingSubCategory.mainCategoryId,
        editingSubCategory.subCategoryId,
        editingSubCategory.name.trim(),
        editingSubCategory.displayType,
        editingSubCategory.backgroundImage || undefined
      );
      setEditingSubCategory(null);
      toast({
        title: "サブカテゴリーを更新しました",
      });
    }
  };

  const handleDeleteSubCategory = (mainCategoryId: number, subCategoryId: number) => {
    const mainCategory = mainCategories.find(c => c.id === mainCategoryId);
    const subCategory = mainCategory?.subCategories.find(s => s.id === subCategoryId);

    deleteSubCategory(mainCategoryId, subCategoryId);

    // サブカテゴリーに属する商品を削除
    const itemsToDelete = menuItems.filter(item =>
      item.category === mainCategory?.name && item.subCategory === subCategory?.name
    );
    itemsToDelete.forEach(item => deleteItem(item.id));

    toast({
      title: "サブカテゴリーを削除しました",
      description: `${itemsToDelete.length}個の商品も削除されました`,
    });
  };

  const handleAddMenuItem = () => {
    if (newMenuItem.name && newMenuItem.price && newMenuItem.category && newMenuItem.subCategory) {
      addItem({
        name: newMenuItem.name,
        price: parseInt(newMenuItem.price),
        description: newMenuItem.description,
        category: newMenuItem.category,
        subCategory: newMenuItem.subCategory,
        image: newMenuItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        cardSize: newMenuItem.cardSize,
        mediaType: newMenuItem.mediaType,
      });
      setNewMenuItem({
        name: "",
        price: "",
        description: "",
        category: "",
        subCategory: "",
        image: "",
        cardSize: "normal",
        mediaType: "image",
      });
      toast({
        title: "商品を追加しました",
      });
    } else {
      toast({
        title: "エラー",
        description: "すべての必須項目を入力してください",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMenuItem = () => {
    if (editingMenuItem && editingMenuItem.name && editingMenuItem.price && editingMenuItem.category && editingMenuItem.subCategory) {
      updateItem(editingMenuItem.id, {
        name: editingMenuItem.name,
        price: parseInt(editingMenuItem.price),
        description: editingMenuItem.description,
        category: editingMenuItem.category,
        subCategory: editingMenuItem.subCategory,
        image: editingMenuItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        cardSize: editingMenuItem.cardSize,
        mediaType: editingMenuItem.mediaType,
      });
      setEditingMenuItem(null);
      toast({
        title: "商品を更新しました",
      });
    } else {
      toast({
        title: "エラー",
        description: "すべての必須項目を入力してください",
        variant: "destructive",
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
      case "slide1":
        return { icon: <Star className="h-4 w-4" />, label: "おすすめ" };
      case "slide2":
        return { icon: <Star className="h-4 w-4" />, label: "人気" };
      case "slide3":
        return { icon: <Star className="h-4 w-4" />, label: "特選" };
      case "slide4":
        return { icon: <Sparkles className="h-4 w-4" />, label: "デザート" };
      case "slide5":
        return { icon: <Sparkles className="h-4 w-4" />, label: "NEW" };
      default:
        return { icon: <Star className="h-4 w-4" />, label: "特集" };
    }
  };

  // 認証チェック中は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

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
              <div className="space-y-6">
                {/* グローバルテーマ選択 */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">店舗ページのカラーテーマ</h3>
                  <RadioGroup
                    value={currentTheme}
                    onValueChange={(value: ColorTheme) => {
                      setTheme(value);
                      toast({
                        title: "カラーテーマを変更しました",
                        description: `${value === "part1" ? "Part1 (白背景)" : "Part2 (灰背景)"}に設定されました`,
                      });
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="part1" id="theme-part1" />
                        <Label htmlFor="theme-part1" className="font-normal cursor-pointer">
                          Part1 (白背景)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="part2" id="theme-part2" />
                        <Label htmlFor="theme-part2" className="font-normal cursor-pointer">
                          Part2 (灰背景)
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: COLOR_THEMES[currentTheme].background }}>
                    <p className="text-sm font-medium" style={{ color: COLOR_THEMES[currentTheme].mainText }}>
                      プレビュー: メインテキスト
                    </p>
                    <p className="text-xs" style={{ color: COLOR_THEMES[currentTheme].navigationText }}>
                      ナビゲーションテキスト
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">メインカテゴリー追加</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="新しいメインカテゴリー名"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button onClick={handleAddCategory}>
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">カテゴリー一覧（階層構造）</h3>
                  <div className="space-y-4">
                    {mainCategories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        {/* メインカテゴリー */}
                        <div className="flex items-center gap-2 mb-3">
                          {editingCategory?.id === category.id ? (
                            <>
                              <Input
                                value={editingCategory.name}
                                onChange={(e) =>
                                  setEditingCategory({ ...editingCategory, name: e.target.value })
                                }
                                className="flex-1"
                              />
                              <Button size="sm" onClick={handleUpdateCategory}>
                                <Save className="h-4 w-4 mr-2" />
                                保存
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                                キャンセル
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 font-semibold text-base">{category.name}</span>
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

                        {/* サブカテゴリー一覧 */}
                        <div className="ml-6 space-y-2">
                          {category.subCategories.map((subCategory) => (
                            <div key={subCategory.id}>
                              {editingSubCategory?.subCategoryId === subCategory.id ? (
                                <Card className="p-4 mb-2">
                                  <div className="grid gap-3">
                                    <div className="grid gap-2">
                                      <Label>サブカテゴリー名</Label>
                                      <Input
                                        value={editingSubCategory.name}
                                        onChange={(e) =>
                                          setEditingSubCategory({ ...editingSubCategory, name: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>表示タイプ</Label>
                                      <RadioGroup
                                        value={editingSubCategory.displayType}
                                        onValueChange={(value: "text" | "image") =>
                                          setEditingSubCategory({ ...editingSubCategory, displayType: value })
                                        }
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="text" id={`edit-sub-text-${subCategory.id}`} />
                                          <Label htmlFor={`edit-sub-text-${subCategory.id}`} className="font-normal cursor-pointer">
                                            テキストのみ
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="image" id={`edit-sub-image-${subCategory.id}`} />
                                          <Label htmlFor={`edit-sub-image-${subCategory.id}`} className="font-normal cursor-pointer">
                                            背景画像付き
                                          </Label>
                                        </div>
                                      </RadioGroup>
                                    </div>
                                    {editingSubCategory.displayType === "image" && (
                                      <div className="grid gap-2">
                                        <Label>背景画像URL</Label>
                                        <Input
                                          value={editingSubCategory.backgroundImage}
                                          onChange={(e) =>
                                            setEditingSubCategory({ ...editingSubCategory, backgroundImage: e.target.value })
                                          }
                                          placeholder="https://example.com/background.jpg"
                                        />
                                        {editingSubCategory.backgroundImage && (
                                          <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                                            <p className="text-sm font-medium mb-2">プレビュー:</p>
                                            <div className="h-20 rounded-lg overflow-hidden border-2 border-primary/20 relative">
                                              <img
                                                src={editingSubCategory.backgroundImage}
                                                alt="背景プレビュー"
                                                className="w-full h-full object-cover"
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg bg-black/50 px-3 py-1 rounded">
                                                  {editingSubCategory.name}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={handleUpdateSubCategory}>
                                        <Save className="h-4 w-4 mr-2" />
                                        保存
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingSubCategory(null)}>
                                        キャンセル
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">└ {subCategory.name}</span>
                                    <div className="flex gap-1 mt-1">
                                      <Badge variant={subCategory.displayType === "image" ? "default" : "secondary"} className="text-xs">
                                        {subCategory.displayType === "image" ? "背景画像付き" : "テキストのみ"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingSubCategory({
                                      mainCategoryId: category.id,
                                      subCategoryId: subCategory.id,
                                      name: subCategory.name,
                                      displayType: subCategory.displayType || "text",
                                      backgroundImage: subCategory.backgroundImage || "",
                                    })}
                                  >
                                    編集
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSubCategory(category.id, subCategory.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* サブカテゴリー追加フォーム */}
                          {newSubCategory?.mainCategoryId === category.id ? (
                            <Card className="p-4 border-2 border-dashed">
                              <div className="grid gap-3">
                                <div className="grid gap-2">
                                  <Label>サブカテゴリー名</Label>
                                  <Input
                                    placeholder="新しいサブカテゴリー名"
                                    value={newSubCategory.name}
                                    onChange={(e) =>
                                      setNewSubCategory({ ...newSubCategory, name: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>表示タイプ</Label>
                                  <RadioGroup
                                    value={newSubCategory.displayType}
                                    onValueChange={(value: "text" | "image") =>
                                      setNewSubCategory({ ...newSubCategory, displayType: value })
                                    }
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="text" id={`new-sub-text-${category.id}`} />
                                      <Label htmlFor={`new-sub-text-${category.id}`} className="font-normal cursor-pointer">
                                        テキストのみ
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="image" id={`new-sub-image-${category.id}`} />
                                      <Label htmlFor={`new-sub-image-${category.id}`} className="font-normal cursor-pointer">
                                        背景画像付き
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                {newSubCategory.displayType === "image" && (
                                  <div className="grid gap-2">
                                    <Label>背景画像URL</Label>
                                    <Input
                                      value={newSubCategory.backgroundImage}
                                      onChange={(e) =>
                                        setNewSubCategory({ ...newSubCategory, backgroundImage: e.target.value })
                                      }
                                      placeholder="https://example.com/background.jpg"
                                    />
                                    {newSubCategory.backgroundImage && (
                                      <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                                        <p className="text-sm font-medium mb-2">プレビュー:</p>
                                        <div className="h-20 rounded-lg overflow-hidden border-2 border-primary/20 relative">
                                          <img
                                            src={newSubCategory.backgroundImage}
                                            alt="背景プレビュー"
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg bg-black/50 px-3 py-1 rounded">
                                              {newSubCategory.name || "サブカテゴリー名"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleAddSubCategory}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    追加
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setNewSubCategory(null)}>
                                    キャンセル
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setNewSubCategory({
                                mainCategoryId: category.id,
                                name: "",
                                displayType: "text",
                                backgroundImage: ""
                              })}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              サブカテゴリーを追加
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* サブカテゴリーの並び替えセクション */}
                <div className="space-y-4 mt-12 border-t pt-8">
                  <h3 className="text-lg font-semibold">サブカテゴリーの並び替え（ドラッグ&ドロップ）</h3>
                  <p className="text-sm text-muted-foreground">
                    各メインカテゴリー内でサブカテゴリーをドラッグ&ドロップして順番を入れ替えることができます
                  </p>

                  {mainCategories.map((mainCategory) => (
                    <Card key={`sort-${mainCategory.id}`} className="p-6">
                      <div className="mb-4">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          <Badge variant="default">{mainCategory.name}</Badge>
                        </h4>
                      </div>
                      <SubCategoriesSortable
                        mainCategoryId={mainCategory.id}
                        mainCategoryName={mainCategory.name}
                        onEdit={(subCategory) => {
                          setEditingSubCategory({
                            mainCategoryId: mainCategory.id,
                            subCategoryId: subCategory.id,
                            name: subCategory.name,
                            displayType: subCategory.displayType || "text",
                            backgroundImage: subCategory.backgroundImage || "",
                          });
                          // Scroll to top to show the edit form
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onDelete={(mainCategoryId, subCategoryId) => {
                          deleteSubCategory(mainCategoryId, subCategoryId);
                          toast({
                            title: "サブカテゴリーを削除しました",
                          });
                        }}
                      />
                    </Card>
                  ))}
                </div>

                {/* メインカテゴリーの並び替えセクション */}
                <div className="space-y-4 mt-12 border-t pt-8">
                  <h3 className="text-lg font-semibold">メインカテゴリーの並び替え（ドラッグ&ドロップ）</h3>
                  <p className="text-sm text-muted-foreground">
                    メインカテゴリーをドラッグ&ドロップして順番を入れ替えることができます。サブカテゴリーや商品も一緒に移動します。
                  </p>

                  <Card className="p-6">
                    <MainCategoriesSortable
                      onEdit={(mainCategory) => {
                        setEditingCategory({
                          id: mainCategory.id,
                          name: mainCategory.name,
                        });
                        // Scroll to top to show the edit form
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onDelete={(mainCategoryId) => {
                        setCategoryToDelete(mainCategoryId);
                      }}
                    />
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">メインカテゴリー</Label>
                    <Select
                      value={newMenuItem.category}
                      onValueChange={(value) =>
                        setNewMenuItem({ ...newMenuItem, category: value, subCategory: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="メインカテゴリーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="subCategory">サブカテゴリー</Label>
                    <Select
                      value={newMenuItem.subCategory}
                      onValueChange={(value) =>
                        setNewMenuItem({ ...newMenuItem, subCategory: value })
                      }
                      disabled={!newMenuItem.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={newMenuItem.category ? "サブカテゴリーを選択" : "先にメインカテゴリーを選択してください"} />
                      </SelectTrigger>
                      <SelectContent>
                        {mainCategories
                          .find((cat) => cat.name === newMenuItem.category)
                          ?.subCategories.map((subCategory) => (
                            <SelectItem key={subCategory.id} value={subCategory.name}>
                              {subCategory.name}
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

                  <div className="grid gap-3">
                    <Label>メディアタイプ</Label>
                    <RadioGroup
                      value={newMenuItem.mediaType}
                      onValueChange={(value: "image" | "video") =>
                        setNewMenuItem({ ...newMenuItem, mediaType: value })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="media-image" />
                        <Label htmlFor="media-image" className="font-normal cursor-pointer">
                          画像
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="media-video" />
                        <Label htmlFor="media-video" className="font-normal cursor-pointer">
                          動画
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image">
                      {newMenuItem.mediaType === "image" ? "画像URL" : "動画URL"}
                    </Label>
                    <Input
                      id="image"
                      value={newMenuItem.image}
                      onChange={(e) =>
                        setNewMenuItem({ ...newMenuItem, image: e.target.value })
                      }
                      placeholder={
                        newMenuItem.mediaType === "image"
                          ? "https://example.com/image.jpg"
                          : "https://example.com/video.mp4"
                      }
                    />
                    {newMenuItem.image && (
                      <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                        <p className="text-sm font-medium mb-2">
                          {newMenuItem.mediaType === "image" ? "画像プレビュー:" : "動画プレビュー:"}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20 flex-shrink-0">
                            {newMenuItem.mediaType === "image" ? (
                              <img
                                src={newMenuItem.image}
                                alt="プレビュー"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                                }}
                              />
                            ) : (
                              <video
                                src={newMenuItem.image}
                                className="w-full h-full object-cover"
                                controls
                                muted
                                loop
                              />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {newMenuItem.mediaType === "image" ? (
                              <>
                                <p>1:1の正方形画像を推奨します</p>
                                <p className="mt-1">画像が読み込めない場合はデフォルト画像が使用されます</p>
                              </>
                            ) : (
                              <>
                                <p>MP4形式の動画を推奨します</p>
                                <p className="mt-1">自動再生・ループで表示されます</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <Label>カードサイズ</Label>
                    <RadioGroup
                      value={newMenuItem.cardSize}
                      onValueChange={(value: "normal" | "large") =>
                        setNewMenuItem({ ...newMenuItem, cardSize: value })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <Label htmlFor="normal" className="font-normal cursor-pointer">
                          通常サイズ（80x80px）
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large" className="font-normal cursor-pointer">
                          大きいカード（160x160px）
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-sm text-muted-foreground">
                      メニュー表示時のカードサイズを選択できます
                    </p>
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
                      <div key={item.id}>
                        {editingMenuItem?.id === item.id ? (
                          // 編集モード
                          <Card className="p-4">
                            <div className="grid gap-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor={`edit-category-${item.id}`}>メインカテゴリー</Label>
                                  <Select
                                    value={editingMenuItem.category}
                                    onValueChange={(value) =>
                                      setEditingMenuItem({ ...editingMenuItem, category: value, subCategory: "" })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mainCategories.map((category) => (
                                        <SelectItem key={category.id} value={category.name}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor={`edit-subcategory-${item.id}`}>サブカテゴリー</Label>
                                  <Select
                                    value={editingMenuItem.subCategory}
                                    onValueChange={(value) =>
                                      setEditingMenuItem({ ...editingMenuItem, subCategory: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mainCategories
                                        .find((cat) => cat.name === editingMenuItem.category)
                                        ?.subCategories.map((subCategory) => (
                                          <SelectItem key={subCategory.id} value={subCategory.name}>
                                            {subCategory.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`edit-name-${item.id}`}>商品名</Label>
                                <Input
                                  id={`edit-name-${item.id}`}
                                  value={editingMenuItem.name}
                                  onChange={(e) =>
                                    setEditingMenuItem({ ...editingMenuItem, name: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`edit-price-${item.id}`}>価格</Label>
                                <Input
                                  id={`edit-price-${item.id}`}
                                  type="number"
                                  value={editingMenuItem.price}
                                  onChange={(e) =>
                                    setEditingMenuItem({ ...editingMenuItem, price: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`edit-description-${item.id}`}>説明</Label>
                                <Textarea
                                  id={`edit-description-${item.id}`}
                                  value={editingMenuItem.description}
                                  onChange={(e) =>
                                    setEditingMenuItem({ ...editingMenuItem, description: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid gap-3">
                                <Label>メディアタイプ</Label>
                                <RadioGroup
                                  value={editingMenuItem.mediaType}
                                  onValueChange={(value: "image" | "video") =>
                                    setEditingMenuItem({ ...editingMenuItem, mediaType: value })
                                  }
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="image" id={`edit-media-image-${item.id}`} />
                                    <Label htmlFor={`edit-media-image-${item.id}`} className="font-normal cursor-pointer">
                                      画像
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="video" id={`edit-media-video-${item.id}`} />
                                    <Label htmlFor={`edit-media-video-${item.id}`} className="font-normal cursor-pointer">
                                      動画
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor={`edit-image-${item.id}`}>
                                  {editingMenuItem.mediaType === "image" ? "画像URL" : "動画URL"}
                                </Label>
                                <Input
                                  id={`edit-image-${item.id}`}
                                  value={editingMenuItem.image}
                                  onChange={(e) =>
                                    setEditingMenuItem({ ...editingMenuItem, image: e.target.value })
                                  }
                                  placeholder={
                                    editingMenuItem.mediaType === "image"
                                      ? "https://example.com/image.jpg"
                                      : "https://example.com/video.mp4"
                                  }
                                />
                                {editingMenuItem.image && (
                                  <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                                    <p className="text-sm font-medium mb-2">
                                      {editingMenuItem.mediaType === "image" ? "画像プレビュー:" : "動画プレビュー:"}
                                    </p>
                                    <div className="flex items-center gap-4">
                                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                                        {editingMenuItem.mediaType === "image" ? (
                                          <img
                                            src={editingMenuItem.image}
                                            alt="プレビュー"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                                            }}
                                          />
                                        ) : (
                                          <video
                                            src={editingMenuItem.image}
                                            className="w-full h-full object-cover"
                                            controls
                                            muted
                                            loop
                                          />
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {editingMenuItem.mediaType === "image" ? (
                                          <>
                                            <p>1:1の正方形画像を推奨します</p>
                                            <p className="mt-1">画像が読み込めない場合はデフォルト画像が使用されます</p>
                                          </>
                                        ) : (
                                          <>
                                            <p>MP4形式の動画を推奨します</p>
                                            <p className="mt-1">自動再生・ループで表示されます</p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="grid gap-3">
                                <Label>カードサイズ</Label>
                                <RadioGroup
                                  value={editingMenuItem.cardSize}
                                  onValueChange={(value: "normal" | "large") =>
                                    setEditingMenuItem({ ...editingMenuItem, cardSize: value })
                                  }
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="normal" id={`edit-normal-${item.id}`} />
                                    <Label htmlFor={`edit-normal-${item.id}`} className="font-normal cursor-pointer">
                                      通常サイズ（80x80px）
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="large" id={`edit-large-${item.id}`} />
                                    <Label htmlFor={`edit-large-${item.id}`} className="font-normal cursor-pointer">
                                      大きいカード（160x160px）
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleUpdateMenuItem}>
                                  <Save className="h-4 w-4 mr-2" />
                                  保存
                                </Button>
                                <Button variant="outline" onClick={() => setEditingMenuItem(null)}>
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          // 表示モード
                          <div className="flex gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-muted flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg">{item.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary">{item.category}</Badge>
                                <Badge variant="outline">{item.subCategory}</Badge>
                                <Badge variant={item.cardSize === "large" ? "default" : "secondary"}>
                                  {item.cardSize === "large" ? "大カード" : "通常"}
                                </Badge>
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
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 justify-between">
                              <span className="font-bold text-lg">
                                ¥{item.price.toLocaleString()}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingMenuItem({
                                      id: item.id,
                                      name: item.name,
                                      price: String(item.price),
                                      description: item.description,
                                      category: item.category,
                                      subCategory: item.subCategory,
                                      image: item.image,
                                      cardSize: item.cardSize || "normal",
                                      mediaType: item.mediaType || "image",
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
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
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 商品の並び替えセクション */}
                <div className="space-y-4 mt-12 border-t pt-8">
                  <h3 className="text-lg font-semibold">商品の並び替え（ドラッグ&ドロップ）</h3>
                  <p className="text-sm text-muted-foreground">
                    各サブカテゴリー内で商品をドラッグ&ドロップして順番を入れ替えることができます
                  </p>

                  {mainCategories.map((mainCategory) =>
                    mainCategory.subCategories.map((subCategory) => (
                      <Card key={`${mainCategory.id}-${subCategory.id}`} className="p-6">
                        <div className="mb-4">
                          <h4 className="font-semibold text-base flex items-center gap-2">
                            <Badge variant="secondary">{mainCategory.name}</Badge>
                            <span>/</span>
                            <Badge variant="outline">{subCategory.name}</Badge>
                          </h4>
                        </div>
                        <MenuItemsSortable
                          category={mainCategory.name}
                          subCategory={subCategory.name}
                          onEdit={(item) => {
                            setEditingMenuItem({
                              id: item.id,
                              name: item.name,
                              price: String(item.price),
                              description: item.description,
                              category: item.category,
                              subCategory: item.subCategory,
                              image: item.image,
                              cardSize: item.cardSize || "normal",
                              mediaType: item.mediaType || "image",
                            });
                            // Scroll to top to show the edit form
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          onDelete={(id) => {
                            deleteItem(id);
                            toast({
                              title: "商品を削除しました",
                            });
                          }}
                        />
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="featured">
            <Card className="p-6">
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  ヒーローセクションに表示される特集商品を設定できます（最大5つのスライド）
                </p>
                {(["slide1", "slide2", "slide3", "slide4", "slide5"] as const).map((type) => {
                  const badge = getFeaturedBadgeInfo(type);
                  const selectedItem = menuItems.find(item => String(item.id) === featuredItems[type]);

                  return (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center gap-2">
                        {badge.icon}
                        <h3 className="text-lg font-semibold">{badge.label}</h3>
                        <span className="text-sm text-muted-foreground">
                          (スライド {type.replace("slide", "")})
                        </span>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <Select
                            value={featuredItems[type] || ""}
                            onValueChange={(value) => handleSetFeatured(type, value)}
                            disabled={isUpdatingFeatured === type}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="商品を選択してください" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              {mainCategories.map((mainCat) => (
                                <div key={mainCat.id}>
                                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                                    {mainCat.name}
                                  </div>
                                  {mainCat.subCategories.map((subCat) => {
                                    const itemsInSubCat = menuItems.filter(
                                      item => item.category === mainCat.name && item.subCategory === subCat.name
                                    );
                                    if (itemsInSubCat.length === 0) return null;
                                    return (
                                      <div key={subCat.id}>
                                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                                          {subCat.name}
                                        </div>
                                        {itemsInSubCat.map((item) => (
                                          <SelectItem key={item.id} value={String(item.id)} className="pl-6">
                                            <div className="flex items-center gap-2">
                                              <span>{item.name}</span>
                                              <span className="text-xs text-muted-foreground">
                                                ¥{item.price}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          {isUpdatingFeatured === type && (
                            <div className="absolute inset-y-0 right-10 flex items-center">
                              <LoadingSpinner />
                            </div>
                          )}
                        </div>

                        {selectedItem && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20 flex-shrink-0">
                            <img
                              src={selectedItem.image}
                              alt={selectedItem.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {selectedItem && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">{selectedItem.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedItem.description}
                          </p>
                          <p className="text-sm font-semibold mt-2">
                            ¥{selectedItem.price.toLocaleString()}
                          </p>
                        </div>
                      )}
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