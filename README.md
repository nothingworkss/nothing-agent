# Agent Hub

프로젝트 실행 상태와 작업 화면을 한곳에서 보는 Next.js 운영 대시보드입니다.

## Local

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:3000`입니다. 로컬에서는 각 프로젝트의 `serverCommand`를 실행해서 `localhost` 포트로 연결합니다.

## Railway

Railway에서는 이 Mac의 로컬 경로와 포트에 접근할 수 없습니다. 각 프로젝트를 Railway 서비스로 따로 배포한 뒤, Agent Hub 서비스 변수에 배포 URL을 넣어 연결합니다.

```bash
NEXT_PUBLIC_AGENT_HUB_REMOTE_MODE=1
NEXT_PUBLIC_AGENT_HUB_DIARY_URL=https://your-diary.up.railway.app
NEXT_PUBLIC_AGENT_HUB_NOTHING_MATTERS_URL=https://your-nothing-matters.up.railway.app/keywords
NEXT_PUBLIC_AGENT_HUB_NOTHINGMATTERS_BLOG_STUDIO_URL=https://your-blog-studio.up.railway.app
NEXT_PUBLIC_AGENT_HUB_BLOG_COOKIE_URL=https://your-cookie-blog.up.railway.app
NEXT_PUBLIC_AGENT_HUB_BLOG_GENERAL_URL=https://your-general-blog.up.railway.app
NEXT_PUBLIC_AGENT_HUB_BLOG_BAG_URL=https://your-bag-blog.up.railway.app
NEXT_PUBLIC_AGENT_HUB_CURATION_URL=https://your-curation.up.railway.app
NEXT_PUBLIC_AGENT_HUB_CAFE_WRITER_URL=https://your-cafe-writer.up.railway.app
```

변수를 바꾼 뒤에는 Railway에서 Agent Hub를 redeploy해야 클라이언트 번들에 URL이 반영됩니다.

## Deployment

이 저장소에는 `railway.json`이 포함되어 있습니다. Railway에서 GitHub repo를 연결하면 `npm run build`로 standalone build를 만들고 `npm start`로 실행합니다. 헬스체크 경로는 `/api/health`입니다.
