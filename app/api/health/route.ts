import { NextResponse } from "next/server";

import { getProjectRuntimeManager } from "@/lib/server/project-runtime-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const manager = getProjectRuntimeManager();
  await manager.refreshHealth();
  const snapshot = manager.getSnapshot();

  return NextResponse.json({
    timestamp: snapshot.generatedAt,
    summary: snapshot.summary,
    projects: snapshot.projects.map((project) => ({
      id: project.id,
      name: project.name,
      port: project.port,
      healthy: project.runtime.healthy,
      health: project.runtime.health,
      status: project.runtime.status,
      updatedAt: project.runtime.updatedAt,
    })),
  });
}
