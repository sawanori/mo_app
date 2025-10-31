'use client';

import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CSVImport = dynamic(() => import('@/components/csv-import').then(mod => ({ default: mod.CSVImport })), {
  ssr: false,
  loading: () => <div className="p-8 text-center">読み込み中...</div>
});

export default function ImportPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            管理画面に戻る
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">メニューインポート</h1>
        <p className="text-gray-600 mt-2">
          CSVファイルからメニューアイテムを一括で登録・更新できます
        </p>
      </div>

      <CSVImport />

      {/* Sample CSV Download */}
      <div className="mt-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">サンプルCSV</h2>
        <p className="text-sm text-gray-600 mb-4">
          以下はCSVフォーマットの例です。必要に応じてコピーしてご使用ください。
        </p>
        <pre className="text-xs bg-white p-4 rounded border overflow-x-auto">
{`main_category,sub_category,item_name,description,price,image,sort_order,is_available,allergens,dietary_tags,card_size,media_type
メイン料理,肉料理,ハンバーグステーキ,ジューシーな牛肉100%のハンバーグ,1200,https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf,1,1,"卵,乳","人気,おすすめ",normal,image
メイン料理,肉料理,グリルチキン,特製ソースのグリルチキン,980,https://images.unsplash.com/photo-1598103442097-8b74394b95c6,2,1,,"ヘルシー,人気",normal,image
メイン料理,魚料理,サーモンステーキ,ノルウェー産サーモン,1500,https://images.unsplash.com/photo-1580959375944-d33396f9e0a2,1,1,"魚","ヘルシー",normal,image
サイド,サラダ,シーザーサラダ,新鮮野菜とクルトン,600,https://images.unsplash.com/photo-1546069901-ba9599a7e63c,1,1,"卵,乳","ヘルシー,ベジタリアン",normal,image
ドリンク,ビール,生ビール,キンキンに冷えた生ビール,500,https://images.unsplash.com/photo-1535958636474-b021ee887b13,1,1,,"アルコール",normal,image`}
        </pre>
      </div>
    </div>
  );
}
