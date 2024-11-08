"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface MenuStore {
  items: MenuItem[];
  addItem: (item: Omit<MenuItem, "id">) => void;
  updateItem: (id: number, item: Partial<MenuItem>) => void;
  deleteItem: (id: number) => void;
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      items: [
        {
          id: 1,
          name: "チーズバーガー",
          price: 580,
          description: "とろけるチーズと100%ビーフパティの絶妙な組み合わせ",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
          category: "メイン料理"
        },
        {
          id: 2,
          name: "アボカドバーガー",
          price: 680,
          description: "新鮮なアボカドとスパイシーソースの特製バーガー",
          image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500",
          category: "メイン料理"
        },
        {
          id: 3,
          name: "フィッシュバーガー",
          price: 520,
          description: "サクサクの白身魚フライにタルタルソースを添えて",
          image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500",
          category: "メイン料理"
        },
        {
          id: 4,
          name: "ダブルチーズバーガー",
          price: 780,
          description: "ジューシーなパティを2枚重ねた満足度抜群のバーガー",
          image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500",
          category: "メイン料理"
        },
        {
          id: 5,
          name: "テリヤキバーガー",
          price: 620,
          description: "特製テリヤキソースで仕上げた和風テイストのバーガー",
          image: "https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?w=500",
          category: "メイン料理"
        },
        {
          id: 6,
          name: "フライドポテト",
          price: 320,
          description: "カリッと揚がった定番のポテト",
          image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
          category: "サイドメニュー"
        },
        {
          id: 7,
          name: "オニオンリング",
          price: 280,
          description: "サクサク食感の特製オニオンリング",
          image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=500",
          category: "サイドメニュー"
        },
        {
          id: 8,
          name: "チキンナゲット",
          price: 350,
          description: "ジューシーな国産鶏肉使用の6ピース",
          image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500",
          category: "サイドメニュー"
        },
        {
          id: 9,
          name: "サラダ",
          price: 380,
          description: "新鮮な野菜を使用したヘルシーなサイドメニュー",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
          category: "サイドメニュー"
        },
        {
          id: 10,
          name: "コールスロー",
          price: 250,
          description: "自家製ドレッシングで仕上げた定番サイドメニュー",
          image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500",
          category: "サイドメニュー"
        },
        {
          id: 11,
          name: "コーラ",
          price: 220,
          description: "炭酸たっぷりの清涼飲料",
          image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
          category: "ドリンク"
        },
        {
          id: 12,
          name: "アイスコーヒー",
          price: 250,
          description: "こだわりの豆を使用した本格アイスコーヒー",
          image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500",
          category: "ドリンク"
        },
        {
          id: 13,
          name: "ミルクシェイク",
          price: 380,
          description: "濃厚でクリーミーなバニラシェイク",
          image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500",
          category: "ドリンク"
        },
        {
          id: 14,
          name: "オレンジジュース",
          price: 280,
          description: "搾りたての新鮮なオレンジジュース",
          image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500",
          category: "ドリンク"
        },
        {
          id: 15,
          name: "アイスティー",
          price: 250,
          description: "さっぱりとした味わいの自家製アイスティー",
          image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
          category: "ドリンク"
        },
        {
          id: 16,
          name: "アップルパイ",
          price: 320,
          description: "サクサクのパイ生地と甘酸っぱいリンゴの絶妙なハーモニー",
          image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=500",
          category: "デザート"
        },
        {
          id: 17,
          name: "チョコレートサンデー",
          price: 420,
          description: "濃厚チョコレートソースとバニラアイスの贅沢なデザート",
          image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500",
          category: "デザート"
        },
        {
          id: 18,
          name: "ストロベリーパフェ",
          price: 480,
          description: "新鮮なイチゴとホイップクリームの華やかなパフェ",
          image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
          category: "デザート"
        },
        {
          id: 19,
          name: "バニラソフトクリーム",
          price: 280,
          description: "なめらかな口当たりの本格バニラソフトクリーム",
          image: "https://images.unsplash.com/photo-1549395156-e0c1fe6fc7a5?w=500",
          category: "デザート"
        },
        {
          id: 20,
          name: "チーズケーキ",
          price: 380,
          description: "しっとり濃厚な特製ベイクドチーズケーキ",
          image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500",
          category: "デザート"
        },
      ],
      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            { ...item, id: Math.max(...state.items.map(i => i.id), 0) + 1 },
          ],
        })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'menu-storage',
    }
  )
);