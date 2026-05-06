import { NextRequest, NextResponse } from "next/server";

import { getProjectRuntimeManager } from "@/lib/server/project-runtime-manager";
import type { RuntimeAction } from "@/lib/project-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const manager = getProjectRuntimeManager();
  await manager.refreshHealth();
  return NextResponse.json(manager.getSnapshot());
}

export async function POST(req: NextRequest) {
  const { projectId, action } = (await req.json()) as {
    projectId?: string;
    action?: RuntimeAction;
  };

  if (!projectId || !action) {
    return NextResponse.json(
      { ok: false, error: "projectId와 action이 필요해요." },
      { status: 400 }
    );
  }

  const manager = getProjectRuntimeManager();

  try {
    const result = await manager.handleAction(projectId, action);
    return NextResponse.json(result, {
      status: result.ok ? 200 : 409,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했어요.",
      },
      { status: 500 }
    );
  }
}
