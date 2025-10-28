# 本番環境ログイン後リダイレクト問題の修正

**日付**: 2025-10-28
**ステータス**: ✅ 修正完了・ビルド成功

## 問題の症状

本番環境でログイン成功後、管理画面(`/admin`)にリダイレクトされずにログインページに留まるか、ログインページに戻される。

## 根本原因の分析

### 1. セッション確立のタイミング問題
- ログイン成功直後にSupabaseのセッションCookieが完全に確立される前に`router.push("/admin")`が実行されていた
- ミドルウェアが`/admin`へのアクセスをチェックする時点でまだセッションが有効でないと判断
- 結果として`/admin/login`へリダイレクトされていた

### 2. 認証チェックの不整合
- `app/admin/page.tsx`が`localStorage`の`auth-storage`だけをチェック
- Supabaseの実際の認証状態（サーバーサイドのセッション）と同期していない
- クライアント側では認証済みでも、サーバー側（ミドルウェア）では未認証と判断される

### 3. ミドルウェアの不完全な認証チェック
- `lib/supabase/middleware.ts`がログイン状態のみをチェック
- 管理者ロール（`profiles.role = 'admin'`）の確認が不足
- 一般ユーザーでも`/admin`にアクセスできてしまう可能性

## 実装された修正

### 修正1: ログイン後のセッション確立待機

**ファイル**: `app/admin/login/page.tsx:21-42`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const success = await login(email, password);

  if (success) {
    toast({
      title: "ログイン成功",
      description: "管理画面にリダイレクトします",
    });
    // Wait a bit for Supabase session to be fully established
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push("/admin");
    router.refresh(); // Force a refresh to update middleware
  } else {
    toast({
      title: "ログイン失敗",
      description: "メールアドレスまたはパスワードが間違っています",
      variant: "destructive",
    });
  }
};
```

**変更点**:
- 500msの待機時間を追加してSupabaseセッションの完全な確立を待つ
- `router.refresh()`でミドルウェアの再実行を強制

### 修正2: 管理画面の認証チェック強化

**ファイル**: `app/admin/page.tsx:31,71-95`

```typescript
// インポート追加
import { useAuthStore } from "@/lib/store/auth";

// 認証チェックロジック改善
useEffect(() => {
  const checkAuth = async () => {
    // First check if user is logged in with Supabase
    const { user, isAdmin, initialize } = useAuthStore.getState();

    // Initialize auth state if not already done
    if (!user) {
      await initialize();
    }

    const currentState = useAuthStore.getState();

    if (currentState.isAuthenticated && currentState.isAdmin) {
      setIsAuthenticated(true);
    } else if (currentState.isAuthenticated && !currentState.isAdmin) {
      // Logged in but not admin
      router.push("/");
    } else {
      // Not logged in
      router.push("/admin/login");
    }
  };

  checkAuth();
}, [router]);
```

**変更点**:
- `localStorage`チェックから`useAuthStore`の状態チェックに変更
- `initialize()`を呼び出してSupabaseの認証状態と同期
- 管理者ロールの確認を追加
- ログイン済みだが管理者でない場合はホームページへリダイレクト

### 修正3: ミドルウェアでの管理者ロールチェック追加

**ファイル**: `lib/supabase/middleware.ts:38-70`

```typescript
// Protected routes check for admin
if (
  request.nextUrl.pathname.startsWith('/admin') &&
  !request.nextUrl.pathname.startsWith('/admin/login')
) {
  if (!user) {
    // No user, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Check if user is admin
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      // User is logged in but not admin, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    // Error checking role, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
}
```

**変更点**:
- ログイン状態チェックに加えて`profiles.role`をチェック
- `role !== 'admin'`の場合はホームページへリダイレクト
- エラー発生時はログインページへリダイレクト（安全側に倒す）

## セキュリティの向上

この修正により、以下のセキュリティ強化が実現されました:

1. **多層防御**: クライアント側（管理画面コンポーネント）とサーバー側（ミドルウェア）の両方で認証・認可チェック
2. **ロールベースアクセス制御**: 管理者ロールを持つユーザーのみが`/admin/*`にアクセス可能
3. **セッション整合性**: Supabaseのセッション状態とクライアント状態の同期を保証

## 認証フロー図

```
ログインリクエスト
    ↓
Supabase認証
    ↓
[成功] → 500ms待機 → router.push("/admin") → router.refresh()
    ↓
Middleware実行
    ↓
user存在チェック [なし] → /admin/login
    ↓ [あり]
profiles.roleチェック
    ↓
[admin] → /admin表示
[admin以外] → / (ホーム)
[エラー] → /admin/login
    ↓
管理画面コンポーネント
    ↓
useAuthStore.initialize()
    ↓
isAuthenticated && isAdmin [true] → 表示
isAuthenticated && !isAdmin [true] → /
!isAuthenticated → /admin/login
```

## テスト項目

本番環境デプロイ後、以下をテストしてください:

### 正常系
- [ ] 管理者ユーザーでログイン → `/admin`に正しくリダイレクト
- [ ] 管理画面でページをリロード → ログイン状態が保持される
- [ ] ログアウト → ログインページへリダイレクト

### 異常系
- [ ] 一般ユーザーでログイン → ホームページへリダイレクト
- [ ] 未ログインで`/admin`にアクセス → `/admin/login`へリダイレクト
- [ ] 存在しないユーザーでログイン → エラーメッセージ表示

### セキュリティ
- [ ] ブラウザのDevToolsでCookieを削除 → `/admin`アクセス時にログインページへリダイレクト
- [ ] `profiles.role`を一般ユーザーに変更 → `/admin`アクセス時にホームへリダイレクト

## ビルド結果

```
✓ Generating static pages (11/11)
Route (app)                              Size     First Load JS
┌ ○ /                                    17.2 kB         225 kB
├ ○ /admin                               44 kB           204 kB
├ ○ /admin/login                         3.84 kB         146 kB
ƒ Middleware                             133 kB

✅ ビルド成功
```

## デプロイ手順

1. 変更をコミット:
```bash
git add .
git commit -m "Fix admin login redirect issue in production"
```

2. Vercelへプッシュ（自動デプロイ）:
```bash
git push origin master
```

3. デプロイ後の確認:
   - Vercelダッシュボードでデプロイ完了を確認
   - 本番環境でログインテスト実施

## 注意事項

- **Supabase RLSポリシー**: `profiles`テーブルに認証済みユーザーが自分のロールを読み取れるRLSポリシーが必要
- **環境変数**: `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`が正しく設定されているか確認
- **セッションタイムアウト**: デフォルトで1時間。長時間操作がない場合は再ログインが必要

## 関連ドキュメント

- [管理者ユーザー作成ガイド](./ADMIN_USER_CREATION_GUIDE.md)
- [Supabaseスキーマ定義](./SUPABASE_SCHEMA.md)
- [セキュリティ監査レポート](./SECURITY_AUDIT_REPORT.md)
