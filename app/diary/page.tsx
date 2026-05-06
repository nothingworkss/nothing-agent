import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function DiaryPage() {
  const project = projects.find((p) => p.id === "diary")!;
  return <ProjectPage project={project} />;
}
