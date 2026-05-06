import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function CafeWriterPage() {
  const project = projects.find((p) => p.id === "cafe-writer")!;
  return <ProjectPage project={project} />;
}
