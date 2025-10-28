# 管理者ユーザー作成ガイド

## ⚠️ 重要な注意

`admin@gmail.com` のような一般的なメールアドレスは、Supabaseでセキュリティ上の理由によりブロックされています。

以下のドメインは使用できません:
- @gmail.com
- @yahoo.com
- @hotmail.com
- @outlook.com
- その他の一般的なフリーメールサービス

## 📝 Supabaseダッシュボードから管理者を作成する手順

### ステップ1: Supabaseダッシュボードにアクセス

1. 以下のURLを開く:
   ```
   https://supabase.com/dashboard/project/hgyeytncuwdpuabxkren/auth/users
   ```

### ステップ2: 新規ユーザーを追加

2. **"Add user"** ボタンをクリック

3. **"Create a new user"** を選択

4. ユーザー情報を入力:
   - **Email**: `admin@example.com` 
     - または実際に所有しているメールアドレス
     - または `admin@yourcompany.com` のようなカスタムドメイン
   - **Password**: `admin1234`
   - **☑ Auto Confirm User**: 必ずチェックを入れる

5. **"Create user"** をクリック

### ステップ3: 管理者ロールを設定

6. SQL Editorを開く:
   ```
   https://supabase.com/dashboard/project/hgyeytncuwdpuabxkren/sql/new
   ```

7. 以下のSQLを実行:

   ```sql
   -- 作成したユーザーのメールアドレスに置き換えてください
   INSERT INTO profiles (id, email, role)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
     'admin@example.com',
     'admin'
   )
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```

   **重要**: `'admin@example.com'` を実際に作成したメールアドレスに置き換えてください

8. **"Run"** をクリック

### ステップ4: 動作確認

9. ローカルまたはVercelでデプロイされたサイトの `/admin/login` にアクセス

10. 作成した認証情報でログイン:
    - Email: `admin@example.com` (作成したアドレス)
    - Password: `admin1234`

11. ログインできれば成功 ✅

---

## 🔄 代替方法: SQL Editorで直接作成

以下のSQLを一度に実行することも可能です:

```sql
-- 1. ユーザーを作成（この方法はauth.usersテーブルに直接挿入）
-- 注意: この方法は推奨されません。ダッシュボードから作成してください

-- 2. プロファイルを作成
INSERT INTO profiles (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin@example.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. ユーザーを確認済みにする
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'admin@example.com';
```

---

## ✅ 既存の管理者アカウント

既に以下の管理者アカウントが作成されています:

- **Email**: `.env`ファイルの `NEXT_PUBLIC_ADMIN_EMAIL` を確認
- **Password**: `.env`ファイルの `NEXT_PUBLIC_ADMIN_PASSWORD` を確認

このアカウントでログイン可能です。

---

## 💡 推奨事項

### 本番環境では

1. **実在するメールアドレスを使用**
   - パスワードリセット機能が使用可能
   - セキュリティ通知を受信可能
   - 例: `admin@yourcompany.com`

2. **強力なパスワードを使用**
   - 最低12文字以上
   - 大文字、小文字、数字、記号を含む
   - 例: `MyS3cur3P@ssw0rd!2025`

3. **複数の管理者を作成**
   - メイン管理者
   - バックアップ管理者
   - 各スタッフ用アカウント

### セキュリティ

- ❌ `admin@gmail.com` - ブロックされます
- ❌ `test@test.com` - ブロックされる可能性あり
- ✅ `admin@yourcompany.com` - 推奨
- ✅ `support@yourcompany.com` - 推奨
- ✅ 実際に所有しているメールアドレス - 推奨

---

**作成日**: 2025-10-28  
**プロジェクト**: mobile_order  
**データベース**: Supabase (mo_app)
