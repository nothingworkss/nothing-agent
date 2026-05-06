export type ProjectStatus = "stopped" | "running" | "error";
export type ProjectCategory = "diary" | "blog" | "automation" | "curation";

export interface Project {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  accent: string;
  path: string;
  category: ProjectCategory;
  techStack: string;
  route: string;
  serverCommand: string;
  port: number;
  serverPath?: string;
  featured?: boolean;
  priority: number;
  keywords: string[];
}

const projectDefinitions = [
  {
    id: "diary",
    name: "통합일기앱",
    shortName: "일기",
    description: "AI가 도와주는 감정 일기 기록",
    icon: "📔",
    color:
      "border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,237,0.92))]",
    accent: "amber",
    path: "/Users/nahmsoochan/Desktop/통합일기앱 final",
    category: "diary",
    techStack: "Next.js",
    route: "/diary",
    serverCommand: "npx next dev --webpack -p 3001",
    port: 3001,
    priority: 3,
    keywords: ["journal", "diary", "emotion", "감정", "일기"],
  },
  {
    id: "nothing-matters",
    name: "낫띵메터스 자동화",
    shortName: "낫띵메터스",
    description: "브랜드 블로그 자동 포스팅",
    icon: "🤖",
    color:
      "border-violet-200/80 bg-[linear-gradient(180deg,rgba(245,243,255,0.96),rgba(250,245,255,0.92))]",
    accent: "violet",
    path: "/Users/nahmsoochan/Desktop/낫띵메터스 자동화 v2",
    category: "automation",
    techStack: "Next.js",
    route: "/nothing-matters",
    serverCommand: "npx next dev --webpack -p 3131",
    port: 3131,
    serverPath: "/keywords",
    featured: true,
    priority: 1,
    keywords: ["automation", "brand", "blog", "posting", "auto", "낫띵메터스"],
  },
  {
    id: "nothingmatters-blog-studio",
    name: "nothingmatters Blog Studio",
    shortName: "블로그 스튜디오",
    description: "네이버/워드프레스 블로그 초안 생성",
    icon: "🍪",
    color:
      "border-pink-200/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,247,237,0.92))]",
    accent: "rose",
    path: "/Users/nahmsoochan/Desktop/브랜드블로그/nothingmatters-blog-studio",
    category: "blog",
    techStack: "Next.js + Supabase + OpenAI",
    route: "/nothingmatters-blog-studio",
    serverCommand: "npm run dev -- --hostname 127.0.0.1 --port 3017",
    port: 3017,
    featured: true,
    priority: 1.5,
    keywords: [
      "nothingmatters",
      "blog",
      "studio",
      "naver",
      "wordpress",
      "낫띵메터스",
      "블로그",
      "워드프레스",
    ],
  },
  {
    id: "blog-cookie",
    name: "쿠키 블로그 생성기",
    shortName: "쿠키",
    description: "브랜드 프리셋 기반 블로그 글 생성",
    icon: "🍪",
    color:
      "border-orange-200/80 bg-[linear-gradient(180deg,rgba(255,247,237,0.96),rgba(255,237,213,0.92))]",
    accent: "orange",
    path: "/Users/nahmsoochan/Desktop/블로그생성기 v7-1",
    category: "blog",
    techStack: "HTML/JS + Python",
    route: "/blog-cookie",
    serverCommand: "python3 server.py 3003",
    port: 3003,
    priority: 4,
    keywords: ["cookie", "blog", "preset", "브랜드", "쿠키"],
  },
  {
    id: "blog-general",
    name: "일반 블로그 생성기",
    shortName: "일반 블로그",
    description: "범용 블로그 포스트 자동 생성",
    icon: "✍️",
    color:
      "border-sky-200/80 bg-[linear-gradient(180deg,rgba(240,249,255,0.96),rgba(224,242,254,0.92))]",
    accent: "sky",
    path: "/Users/nahmsoochan/Desktop/블로그생성기 final v5",
    category: "blog",
    techStack: "Node.js",
    route: "/blog-general",
    serverCommand: "node server.js",
    port: 3250,
    priority: 5,
    keywords: ["general", "blog", "writer", "포스트", "블로그"],
  },
  {
    id: "blog-bag",
    name: "가방 블로그 생성기",
    shortName: "가방 블로그",
    description: "가방 전문 리서치 + 블로그 생성",
    icon: "👜",
    color:
      "border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,228,230,0.92))]",
    accent: "rose",
    path: "/Users/nahmsoochan/Desktop/가방블로그생성기v1",
    category: "blog",
    techStack: "HTML/JS + Node.js",
    route: "/blog-bag",
    serverCommand: "node server.js",
    port: 3005,
    priority: 6,
    keywords: ["bag", "fashion", "research", "가방", "리서치"],
  },
  {
    id: "curation",
    name: "큐레잉션",
    shortName: "큐레잉션",
    description: "AI 트렌드 큐레이션 + 카드뉴스",
    icon: "📰",
    color:
      "border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(209,250,229,0.92))]",
    accent: "emerald",
    path: "/Users/nahmsoochan/Desktop/큐레잉션",
    category: "curation",
    techStack: "Node.js",
    route: "/curation",
    serverCommand: "node src/server.mjs",
    port: 4321,
    featured: true,
    priority: 2,
    keywords: ["curation", "news", "trend", "cards", "큐레이션"],
  },
  {
    id: "cafe-writer",
    name: "카페 글제작기",
    shortName: "카페 글",
    description: "nothingworks lazy club 카페 글 생성",
    icon: "☕",
    color:
      "border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(254,243,199,0.92))]",
    accent: "amber",
    path: "/Users/nahmsoochan/Desktop/카페글제작",
    category: "blog",
    techStack: "Next.js",
    route: "/cafe-writer",
    serverCommand: "npm run dev -- --hostname 127.0.0.1 --port 7777",
    port: 7777,
    priority: 4.5,
    keywords: ["cafe", "lazy club", "copy", "writer", "카페", "글쓰기"],
  },
  ] satisfies Project[];

export const projects: Project[] = [...projectDefinitions].sort(
  (left, right) => left.priority - right.priority
);

export const categories = [
  {
    id: "all",
    label: "전체",
    icon: "🏠",
    description: "모든 워크스페이스를 한 번에 확인합니다.",
  },
  {
    id: "diary",
    label: "일기",
    icon: "📔",
    description: "기록과 회고 중심 프로젝트",
  },
  {
    id: "blog",
    label: "블로그",
    icon: "✍️",
    description: "콘텐츠 생성과 발행 워크플로",
  },
  {
    id: "automation",
    label: "자동화",
    icon: "🤖",
    description: "자동 실행과 운영 흐름",
  },
  {
    id: "curation",
    label: "큐레이션",
    icon: "📰",
    description: "리서치와 큐레이션 허브",
  },
] as const;

export function getCategoryLabel(category: ProjectCategory | "all") {
  return categories.find((item) => item.id === category)?.label ?? "전체";
}

export function getProjectServerUrl(project: Pick<Project, "port" | "serverPath">) {
  return `http://localhost:${project.port}${project.serverPath ?? ""}`;
}

export function getProjectServerLabel(
  project: Pick<Project, "port" | "serverPath">
) {
  return `localhost:${project.port}${project.serverPath ?? ""}`;
}
