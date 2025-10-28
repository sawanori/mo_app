# スマートフォン画面の全幅表示対応

**日付**: 2025-10-28
**ステータス**: ✅ 修正完了・ビルド成功

## 問題の症状

スマートフォン画面で表示した際に、左右に余白が存在し、コンテンツが画面いっぱいに表示されない。

## 原因

複数の箇所で幅制限やパディングが設定されていた：

1. **`app/layout.tsx`**
   - `body`に`flex items-center justify-center`で中央寄せ
   - コンテンツを`max-w-md portrait:max-w-sm landscape:max-w-4xl`で制限

2. **各ページ**
   - `container mx-auto`クラスでコンテナ化
   - `max-w-md`, `max-w-4xl`などで最大幅を制限
   - `px-4`などで左右にパディングを追加

3. **ナビゲーション**
   - 内部のdivで`max-w-md`や`px-4`を使用

## 修正内容

### 1. レイアウトの修正 (`app/layout.tsx`)

**Before:**
```tsx
<body className={`${inter.className} bg-background flex items-center justify-center min-h-screen`}>
  <div className="w-full max-w-md portrait:max-w-sm landscape:max-w-4xl min-h-screen landscape:min-h-auto">
    {children}
  </div>
</body>
```

**After:**
```tsx
<body className={`${inter.className} bg-background min-h-screen`}>
  <div className="w-full min-h-screen">
    {children}
  </div>
</body>
```

**変更点:**
- `flex items-center justify-center`を削除（中央寄せ不要）
- `max-w-*`の幅制限をすべて削除
- `w-full`で画面幅いっぱいに表示

### 2. ホームページの修正 (`app/page.tsx`)

**Before:**
```tsx
<div className="flex flex-col px-3 py-4 space-y-3">
  <h2 className="text-lg font-bold text-left">当店のおすすめ</h2>
  ...
</div>
```

**After:**
```tsx
<div className="flex flex-col py-4 space-y-3">
  <h2 className="text-lg font-bold text-left px-3">当店のおすすめ</h2>
  ...
</div>
```

**変更点:**
- コンテナの`px-3`を削除
- 見出しのみ`px-3`を適用（テキストだけ少し余白を持たせる）
- ヒーローセクションとメニューは画面端まで表示

### 3. ナビゲーションの修正 (`components/navigation.tsx`)

**Before:**
```tsx
<nav className="sticky top-0 z-50 transition-transform duration-300 flex justify-center">
  <div className="w-full max-w-md portrait:max-w-sm landscape:max-w-4xl px-4">
    ...
  </div>
</nav>
```

**After:**
```tsx
<nav className="sticky top-0 z-50 transition-transform duration-300 w-full">
  <div className="flex flex-col items-center py-2 border-b">
    ...
  </div>
</nav>
```

**変更点:**
- `flex justify-center`を削除
- 内部divの幅制限（`max-w-*`）とパディング（`px-4`）を削除
- `w-full`で画面幅いっぱいに表示

### 4. カートページの修正 (`app/cart/page.tsx`)

**Before:**
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="max-w-4xl mx-auto">
```

**After:**
```tsx
<div className="w-full px-3 py-8">
  <div className="w-full">
```

**変更点:**
- `container mx-auto`を`w-full`に変更
- `px-4`を`px-3`に変更（最小限のパディング）
- `max-w-4xl mx-auto`を`w-full`に変更

### 5. 会計ページの修正 (`app/payment/page.tsx`)

**Before:**
```tsx
<div className="container max-w-md mx-auto px-4 py-6 space-y-4">
```

**After:**
```tsx
<div className="w-full px-3 py-6 space-y-4">
```

**変更点:**
- `container max-w-md mx-auto`を`w-full`に変更
- `px-4`を`px-3`に変更

### 6. 注文履歴ページの修正 (`app/order-history/page.tsx`)

**Before:**
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="max-w-4xl mx-auto">
```

**After:**
```tsx
<div className="w-full px-3 py-8">
  <div className="w-full">
```

### 7. アカウントページの修正 (`app/account/page.tsx`)

**Before:**
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="max-w-4xl mx-auto space-y-8">
```

**After:**
```tsx
<div className="w-full px-3 py-8">
  <div className="w-full space-y-8">
```

## 修正の方針

### 基本ルール

1. **画面幅いっぱいに表示**
   - すべてのコンテナを`w-full`に変更
   - `max-w-*`の幅制限を削除
   - `container`, `mx-auto`による中央寄せを削除

2. **最小限のパディング**
   - 左右のパディングは`px-3`（12px）に統一
   - テキストコンテンツのみパディングを適用
   - 画像やカードは画面端まで表示

3. **スマートフォン最適化**
   - デスクトップ用のレスポンシブクラス（`sm:`, `md:`, `lg:`）は維持
   - スマートフォンでは常に全幅表示

## ビルド結果

```
✓ Generating static pages (11/11)
Route (app)                              Size     First Load JS
┌ ○ /                                    17.2 kB         225 kB
├ ○ /account                             2.43 kB        90.3 kB
├ ○ /cart                                5.2 kB          161 kB
├ ○ /order-history                       4.8 kB          155 kB
└ ○ /payment                             4.71 kB         155 kB

✅ ビルド成功
```

## 視覚的な変更

### Before（修正前）
```
┌─────────────────────────┐
│  余白                   │
│   ┌───────────────┐     │
│   │  Navigation   │     │
│   │  Content      │     │
│   │  Menu         │     │
│   └───────────────┘     │
│                    余白 │
└─────────────────────────┘
```

### After（修正後）
```
┌─────────────────────────┐
│  Navigation             │
│  Content (full width)   │
│  Menu (full width)      │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

## 影響範囲

### 修正したファイル

- ✅ `app/layout.tsx` - ルートレイアウト
- ✅ `app/page.tsx` - ホームページ
- ✅ `components/navigation.tsx` - ナビゲーション
- ✅ `app/cart/page.tsx` - カートページ
- ✅ `app/payment/page.tsx` - 会計ページ
- ✅ `app/order-history/page.tsx` - 注文履歴ページ
- ✅ `app/account/page.tsx` - アカウントページ

### 未修正のファイル

- 管理画面（`app/admin/*`）- デスクトップ用のため未修正

## テスト項目

デプロイ後、以下を確認してください：

### スマートフォン（縦向き）
- [ ] ホームページ: コンテンツが画面幅いっぱいに表示される
- [ ] ナビゲーション: 画面幅いっぱいに表示される
- [ ] ヒーローセクション: 画像が画面端まで表示される
- [ ] メニューアイテム: カードが画面幅いっぱいに表示される
- [ ] カートページ: コンテンツが画面幅いっぱいに表示される
- [ ] 会計ページ: 支払い情報が画面幅いっぱいに表示される
- [ ] 注文履歴: 注文カードが画面幅いっぱいに表示される

### スマートフォン（横向き）
- [ ] すべてのページで横向きでも全幅表示される
- [ ] スクロールが正常に動作する

### レイアウトの整合性
- [ ] 左右に余白がない
- [ ] テキストは少し内側に配置される（`px-3`）
- [ ] 画像やカードは画面端まで表示される
- [ ] スクロール時のナビゲーション表示/非表示が正常に動作する

## デプロイ手順

```bash
git add .
git commit -m "Fix: スマートフォン画面で全幅表示に対応"
git push origin master
```

## 関連ドキュメント

- [CLAUDE.md](./CLAUDE.md) - プロジェクトのモバイルファースト設計について
- [デバッグログ追加](./DEBUG_LOGIN_ISSUE.md) - 同時に実施したログイン問題のデバッグ

## 注意事項

- この修正はスマートフォン専用UIに最適化されています
- デスクトップでの表示は想定していません
- 管理画面は引き続きデスクトップ用の幅制限を維持しています
