import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function BlogCookiePage() {
  const project = projects.find((p) => p.id === "blog-cookie")!;
  return <ProjectPage project={project} />;
}
