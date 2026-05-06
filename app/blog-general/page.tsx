import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function BlogGeneralPage() {
  const project = projects.find((p) => p.id === "blog-general")!;
  return <ProjectPage project={project} />;
}
