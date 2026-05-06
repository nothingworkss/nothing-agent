import { projects } from "@/lib/projects";
import { ProjectPage } from "@/components/dashboard/project-page";

export default function CurationPage() {
  const project = projects.find((p) => p.id === "curation")!;
  return <ProjectPage project={project} />;
}
