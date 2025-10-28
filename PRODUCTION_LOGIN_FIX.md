# 本番環境ログイン問題の解決方法

## 🌐 本番環境URL
https://mo-app-two.vercel.app/admin/login

## ✅ ステップ1: Vercelの環境変数を確認

1. **Vercelダッシュボードにアクセス:**
   - https://vercel.com/dashboard
   - プロジェクト "mo-app-two" を選択

2. **Settings → Environment Variables**

3. **以下の4つの変数が設定されているか確認:**

   | 変数名 | 値 | 環境 |
   |--------|-----|------|
   | NEXT_PUBLIC_SUPABASE_URL | `https://hgyeytncuwdpuabxkren.supabase.co` | Production, Preview, Development |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | [.envの値] | Production, Preview, Development |
   | NEXT_PUBLIC_ADMIN_EMAIL | `snp.inc.info@gmail.com` | Production, Preview, Development |
   | NEXT_PUBLIC_ADMIN_PASSWORD | `admin123!` | Production, Preview, Development |

4. **設定されていない、または値が違う場合:**
   - "Add New" をクリック
   - 上記の値を入力
   - 全ての環境 (Production, Preview, Development) にチェック
   - "Save"

5. **Redeployを実行:**
   - Deployments → 最新のデプロイ → "..." → "Redeploy"

---

## ✅ ステップ2: Supabaseでパスワードを確認/リセット

もし環境変数が正しく設定されているのにログインできない場合、
Supabaseのパスワードが `admin123!` と一致していない可能性があります。

### パスワードをリセットする方法:

1. **Supabaseダッシュボードを開く:**
   https://supabase.com/dashboard/project/hgyeytncuwdpuabxkren/auth/users

2. **ユーザーを見つける:**
   - `snp.inc.info@gmail.com` をクリック

3. **パスワードをリセット:**
   - "..." (3点メニュー) → "Reset Password"
   - または SQL Editorで直接更新

4. **SQL Editorでパスワードを更新:**
   ```sql
   -- snp.inc.info@gmail.com のパスワードを admin123! に設定
   -- 注意: この方法はパスワードをハッシュ化して保存します
   
   -- まず、Supabaseダッシュボードの Authentication → Users で
   -- ユーザーを選択し、"Reset Password" を使用することを推奨します
   ```

5. **新しいパスワードを設定:**
   - 推奨: `Admin1234!` (より強力)
   - または既存の `admin123!` を再設定

6. **Vercelの環境変数を更新:**
   - NEXT_PUBLIC_ADMIN_PASSWORD = [新しいパスワード]
   - Redeploy

7. **ローカルの.envも更新:**
   ```bash
   NEXT_PUBLIC_ADMIN_PASSWORD="[新しいパスワード]"
   ```

---

## ✅ ステップ3: デバッグ方法

ログインできない場合、エラーメッセージを確認:

1. **本番環境でログインを試行:**
   - https://mo-app-two.vercel.app/admin/login

2. **ブラウザの開発者ツールを開く:**
   - F12 キーを押す
   - "Console" タブを選択

3. **ログインを実行してエラーを確認:**
   - Email: snp.inc.info@gmail.com
   - Password: admin123!
   - "ログイン" をクリック

4. **エラーメッセージを確認:**
   - `Invalid login credentials` → パスワードが違う
   - `Email not confirmed` → メール確認が必要
   - `User not found` → メールアドレスが違う
   - Supabase接続エラー → 環境変数が設定されていない

---

## 🔄 代替案: 新しい管理者アカウントを作成

既存のアカウントで問題が解決しない場合:

1. **Supabaseで新規ユーザーを作成:**
   https://supabase.com/dashboard/project/hgyeytncuwdpuabxkren/auth/users

2. **"Add user" → "Create a new user":**
   - Email: `admin@example.com`
   - Password: `Admin1234!`
   - ☑ Auto Confirm User

3. **SQL Editorで管理者ロール設定:**
   https://supabase.com/dashboard/project/hgyeytncuwdpuabxkren/sql/new

   ```sql
   INSERT INTO profiles (id, email, role)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
     'admin@example.com',
     'admin'
   )
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```

4. **Vercelの環境変数を更新:**
   - NEXT_PUBLIC_ADMIN_EMAIL = `admin@example.com`
   - NEXT_PUBLIC_ADMIN_PASSWORD = `Admin1234!`
   - Redeploy

5. **新しいアカウントでログイン:**
   - https://mo-app-two.vercel.app/admin/login
   - Email: admin@example.com
   - Password: Admin1234!

---

## 📋 チェックリスト

完了したらチェックしてください:

- [ ] Vercelの環境変数を確認した
- [ ] NEXT_PUBLIC_SUPABASE_URL が正しい
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されている
- [ ] NEXT_PUBLIC_ADMIN_EMAIL が正しい
- [ ] NEXT_PUBLIC_ADMIN_PASSWORD が正しい
- [ ] Redeployを実行した
- [ ] Supabaseでユーザーが存在することを確認した
- [ ] パスワードをリセット/再設定した (必要に応じて)
- [ ] ログインテストを実行した

---

## 🆘 それでも解決しない場合

以下の情報を確認してください:

1. **ブラウザのコンソールエラー:**
   - F12 → Console タブのエラーメッセージ

2. **ネットワークタブ:**
   - F12 → Network タブ
   - ログイン時のリクエストを確認
   - Supabaseへのリクエストが成功しているか

3. **Vercelのログ:**
   - Vercel Dashboard → プロジェクト → "..." → "View Function Logs"
   - エラーがあれば確認

---

**作成日**: 2025-10-28  
**プロジェクト**: mo-app-two (Vercel)  
**データベース**: Supabase (hgyeytncuwdpuabxkren)
