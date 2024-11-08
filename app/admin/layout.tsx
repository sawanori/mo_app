"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import Navigation from "@/components/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // ログインページではヘッダーを表示しない
  if (isLoginPage) {
    return children;
  }

  return (
    <>
      <AdminHeader />
      {children}
    </>
  );
}