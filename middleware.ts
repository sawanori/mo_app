import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 管理画面のパスをチェック
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('/admin/login')) {
    
    // クライアントサイドの認証状態を確認
    const isAuthenticated = request.cookies.get('auth-storage');
    
    if (!isAuthenticated || !isAuthenticated.value.includes('"isAuthenticated":true')) {
      // 未認証の場合、ログインページにリダイレクト
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}