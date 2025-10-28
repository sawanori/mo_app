# 本番環境ログイン問題 - 即座に解決する方法

## 🎯 最速の解決策

パスワードを新しく設定し直して、確実に同期させます。

---

## ステップ1: Supabaseでパスワードを再設定 (3分)

### 1-1. Supabaseダッシュボードを開く
```
https://supabase.com/dashboard/project/hgyeytncuwdpuabxkren/auth/users
```

### 1-2. ユーザーを更新
1. `snp.inc.info@gmail.com` のユーザーをクリック
2. 右上の "..." メニュー → **"Update user"**
3. **Password** フィールドに入力:
   ```
   Admin2025!
   ```
4. **"Update user"** をクリック

✅ これでSupabaseのパスワードが `Admin2025!` に確定しました

---

## ステップ2: Vercelの環境変数を更新 (2分)

### 2-1. Vercelダッシュボードを開く
```
https://vercel.com/dashboard
```

### 2-2. プロジェクトを選択
- **mo-app-two** を選択
- **Settings** タブ
- **Environment Variables** セクション

### 2-3. パスワードを更新

**NEXT_PUBLIC_ADMIN_PASSWORD** を見つけて:
1. 右側の **"Edit"** ボタンをクリック
2. **Value** を変更:
   ```
   Admin2025!
   ```
3. **Environments** を確認:
   - ☑ Production
   - ☑ Preview  
   - ☑ Development
4. **"Save"** をクリック

✅ Vercelの環境変数が更新されました

---

## ステップ3: Redeploy (3分)

### 3-1. Deploymentsページに移動
1. Vercel → **mo-app-two** → **Deployments** タブ

### 3-2. 最新のデプロイを再デプロイ
1. 最新のデプロイ(一番上)の **"..."** メニュー
2. **"Redeploy"** をクリック
3. ダイアログで **"Redeploy"** を再度クリック

### 3-3. デプロイ完了を待つ
- 通常2-3分で完了
- "Ready" になるまで待つ

✅ 新しい環境変数でデプロイされました

---

## ステップ4: ログインテスト (1分)

### 4-1. 本番環境にアクセス
```
https://mo-app-two.vercel.app/admin/login
```

### 4-2. ログイン情報を入力
```
Email: snp.inc.info@gmail.com
Password: Admin2025!
```

### 4-3. ログインボタンをクリック

✅ ログイン成功！

---

## ローカル環境も更新 (任意)

ローカルでも同じパスワードを使いたい場合:

```bash
# .envファイルを編集
NEXT_PUBLIC_ADMIN_PASSWORD="Admin2025!"
```

---

## ❌ それでもログインできない場合

### A. ブラウザのキャッシュをクリア
1. Ctrl+Shift+Delete (Windows) または Cmd+Shift+Delete (Mac)
2. "Cached images and files" を選択
3. "Clear data"

### B. シークレットウィンドウで試す
1. Ctrl+Shift+N (Chrome) または Cmd+Shift+N (Mac)
2. https://mo-app-two.vercel.app/admin/login
3. ログインを試す

### C. エラーメッセージを確認
1. F12 キーを押す
2. **Console** タブを確認
3. エラーメッセージをコピー
4. 教えてください

---

## 📊 確認事項チェックリスト

以下を全て確認してください:

- [ ] Supabaseでパスワードを `Admin2025!` に更新した
- [ ] Vercelの環境変数 `NEXT_PUBLIC_ADMIN_PASSWORD` を `Admin2025!` に変更した
- [ ] Vercelで **Redeploy** を実行した
- [ ] デプロイが **"Ready"** になった (2-3分待った)
- [ ] ブラウザのキャッシュをクリアした
- [ ] 本番環境で Email: `snp.inc.info@gmail.com`, Password: `Admin2025!` でログインした

---

## ⚡ トラブルシューティング

### Q1: "Invalid login credentials" エラー
→ パスワードが一致していません
→ Supabaseで再度パスワードを確認し、Vercelも再確認

### Q2: "User not found" エラー  
→ メールアドレスが間違っています
→ Vercelの `NEXT_PUBLIC_ADMIN_EMAIL` を確認

### Q3: Supabase接続エラー
→ Vercelの環境変数を確認:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**実施日**: ________  
**結果**: ☐ 成功 / ☐ 失敗  
**エラー**: _______________
