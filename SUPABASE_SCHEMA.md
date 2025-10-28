# Supabase データベーススキーマ設計

このドキュメントは、現在のZustandストアをSupabaseに移行するためのテーブル設計案です。

## テーブル構造

### 1. main_categories（メインカテゴリー）

```sql
CREATE TABLE main_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_main_categories_display_order ON main_categories(display_order);
```

**フィールド説明:**
- `id`: 主キー（自動採番）
- `name`: カテゴリー名（例: "メイン料理", "サイドメニュー"）
- `display_order`: 表示順序（並び替え用）
- `created_at`: 作成日時
- `updated_at`: 更新日時

**現在のZustandストアとの対応:**
```typescript
// lib/store/categories.ts
interface MainCategory {
  id: number;           // → main_categories.id
  name: string;         // → main_categories.name
  subCategories: [...]; // → sub_categoriesテーブルへの外部キー参照
}
```

---

### 2. sub_categories（サブカテゴリー）

```sql
CREATE TABLE sub_categories (
  id BIGSERIAL PRIMARY KEY,
  main_category_id BIGINT NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  display_type TEXT NOT NULL DEFAULT 'text' CHECK (display_type IN ('text', 'image')),
  background_image TEXT,
  color_theme TEXT NOT NULL DEFAULT 'part1' CHECK (color_theme IN ('part1', 'part2')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(main_category_id, name)
);

-- インデックス
CREATE INDEX idx_sub_categories_main_category ON sub_categories(main_category_id);
CREATE INDEX idx_sub_categories_display_order ON sub_categories(display_order);
```

**フィールド説明:**
- `id`: 主キー（自動採番）
- `main_category_id`: 親カテゴリーのID（外部キー）
- `name`: サブカテゴリー名（例: "ビーフバーガー", "揚げ物"）
- `display_order`: 表示順序
- `display_type`: 表示タイプ（'text' または 'image'、デフォルト: 'text'）
- `background_image`: 背景画像URL（display_type='image'の場合に使用、オプショナル）
- `color_theme`: カラーテーマ（'part1' または 'part2'、デフォルト: 'part1'）
  - 'part1': 白背景 (#ffffff)、黒テキスト (#1c1c1c)、グレーナビゲーション (#a1a1a1)
  - 'part2': 灰背景 (#696363)、白テキスト (#ffffff)、ライトグレーナビゲーション (#aba6a6)
- `UNIQUE(main_category_id, name)`: 同じメインカテゴリー内でサブカテゴリー名が重複しないように制約

**現在のZustandストアとの対応:**
```typescript
// lib/store/categories.ts
interface SubCategory {
  id: number;  // → sub_categories.id
  name: string; // → sub_categories.name
  displayType?: "text" | "image"; // → sub_categories.display_type
  backgroundImage?: string; // → sub_categories.background_image
  colorTheme?: ColorTheme; // → sub_categories.color_theme
}
```

---

### 3. menu_items（商品）

```sql
CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INT NOT NULL CHECK (price >= 0),
  description TEXT,
  image TEXT NOT NULL,
  main_category_id BIGINT NOT NULL REFERENCES main_categories(id) ON DELETE RESTRICT,
  sub_category_id BIGINT NOT NULL REFERENCES sub_categories(id) ON DELETE RESTRICT,
  card_size TEXT NOT NULL DEFAULT 'normal' CHECK (card_size IN ('normal', 'large')),
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_menu_items_main_category ON menu_items(main_category_id);
CREATE INDEX idx_menu_items_sub_category ON menu_items(sub_category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
```

**フィールド説明:**
- `id`: 主キー（自動採番）
- `name`: 商品名（例: "チーズバーガー"）
- `price`: 価格（整数、円）
- `description`: 商品説明
- `image`: 画像または動画のURL
- `main_category_id`: メインカテゴリーID（外部キー）
- `sub_category_id`: サブカテゴリーID（外部キー）
- `card_size`: カードサイズ（'normal' または 'large'、デフォルト: 'normal'）
- `media_type`: メディアタイプ（'image' または 'video'、デフォルト: 'image'）
- `is_available`: 販売可否フラグ（在庫切れ対応用）
- `ON DELETE RESTRICT`: カテゴリー削除時に商品が存在する場合は削除不可

**現在のZustandストアとの対応:**
```typescript
// lib/store/menu.ts
interface MenuItem {
  id: number;          // → menu_items.id
  name: string;        // → menu_items.name
  price: number;       // → menu_items.price
  description: string; // → menu_items.description
  image: string;       // → menu_items.image
  category: string;    // → main_categories.nameを参照（将来的にはmain_category_id）
  subCategory: string; // → sub_categories.nameを参照（将来的にはsub_category_id）
  cardSize?: "normal" | "large"; // → menu_items.card_size
  mediaType?: "image" | "video"; // → menu_items.media_type
}
```

---

### 4. featured_items（特集商品）

```sql
CREATE TABLE featured_items (
  id BIGSERIAL PRIMARY KEY,
  slot_type TEXT NOT NULL UNIQUE CHECK (slot_type IN ('slide1', 'slide2', 'slide3', 'slide4', 'slide5')),
  menu_item_id BIGINT REFERENCES menu_items(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_featured_items_menu_item ON featured_items(menu_item_id);
```

**フィールド説明:**
- `id`: 主キー（自動採番）
- `slot_type`: スロットタイプ（"slide1" ～ "slide5"）
- `menu_item_id`: 特集する商品のID（NULLの場合は未設定）
- `ON DELETE SET NULL`: 商品が削除された場合はNULLに設定

**初期データ挿入:**
```sql
INSERT INTO featured_items (slot_type) VALUES
  ('slide1'),
  ('slide2'),
  ('slide3'),
  ('slide4'),
  ('slide5');
```

**現在のZustandストアとの対応:**
```typescript
// lib/store/featured.ts
interface FeaturedStore {
  featuredItems: Record<FeaturedType, string | null>;
  // → featured_items テーブルの各レコード（slot_typeごと）
}
```

---

### 5. orders（注文）

```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  total_amount INT NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

---

### 6. order_items（注文明細）

```sql
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id BIGINT REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal INT NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

**注記:**
- `item_name`と`item_price`は注文時点の情報をスナップショットとして保存（商品が削除・価格変更されても注文履歴は保持）

---

## Row Level Security (RLS) ポリシー

Supabaseでは、セキュリティのためにRLSを設定することを推奨します。

### main_categories, sub_categories, menu_items

```sql
-- 全員が読み取り可能
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON main_categories FOR SELECT TO anon, authenticated USING (true);

-- 管理者のみ書き込み可能（認証されたユーザーで特定のロール）
CREATE POLICY "Allow admin write access" ON main_categories
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 同様にsub_categories, menu_itemsにも適用
```

---

## 更新トリガー（updated_at自動更新）

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_main_categories_updated_at BEFORE UPDATE ON main_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_categories_updated_at BEFORE UPDATE ON sub_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_items_updated_at BEFORE UPDATE ON featured_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## データ移行戦略

### フェーズ1: 初期データ移行

1. **main_categoriesテーブルに既存カテゴリーを挿入**
```sql
INSERT INTO main_categories (id, name, display_order) VALUES
  (1, 'メイン料理', 1),
  (2, 'サイドメニュー', 2),
  (3, 'ドリンク', 3),
  (4, 'デザート', 4);
```

2. **sub_categoriesテーブルにサブカテゴリーを挿入**
```sql
INSERT INTO sub_categories (id, main_category_id, name, display_order, display_type, color_theme) VALUES
  (101, 1, 'ビーフバーガー', 1, 'text', 'part1'),
  (102, 1, 'チキンバーガー', 2, 'text', 'part1'),
  (103, 1, 'フィッシュバーガー', 3, 'text', 'part1'),
  -- ... 以下続く
```

3. **menu_itemsテーブルに商品を挿入**
   - 現在のZustandストアから商品データを取得
   - `category`（文字列）を`main_category_id`に変換
   - `subCategory`（文字列）を`sub_category_id`に変換

### フェーズ2: フロントエンド修正

1. **Zustandストアの修正**
   - `lib/store/categories.ts`: Supabase APIからデータ取得
   - `lib/store/menu.ts`: Supabase APIからデータ取得
   - `lib/store/featured.ts`: Supabase APIからデータ取得

2. **型定義の修正**
```typescript
// 修正前
interface MenuItem {
  category: string;
  subCategory: string;
}

// 修正後
interface MenuItem {
  main_category_id: number;
  sub_category_id: number;
  // 表示用に結合データを含める場合
  main_category?: { id: number; name: string };
  sub_category?: { id: number; name: string };
}
```

### フェーズ3: APIエンドポイント作成

Next.js API Routesまたは、Supabase Functionsを使用してCRUD操作を実装

---

## Supabase クエリ例

### カテゴリーとサブカテゴリーを取得
```typescript
const { data, error } = await supabase
  .from('main_categories')
  .select(`
    id,
    name,
    sub_categories (
      id,
      name
    )
  `)
  .order('display_order', { ascending: true });
```

### 商品一覧を取得（カテゴリー情報含む）
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select(`
    *,
    main_category:main_categories(id, name),
    sub_category:sub_categories(id, name)
  `)
  .eq('is_available', true);
```

### 特集商品を取得
```typescript
const { data, error } = await supabase
  .from('featured_items')
  .select(`
    slot_type,
    menu_item:menu_items(*)
  `);
```

---

## 注意事項

1. **ID管理**: 現在のZustandストアではクライアント側でIDを生成していますが、Supabaseではサーバー側で自動採番されます。

2. **リレーションシップ**: 現在は`category`と`subCategory`を文字列で保存していますが、Supabaseでは外部キーで管理します。これにより、カテゴリー名変更時に商品データも自動的に反映されます。

3. **画像管理**: 現在は外部URLを使用していますが、将来的にはSupabase Storageを使用することも検討してください。

4. **認証**: 管理画面の認証をSupabase Authに移行することで、より安全な管理が可能になります。

5. **リアルタイム更新**: Supabaseのリアルタイム機能を使用すると、複数の管理者が同時に編集しても自動的に同期されます。

---

## 次のステップ

1. Supabaseプロジェクトの作成
2. 上記SQLを実行してテーブル作成
3. 初期データの投入
4. Next.jsアプリにSupabaseクライアントを統合（`@supabase/supabase-js`）
5. Zustandストアを段階的にSupabase APIに置き換え
6. 認証システムをSupabase Authに移行
