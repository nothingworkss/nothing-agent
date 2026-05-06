export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="h-40 animate-pulse rounded-[2rem] border border-white/60 bg-white/78" />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-72 animate-pulse rounded-[1.8rem] border border-white/60 bg-white/78" />
          <div className="h-72 animate-pulse rounded-[1.8rem] border border-white/60 bg-white/78" />
        </div>
        <div className="h-72 animate-pulse rounded-[1.8rem] border border-white/60 bg-white/78" />
      </div>
      <p className="text-sm text-muted-foreground">상황판을 불러오는 중…</p>
    </div>
  );
}
