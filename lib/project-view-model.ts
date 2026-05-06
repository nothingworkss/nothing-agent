import type {
  ProjectWithRuntime,
  RuntimeAction,
  RuntimeHealth,
  RuntimeStatus,
} from "@/lib/project-runtime";

export type ProjectStatusTone = "danger" | "warning" | "success" | "neutral";

export interface ProjectNextAction {
  action: RuntimeAction | "open" | "inspect";
  label: string;
  description: string;
}

export function getStatusTone(
  status: RuntimeStatus,
  health: RuntimeHealth
): ProjectStatusTone {
  if (status === "error") return "danger";
  if (status === "starting") return "warning";
  if (status === "running" && health !== "healthy") return "warning";
  if (status === "running") return "success";
  return "neutral";
}

export function getRuntimeLabel(project: ProjectWithRuntime) {
  const { runtime } = project;

  if (project.launchMode === "unconfigured") return "URL 필요";
  if (project.launchMode === "remote" && runtime.status === "running") {
    return runtime.healthy ? "배포 연결" : "연결 확인";
  }
  if (runtime.status === "error") return "확인 필요";
  if (runtime.status === "starting") return "시작 중";
  if (runtime.status === "running" && !runtime.healthy) return "불안정";
  if (runtime.status === "running") return "실행 중";
  return "대기";
}

export function getRuntimeDescription(project: ProjectWithRuntime) {
  const { runtime } = project;

  if (runtime.error) return runtime.error;
  if (project.launchMode === "remote" && runtime.status === "running") {
    return `${project.shortName} 배포 화면을 바로 열 수 있어요.`;
  }
  if (project.launchMode === "unconfigured") {
    return `${project.deploymentEnv}에 배포 URL을 넣으면 연결됩니다.`;
  }
  if (runtime.status === "running" && runtime.healthy) {
    return `${project.shortName} 작업면을 바로 열 수 있어요.`;
  }
  if (runtime.status === "starting") {
    return "프로세스가 올라오는 중입니다. 로그를 확인해 주세요.";
  }
  if (runtime.status === "running") {
    return "프로세스는 살아 있지만 헬스 체크가 아직 안정적이지 않아요.";
  }
  return "필요할 때 시작해서 작업면으로 전환하세요.";
}

export function getProjectNextAction(project: ProjectWithRuntime): ProjectNextAction {
  const { runtime } = project;

  if (project.launchMode === "remote") {
    return {
      action: "open",
      label: "열기",
      description: "배포된 작업면으로 이동합니다.",
    };
  }

  if (project.launchMode === "unconfigured") {
    return {
      action: "inspect",
      label: "URL 설정",
      description: "Railway 변수에 배포 URL을 넣어야 합니다.",
    };
  }

  if (runtime.status === "error") {
    return {
      action: "restart",
      label: "재시도",
      description: "프로세스를 다시 올리고 상태를 확인합니다.",
    };
  }

  if (runtime.status === "running" && runtime.healthy) {
    return {
      action: "open",
      label: "작업 열기",
      description: "실행 중인 로컬 화면으로 이동합니다.",
    };
  }

  if (runtime.status === "running") {
    return {
      action: "inspect",
      label: "로그 보기",
      description: "불안정한 상태와 최근 로그를 확인합니다.",
    };
  }

  if (runtime.status === "starting") {
    return {
      action: "inspect",
      label: "진행 보기",
      description: "시작 로그와 헬스 체크를 확인합니다.",
    };
  }

  return {
    action: "start",
    label: "시작",
    description: "프로젝트 서버를 로컬에서 실행합니다.",
  };
}

export function getProjectQueuePriority(project: ProjectWithRuntime) {
  const { runtime } = project;

  if (runtime.status === "error") return 0;
  if (runtime.status === "running" && !runtime.healthy) return 1;
  if (runtime.status === "starting") return 2;
  if (runtime.status === "running") return 3;
  if (project.featured) return 4;
  return 5;
}

export function sortProjectsForQueue(projects: ProjectWithRuntime[]) {
  return [...projects].sort((left, right) => {
    const priorityDelta =
      getProjectQueuePriority(left) - getProjectQueuePriority(right);

    if (priorityDelta !== 0) return priorityDelta;
    return left.priority - right.priority;
  });
}

export function getProjectInitial(project: Pick<ProjectWithRuntime, "shortName" | "name">) {
  return (project.shortName || project.name).slice(0, 1);
}
