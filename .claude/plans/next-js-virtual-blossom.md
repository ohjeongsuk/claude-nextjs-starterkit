# CLAUDE.md 최적화 계획

## Context (왜 이 작업을 하는가)

`CLAUDE.md`는 Claude Code가 이 프로젝트에서 작업할 때마다 읽는 핵심 가이드 문서다. 코드베이스를 실제로 조사해본 결과, 본문 내용은 이미 대부분 정확했다 — 이전 세션(`next-js-snuggly-eclipse.md`)에서 구식 shadcn 명령어, page-header.tsx 오기재, 코드 리뷰 섹션 미비 등 3가지를 이미 교정해두었기 때문이다.

이번 최적화의 동기는 두 가지 새로 발견된 공백이다:

1. **`.mcp.json`에 4개의 MCP 서버(playwright, context7, sequential-thinking, shadcn)가 구성되어 있는데, CLAUDE.md는 Playwright만 언급**한다. `enableAllProjectMcpServers: true`로 넷 다 활성화되어 있음에도 나머지 세 서버는 존재 자체가 문서화되지 않아, Claude Code가 이 세션에서도 처음엔 도구 존재를 놓칠 뻔했다 — 문서 공백이 실제 행동 저하로 이어지는 사례.
2. **`.claude/agents/code-reviewer.md`, `.claude/commands/review.md`에 구식 `npx shadcn-ui@latest add` 명령어가 3곳 잔존**한다. CLAUDE.md 본문은 이미 올바른 `npx shadcn@latest add`를 쓰고 있어, 코드 리뷰가 호출될 때마다 정확한 문서(CLAUDE.md)와 부정확한 지시(리뷰 에이전트/커맨드)가 충돌하는 상태다.

목표는 "이미 정확한 문서를 실용적으로 다듬는 것"이며, 판단 기준은 오직 하나 — **이 변경이 Claude Code의 다음 작업 품질을 실제로 높이는가**. 범용 지식이나 파일을 열면 바로 드러나는 정보(eslint.config.mjs 세부구조, components.json의 미사용 필드 등)는 추가하지 않는다.

## 변경 사항

### 1. `CLAUDE.md` — "Commands" 섹션에 "MCP Tools" 소제목 신설

**대상**: 현재 15~24행 부근, "No test runner is installed..." 문단.

기존 문단을 별도 소제목 **"MCP Tools"**로 분리하고 4개 서버 각각의 트리거 조건을 실용적으로 명시한다:

- 테스트 러너 부재 서술 유지 (기존 문장 그대로)
- **Playwright MCP**: 기존 문장 유지 (브라우저 자동화용, 단위 테스트 아님)
- **context7** (신규): 외부 라이브러리(react-hook-form, zod, react-day-picker, radix-ui, next-themes 등) API를 추측하지 말고 조회할 것. Next.js 자체 문서는 `node_modules/next/dist/docs/`를 우선 참조하도록 안내 (상단 Breaking Changes 섹션과 연결)
- **sequential-thinking** (신규): 여러 shadcn 컴포넌트를 조합하는 신규 기능 설계, 캐싱 전략 선택 등 다단계 판단이 필요할 때 사용 — 이 프로젝트 맥락에 한정한 짧은 트리거만 기술 (공허한 범용 문구 지양)
- **shadcn MCP** (신규): 존재만 짧게 언급, 상세 사용법은 아래 2번 항목(shadcn/ui 섹션)으로 위임해 중복 서술 방지

### 2. `CLAUDE.md` — "shadcn/ui Component Library" 섹션에 MCP 대안 병기

**대상**: 현재 58~70행 부근, `npx shadcn@latest add <component-name>` 문장 바로 아래.

한 줄 추가: CLI(`npx shadcn@latest add`)가 기본 경로이며, `shadcn` MCP 서버(`.mcp.json`에 구성됨)는 대화형 컨텍스트에서 컴포넌트를 탐색/선택해야 할 때 대안으로 쓸 수 있다는 내용. 기존 "언제 무엇을 실행하는지"를 다루는 자리이므로 섹션 신설 없이 기존 문장에 자연스럽게 병기한다.

### 3. `.claude/agents/code-reviewer.md` — 구식 명령어 치환 (2곳)

45행, 77행의 `npx shadcn-ui@latest add` → `npx shadcn@latest add`. 다른 서술(5개 분석 항목, 프로젝트 컨텍스트 등)은 이미 정확하므로 손대지 않는다.

### 4. `.claude/commands/review.md` — 구식 명령어 치환 (1곳)

65행의 `npx shadcn-ui@latest add` → `npx shadcn@latest add`. 마찬가지로 다른 부분은 유지.

## 범위 제외 (검토했으나 변경 불필요)

- Breaking Changes(상단)와 Performance & Caching(하단)의 캐싱 관련 서술 중복 — 이전 세션에서 "필독 경고 vs 구체적 전략"으로 의도적 분리가 이미 확정됨.
- Slack 웹훅 훅, PostToolUse 자동 포맷팅 계획(미구현) — 개인 설정 성격이라 기존 결정대로 CLAUDE.md에서 계속 제외.
- `components.json`의 `menuColor`/`menuAccent`/`registries` — 기본값/빈 값이라 서술 실익 없음.
- `eslint.config.mjs` 상세 구조(flat config, core-web-vitals + typescript preset) — 파일을 열거나 `npm run lint` 실행 시 바로 드러나는 정보.
- `.claude/settings.json`의 `permissions.allow`에 `mcp__context7`/`mcp__shadcn` 권한이 빠져있는 점 — CLAUDE.md 문서화 범위 밖(설정 이슈이므로 이번 작업에서 다루지 않음).

## 수정 대상 파일

- `D:\claude\claude-nextjs-starterkit\CLAUDE.md` — 변경 1, 2
- `D:\claude\claude-nextjs-starterkit\.claude\agents\code-reviewer.md` — 변경 3
- `D:\claude\claude-nextjs-starterkit\.claude\commands\review.md` — 변경 4

## 검증 방법

문서 수정이므로 빌드/테스트는 불필요. 수정 후 아래를 확인한다:

- `CLAUDE.md`를 재독해 "MCP Tools" 소제목이 4개 서버(playwright/context7/sequential-thinking/shadcn) 각각의 "언제 쓰는지" 트리거를 담고 있는지 확인
- shadcn/ui 섹션의 MCP 병기 문장이 기존 CLI 문장과 자연스럽게 이어지는지 확인
- `code-reviewer.md`, `review.md`에 `shadcn-ui` 문자열이 더 이상 남아있지 않은지 grep으로 확인 (`npx shadcn@latest`만 남아야 함)
- 전체 분량이 과도하게 늘지 않았는지 확인 — 타겟팅된 편집이지 재작성이 아님
