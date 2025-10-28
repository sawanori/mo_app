# Vercel環境変数設定ガイド

## 📋 設定が必要な環境変数（4個）

Vercelプロジェクト → Settings → Environment Variables で以下を設定してください。

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://hgyeytncuwdpuabxkren.supabase.co
```
- 環境: ☑ Production ☑ Preview ☑ Development

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
[ローカルの.envファイルからコピーしてください]
```
- 環境: ☑ Production ☑ Preview ☑ Development
- 値は`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`で始まる長い文字列です

### 3. NEXT_PUBLIC_ADMIN_EMAIL
```
[ローカルの.envファイルからコピーしてください]
```
- 環境: ☑ Production ☑ Preview ☑ Development

### 4. NEXT_PUBLIC_ADMIN_PASSWORD
```
[ローカルの.envファイルからコピーしてください]
```
- 環境: ☑ Production ☑ Preview ☑ Development
- ⚠️ **本番環境では必ず強力なパスワードに変更してください**

---

## 🔧 設定手順

1. **Vercelダッシュボード**にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 各環境変数を追加:
   - **Key**: 環境変数名（例: `NEXT_PUBLIC_SUPABASE_URL`）
   - **Value**: 上記の値
   - **Environments**: Production, Preview, Development 全てチェック
5. **Save**ボタンをクリック
6. 全て追加したら**Redeploy**（再デプロイ）

---

## ⚠️ 重要な注意事項

### セキュリティ
- `NEXT_PUBLIC_*` で始まる変数はブラウザで公開されます
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`は公開されても安全（RLSで保護）
- 本番環境のパスワードは開発環境と別のものを使用してください

### 本番環境推奨設定
本番環境では以下を推奨:
```
NEXT_PUBLIC_ADMIN_PASSWORD: [12文字以上の強力なパスワード]
```

例: `MyS3cur3P@ssw0rd!2025`

---

## ✅ 確認方法

環境変数設定後、デプロイされたサイトで:

1. `/admin/login`にアクセス
2. 設定したメールアドレスとパスワードでログイン
3. ログインできれば設定成功 ✅

---

## 🚫 設定不要な変数

以下は設定しないでください:
- ❌ `DATABASE_URL` - 使用していません
- ❌ `SUPABASE_ACCESS_TOKEN` - 通常は不要

---

**作成日**: 2025-10-28  
**プロジェクト**: mobile_order  
**データベース**: Supabase (mo_app)
