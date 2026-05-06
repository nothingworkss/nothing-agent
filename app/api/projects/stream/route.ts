import { getProjectRuntimeManager } from "@/lib/server/project-runtime-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const manager = getProjectRuntimeManager();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const close = () => {
        if (closed) return;
        closed = true;
        unsubscribe();
        clearInterval(heartbeat);
        controller.close();
      };

      const unsubscribe = manager.subscribe((snapshot) => {
        controller.enqueue(encoder.encode(serializeSse("snapshot", snapshot)));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(serializeSse("ping", { ok: true })));
      }, 15000);

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
