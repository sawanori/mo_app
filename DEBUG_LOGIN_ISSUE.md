# ログイン後リダイレクト問題のデバッグ手順

**日付**: 2025-10-28
**ステータス**: 🔍 デバッグログ追加完了

## 問題の症状

本番環境でログイン成功後、`/admin`にリダイレクトされずに`/admin/login`に戻される。

## 追加したデバッグログ

### 1. ミドルウェア (`lib/supabase/middleware.ts`)

以下のログが出力されます:
- `[Middleware] No user found, redirecting to login` - ユーザーが見つからない場合
- `[Middleware] User found: {user.id} {user.email}` - ユーザーが見つかった場合
- `[Middleware] Profile query result: {profile, error}` - profilesテーブルクエリ結果
- `[Middleware] Error fetching profile:` - profilesクエリエラー
- `[Middleware] User is not admin, redirecting to home` - ユーザーが管理者でない場合
- `[Middleware] User is admin, allowing access` - 管理者アクセス許可

### 2. ログインページ (`app/admin/login/page.tsx`)

以下のログが出力されます:
- `[Login] Starting login process` - ログインプロセス開始
- `[Login] Login result: {true/false}` - ログイン結果
- `[Login] Auth state after login:` - ログイン後の認証状態
- `[Login] Waiting for session to establish...` - セッション確立待機
- `[Login] Redirecting to /admin` - リダイレクト実行

### 3. 管理画面ページ (`app/admin/page.tsx`)

以下のログが出力されます:
- `[AdminPage] Starting auth check` - 認証チェック開始
- `[AdminPage] Initial state:` - 初期状態
- `[AdminPage] No user, initializing...` - 初期化開始
- `[AdminPage] Current state after init:` - 初期化後の状態
- `[AdminPage] User is authenticated admin, showing page` - 管理者として表示
- `[AdminPage] User is authenticated but not admin, redirecting to home` - 一般ユーザー
- `[AdminPage] User is not authenticated, redirecting to login` - 未認証

## デプロイ手順

```bash
git add .
git commit -m "Add debug logging for admin login redirect issue"
git push origin master
```

## デバッグ方法

### 1. 本番環境でログインを試行

1. ブラウザの開発者ツール（F12）を開く
2. Consoleタブを選択
3. 管理者アカウントでログインを試行
4. コンソールに表示されるログを確認

### 2. 確認すべきログパターン

#### パターンA: ミドルウェアでユーザーが見つからない
```
[Login] Starting login process
[Login] Login result: true
[Login] Auth state after login: {isAuthenticated: true, isAdmin: true, user: "admin@example.com"}
[Login] Waiting for session to establish...
[Login] Redirecting to /admin
[Middleware] No user found, redirecting to login  ← 問題箇所
```

**原因**: ログイン後にSupabaseのセッションCookieが正しく設定されていない
**対策**: セッション確立の待機時間を増やす、またはSupabaseクライアントの設定を確認

#### パターンB: profilesテーブルクエリエラー
```
[Login] Starting login process
[Login] Login result: true
[Login] Auth state after login: {isAuthenticated: true, isAdmin: true, user: "admin@example.com"}
[Login] Waiting for session to establish...
[Login] Redirecting to /admin
[Middleware] User found: xxx admin@example.com
[Middleware] Profile query result: {profile: null, error: {...}}  ← 問題箇所
[Middleware] Error fetching profile: {...}
```

**原因**:
- profilesテーブルにユーザーレコードが存在しない
- RLSポリシーでアクセスが拒否されている
- テーブル権限の問題

**対策**:
1. Supabaseダッシュボードでprofilesテーブルを確認
2. ユーザーのプロファイルレコードが存在するか確認
3. RLSポリシーを確認

#### パターンC: ユーザーが管理者でない
```
[Middleware] User found: xxx admin@example.com
[Middleware] Profile query result: {profile: {role: "user"}, error: null}
[Middleware] User is not admin, redirecting to home  ← 問題箇所
```

**原因**: profilesテーブルの`role`カラムが`admin`に設定されていない

**対策**: SQL実行でロールを更新
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@example.com';
```

#### パターンD: 管理画面ページでの認証失敗
```
[Middleware] User is admin, allowing access
[AdminPage] Starting auth check
[AdminPage] Initial state: {user: null, isAdmin: false}
[AdminPage] No user, initializing...
[AdminPage] Current state after init: {isAuthenticated: false, isAdmin: false, user: undefined}
[AdminPage] User is not authenticated, redirecting to login  ← 問題箇所
```

**原因**: クライアント側で認証状態の取得に失敗

**対策**:
- ブラウザのCookieを確認（Supabaseセッション）
- Application → Cookies → サイトのドメインで`sb-*`Cookieが存在するか確認

## Supabaseセッションの確認方法

### ブラウザの開発者ツールで確認

1. F12でDevToolsを開く
2. Applicationタブ → Cookies → サイトのドメイン
3. 以下のCookieが存在するか確認:
   - `sb-{project-ref}-auth-token`
   - `sb-{project-ref}-auth-token-code-verifier`

### JavaScriptコンソールで確認

```javascript
// セッション情報を取得
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
```

## よくある問題と解決策

### 問題1: profilesレコードが存在しない

**確認方法**:
```sql
SELECT * FROM profiles WHERE email = 'your-admin@example.com';
```

**解決策**: [管理者ユーザー作成ガイド](./ADMIN_USER_CREATION_GUIDE.md)を参照してプロファイルを作成

### 問題2: RLSポリシーでアクセスが拒否

**確認方法**:
Supabaseダッシュボード → Authentication → Policies → profiles

**必要なポリシー**:
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### 問題3: Cookieが設定されない（Same-Site問題）

**原因**: VercelとSupabaseのドメインが異なる場合のCookie設定

**解決策**: Supabaseプロジェクト設定で`Site URL`と`Redirect URLs`を確認
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

### 問題4: セッションタイムアウト

**確認方法**:
```sql
-- Supabaseダッシュボードで確認
-- Settings → Auth → JWT expiry
```

**デフォルト**: 3600秒（1時間）

## 次のステップ

1. 本番環境でログインを試行
2. コンソールログを確認
3. 問題のパターンを特定
4. 対応する解決策を実施
5. 結果を報告

## ログの共有方法

問題が解決しない場合は、以下のログを共有してください:

1. ブラウザのコンソールログ（全ての`[Login]`, `[Middleware]`, `[AdminPage]`ログ）
2. Networkタブで`/admin`へのリクエスト/レスポンス
3. Cookieの状態（`sb-*`Cookieの有無）
4. Supabaseダッシュボードの認証ログ（Authentication → Logs）

## 関連ドキュメント

- [管理者ユーザー作成ガイド](./ADMIN_USER_CREATION_GUIDE.md)
- [本番環境ログイン修正](./PRODUCTION_LOGIN_REDIRECT_FIX.md)
- [Supabaseスキーマ定義](./SUPABASE_SCHEMA.md)
