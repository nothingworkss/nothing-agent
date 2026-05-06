import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function NothingmattersBlogStudioPage() {
  const project = projects.find((p) => p.id === "nothingmatters-blog-studio")!;
  return <ProjectPage project={project} />;
}
