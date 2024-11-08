import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">ページが見つかりません</h2>
        <p className="text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/">
          <Button className="mt-4">
            <Home className="mr-2 h-4 w-4" />
            ホームに戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}