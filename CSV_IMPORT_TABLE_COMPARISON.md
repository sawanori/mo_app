# テーブル構造比較: 要件定義書 vs 現在のSupabase

## 📊 比較結果サマリー

### ✅ 一致している点
- テーブルの基本構造は存在する
- 主キーとリレーションシップは正しい

### ⚠️ 不整合・相違点

---

## 1. main_categories テーブル

### 要件定義書
```sql
- id: uuid (PK)
- name: text (UNIQUE)
- display_order: integer
- created_at: timestamp
- updated_at: timestamp
```

### 現在のSupabase
```typescript
- id: number (PK)          ⚠️ uuid → number
- name: string (UNIQUE)    ✅
- sort_order: number       ⚠️ display_order → sort_order
- created_at: string       ✅
- updated_at: string       ✅
```

### 📝 差異
1. **id型**: `uuid` → `number` (integer, auto-increment)
2. **カラム名**: `display_order` → `sort_order`

### 推奨対応
✅ **現在の構造を採用** - `number`の方がシンプルで管理しやすい

---

## 2. sub_categories テーブル

### 要件定義書
```sql
- id: uuid (PK)
- main_category_id: uuid (FK)
- name: text
- display_order: integer
- created_at: timestamp
- updated_at: timestamp
- UNIQUE(main_category_id, name)
```

### 現在のSupabase
```typescript
- id: number (PK)                      ⚠️ uuid → number
- main_category_id: number (FK)        ⚠️ uuid → number
- name: string                         ✅
- sort_order: number                   ⚠️ display_order → sort_order
- background_image: string | null      ➕ 追加フィールド
- display_type: string | null          ➕ 追加フィールド
- created_at: string                   ✅
- updated_at: string                   ✅
```

### 📝 差異
1. **id型**: `uuid` → `number`
2. **FK型**: `uuid` → `number`
3. **カラム名**: `display_order` → `sort_order`
4. **追加フィールド**: `background_image`, `display_type`

### 推奨対応
✅ **現在の構造を採用** - 追加フィールドは既存機能で使用されている可能性あり

---

## 3. menu_items テーブル

### 要件定義書
```sql
- id: uuid (PK)
- sub_category_id: uuid (FK)
- name: text
- description: text
- price: integer
- image_url: text
- is_available: boolean
- allergens: text[] または jsonb
- dietary_tags: text[] または jsonb
- display_order: integer
- created_at: timestamp
- updated_at: timestamp
- UNIQUE(sub_category_id, name)
```

### 現在のSupabase
```typescript
- id: number (PK)                   ⚠️ uuid → number
- sub_category_id: number (FK)      ⚠️ uuid → number
- name: string                      ✅
- description: string               ✅
- price: number                     ✅
- image: string                     ⚠️ image_url → image
- category: string                  ➕ 追加フィールド (メインカテゴリー名)
- sub_category: string              ➕ 追加フィールド (サブカテゴリー名)
- sort_order: number                ⚠️ display_order → sort_order
- card_size: string | null          ➕ 追加フィールド
- media_type: string | null         ➕ 追加フィールド
- created_at: string                ✅
- updated_at: string                ✅
- ❌ is_available: MISSING           ⚠️ 欠落
- ❌ allergens: MISSING              ⚠️ 欠落
- ❌ dietary_tags: MISSING           ⚠️ 欠落
```

### 📝 差異
1. **id型**: `uuid` → `number`
2. **FK型**: `uuid` → `number`
3. **カラム名**: `image_url` → `image`, `display_order` → `sort_order`
4. **追加フィールド**: `category`, `sub_category`, `card_size`, `media_type`
5. **❌ 欠落フィールド**: `is_available`, `allergens`, `dietary_tags`

### 🚨 重要な問題
**欠落しているフィールド:**
- `is_available` - 提供可能フラグ（CSVに必須）
- `allergens` - アレルゲン情報（CSVにオプション）
- `dietary_tags` - タグ情報（CSVにオプション）

### 推奨対応
⚠️ **マイグレーション必要** - 欠落フィールドを追加する必要あり

---

## 📋 修正が必要な項目

### 1. 要件定義書の修正（推奨）

**CSV_BULK_IMPORT_REQUIREMENTS.md を以下のように修正:**

#### カラム定義の変更:
```diff
- id: uuid (PK)          → id: number (PK, auto-increment)
- main_category_id: uuid → main_category_id: number
- sub_category_id: uuid  → sub_category_id: number
- display_order          → sort_order
- image_url              → image
```

#### CSVフォーマットの変更:
```csv
main_category,sub_category,item_name,description,price,image,is_available,allergens,dietary_tags,sort_order
```

### 2. Supabaseテーブルへの追加が必要なカラム

**menu_items テーブルに以下を追加:**

```sql
ALTER TABLE menu_items
ADD COLUMN is_available BOOLEAN DEFAULT true,
ADD COLUMN allergens TEXT[] DEFAULT '{}',
ADD COLUMN dietary_tags TEXT[] DEFAULT '{}';
```

または、JSONB形式の場合:
```sql
ALTER TABLE menu_items
ADD COLUMN is_available BOOLEAN DEFAULT true,
ADD COLUMN allergens JSONB DEFAULT '[]',
ADD COLUMN dietary_tags JSONB DEFAULT '[]';
```

---

## 🎯 推奨アクション

### Phase 1: テーブルスキーマ修正
1. ✅ Supabaseで`menu_items`テーブルに欠落カラムを追加
   - `is_available: boolean`
   - `allergens: text[]` または `jsonb`
   - `dietary_tags: text[]` または `jsonb`

### Phase 2: 要件定義書の更新
2. ✅ `CSV_BULK_IMPORT_REQUIREMENTS.md`を現在のテーブル構造に合わせて修正
   - id型を`number`に変更
   - カラム名を実際の名前に変更（`sort_order`, `image`）
   - CSVサンプルを更新

### Phase 3: 実装時の対応
3. ✅ CSVインポート機能で以下を考慮:
   - カテゴリー名からIDを取得/作成
   - `is_available`のデフォルト値は`true`(1)
   - `allergens`, `dietary_tags`は空配列でも許可
   - 既存の`category`, `sub_category`フィールドも更新

---

## 📝 修正後のCSVフォーマット（最終版）

```csv
main_category,sub_category,item_name,description,price,image,is_available,allergens,dietary_tags,sort_order
メイン料理,肉料理,ハンバーグステーキ,ジューシーな牛肉100%のハンバーグ,1200,https://example.com/hamburger.jpg,1,"卵,乳","人気,おすすめ",1
メイン料理,肉料理,グリルチキン,特製ソースのグリルチキン,980,https://example.com/chicken.jpg,1,,"ヘルシー,人気",2
メイン料理,魚料理,サーモンステーキ,ノルウェー産サーモン,1500,https://example.com/salmon.jpg,1,"魚","ヘルシー",1
サイド,サラダ,シーザーサラダ,新鮮野菜とクルトン,600,https://example.com/salad.jpg,1,"卵,乳","ヘルシー,ベジタリアン",1
ドリンク,ビール,生ビール,キンキンに冷えた生ビール,500,https://example.com/beer.jpg,1,,"アルコール",1
```

---

## ✅ 次のステップ

1. **Supabaseでマイグレーション実行**
   ```sql
   -- menu_itemsテーブルに欠落カラムを追加
   ALTER TABLE menu_items
   ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
   ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}',
   ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}';
   ```

2. **要件定義書を更新**
   - カラム名とデータ型を現在の構造に合わせる

3. **実装開始**
   - 修正後の要件定義書を基に実装

---

**作成日**: 2025年10月31日
**最終更新**: 2025年10月31日
