# CSVインポート機能 ユーザーガイド

## 📋 概要

管理画面からCSVファイルをアップロードすることで、メニューアイテムを一括で登録・更新できます。

## 🚀 使い方

### 1. 管理画面にアクセス

1. `/admin/login` からログイン
2. ナビゲーションバーの「メニューインポート」をクリック
3. または直接 `/admin/import` にアクセス

### 2. CSVファイルを準備

#### 必須カラム
- `main_category`: メインカテゴリー名（例: メイン料理, サイド, ドリンク）
- `sub_category`: サブカテゴリー名（例: 肉料理, 魚料理, サラダ）
- `item_name`: メニューアイテム名
- `description`: 商品説明
- `price`: 価格（整数、0以上）
- `image`: 画像URL（https://images.unsplash.com/... など）
- `sort_order`: 表示順序（整数）

#### オプションカラム
- `is_available`: 提供可能フラグ（1/0/true/false、デフォルト: 1）
- `allergens`: アレルゲン情報（カンマ区切り、例: "卵,乳"）
- `dietary_tags`: タグ情報（カンマ区切り、例: "人気,おすすめ"）
- `card_size`: カードサイズ（`normal` または `large`）
- `media_type`: メディアタイプ（`image` または `video`）

### 3. CSVフォーマット例

```csv
main_category,sub_category,item_name,description,price,image,sort_order,is_available,allergens,dietary_tags,card_size,media_type
メイン料理,肉料理,ハンバーグステーキ,ジューシーな牛肉100%のハンバーグ,1200,https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf,1,1,"卵,乳","人気,おすすめ",normal,image
メイン料理,肉料理,グリルチキン,特製ソースのグリルチキン,980,https://images.unsplash.com/photo-1598103442097-8b74394b95c6,2,1,,"ヘルシー,人気",normal,image
```

サンプルファイル: `sample_menu_import.csv`

### 4. ファイルをアップロード

1. ドラッグ＆ドロップエリアにCSVファイルをドロップ、またはクリックして選択
2. ファイル名とサイズを確認
3. 「インポート開始」ボタンをクリック

### 5. 結果を確認

インポート完了後、以下の情報が表示されます:
- **新規作成**: 新しく追加されたアイテム数
- **更新**: 既存アイテムの更新数
- **スキップ**: エラーでスキップされた行数
- **エラー詳細**: 各エラーの行番号とメッセージ

## 🔧 技術仕様

### インポートロジック

1. **カテゴリー解決**
   - メインカテゴリーが存在しない場合、自動作成（次のsort_orderを割り当て）
   - サブカテゴリーが存在しない場合、自動作成（main_category内で次のsort_orderを割り当て）

2. **アイテムのUpsert**
   - `(sub_category_id, item_name)` の組み合わせで既存アイテムを検索
   - 存在する場合: 更新（UPDATE）
   - 存在しない場合: 新規作成（INSERT）

3. **データ変換**
   - `is_available`: 1/0/true/false → boolean
   - `allergens`: カンマ区切り文字列 → JSONB配列
   - `dietary_tags`: カンマ区切り文字列 → JSONB配列
   - `card_size`: 小文字に正規化（normal/large）
   - `media_type`: 小文字に正規化（image/video）

### 制限事項

- **ファイルサイズ**: 最大5MB
- **行数**: 最大5,000行
- **認証**: 管理者権限が必要（role: admin）
- **画像ホスト**: `next.config.js`で許可されたホストのみ（現在: images.unsplash.com）

### バリデーションルール

1. **必須フィールドチェック**
   - 空白または未入力の必須カラムがある行はスキップ

2. **数値検証**
   - `price`: 0以上の整数
   - `sort_order`: 整数

3. **列挙型検証**
   - `card_size`: "normal" または "large" のみ
   - `media_type`: "image" または "video" のみ

4. **その他**
   - 全フィールドはトリム処理される
   - 空のallergens/dietary_tagsは空配列として保存される

## 🐛 トラブルシューティング

### エラー: "Missing required field"
- **原因**: 必須カラムが空または未入力
- **解決**: CSVファイルの該当行を確認し、全ての必須カラムに値を入力

### エラー: "Invalid price"
- **原因**: 価格が数値でない、または負の値
- **解決**: 価格を0以上の整数に修正

### エラー: "Invalid card_size"
- **原因**: card_sizeが "normal" または "large" でない
- **解決**: card_sizeを "normal" または "large" に修正、または空にする

### エラー: "Unauthorized" または "Forbidden"
- **原因**: ログインしていない、または管理者権限がない
- **解決**: 管理者アカウントでログインし直す

### エラー: "File too large"
- **原因**: ファイルサイズが5MBを超えている
- **解決**: ファイルを分割するか、不要な行を削除

### エラー: "Too many rows"
- **原因**: CSVの行数が5,000を超えている
- **解決**: CSVファイルを複数に分割してインポート

## 📊 API エンドポイント

### POST /api/import/csv

**リクエスト:**
```
Content-Type: multipart/form-data
Body: { file: <CSV File> }
```

**レスポンス:**
```json
{
  "created": 10,
  "updated": 5,
  "skipped": 2,
  "errors": [
    {
      "row": 15,
      "message": "Row 15: Missing required field \"price\""
    }
  ]
}
```

**ステータスコード:**
- `200`: 成功
- `400`: リクエストエラー（無効なCSV、バリデーションエラー）
- `401`: 未認証
- `403`: 権限不足（非管理者）
- `500`: サーバーエラー

## 🔐 セキュリティ

- 管理者権限（role: admin）のユーザーのみアクセス可能
- Supabase認証による認証チェック
- ファイルサイズと行数の制限
- SQLインジェクション対策（Supabaseクライアント使用）
- XSS対策（全フィールドのトリム処理）

## 📝 更新履歴

### 2025-10-31
- 初回リリース
- 基本的なCSVインポート機能実装
- カテゴリー自動作成機能
- Upsertロジック実装
- バリデーション実装
- エラーハンドリング実装

---

**作成日**: 2025年10月31日
**最終更新**: 2025年10月31日
