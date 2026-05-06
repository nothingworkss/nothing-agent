import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function NothingMattersPage() {
  const project = projects.find((p) => p.id === "nothing-matters")!;
  return <ProjectPage project={project} />;
}
