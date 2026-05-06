import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-semibold">페이지를 찾을 수 없어요</h2>
        <p className="text-muted-foreground text-sm">
          요청한 페이지가 존재하지 않아요.
        </p>
        <Link href="/" className={buttonVariants()}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
