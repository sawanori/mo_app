"use client";

import { History, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">モバイルオーダー</span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link href="/order-history">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                <History className="h-5 w-5" />
                <span className="text-xs">履歴</span>
              </Button>
            </Link>
            <Link href="/payment">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                <Receipt className="h-5 w-5" />
                <span className="text-xs">会計</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}