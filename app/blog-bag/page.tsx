import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function BlogBagPage() {
  const project = projects.find((p) => p.id === "blog-bag")!;
  return <ProjectPage project={project} />;
}
