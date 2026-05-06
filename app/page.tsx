import { Suspense } from "react";

import { HomeDashboard } from "@/components/dashboard/home-dashboard";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeDashboard />
    </Suspense>
  );
}
