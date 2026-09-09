# CLAUDE.md 최적화 계획

## 목표와 판단 기준

이미 정확한 CLAUDE.md를 더 정확하고 실용적으로 다듬는다. "최적화" = Claude Code가 이 문서를 읽고 다음 세션에서 실제로 더 나은 행동을 하게 되는지가 유일한 채택 기준. 범용 Next.js/React 지식이나 코드에서 바로 파생 가능한 내용은 추가하지 않는다(오히려 있으면 노이즈). 이 프로젝트만의 비표준 결정(radix-nova 스타일, use cache 특이사항, MCP 서버 구성 등)은 강조한다.

## 조사에서 새로 확인한 사실

- `.mcp.json`에는 서버가 4개다: `playwright`, `context7`, `sequential-thinking`, 그리고 사용자 배경조사에 없던 **`shadcn`**(`npx shadcn@latest mcp`). `.claude/settings.json`의 `enableAllProjectMcpServers: true`로 넷 다 활성화된다.
- `.claude/settings.json`의 `permissions.allow`에는 `mcp__playwright`, `mcp__sequential-thinking`만 있고 `mcp__context7`, `mcp__shadcn`은 없다 — CLAUDE.md 범위 밖이므로 이 계획에서는 다루지 않고 언급만 한다.
- `components.json`의 `menuColor`, `menuAccent`, `registries: {}`는 현재 기본값/빈 값이라 서술해도 Claude의 행동에 영향이 없다 → 추가하지 않는다.
- `eslint.config.mjs`는 `eslint-config-next`의 `core-web-vitals` + `typescript` preset을 그대로 쓰는 flat config로 커스텀 룰이 없다 → `npm run lint` 실행이나 파일 열람으로 바로 드러나는 정보라 추가하지 않는다.
- `.claude/agents/code-reviewer.md`(2곳)와 `.claude/commands/review.md`(1곳)에 구버전 `npx shadcn-ui@latest add`가 남아있다. CLAUDE.md는 이미 `npx shadcn@latest add`로 정확. 이 두 파일은 실행될 때마다 Claude에게 틀린 지시를 주입하므로 CLAUDE.md의 정확성이 무력화되는 상황 — 별도 트랙으로 계획에 포함하되 CLAUDE.md 본문 수정과는 분리해서 다룬다.

## CLAUDE.md에 적용할 구체적 변경사항

### 1. "Commands" 섹션 (라인 15~24) — 구조 분리 + MCP 정보 확장

**현재:**
```
## Commands

**Development & Build:**
- `npm run dev` — Start dev server (Turbopack, http://localhost:3000)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint on all files
- `npx eslint <file>` — Lint a single file

**No test runner is installed.** The project uses ESLint only (no vitest/jest/Playwright test framework). Playwright MCP (configured in `.mcp.json`) is available for browser automation tasks, not unit testing.
```

**변경 후:**
- "Development & Build" 소제목은 그대로 유지 (수정 없음)
- "No test runner..." 문단을 별도 소제목 **"MCP Tools"**로 분리하고 내용을 확장:
  - 테스트 러너 부재 서술은 유지 (정확하고 실용적인 정보)
  - Playwright MCP 문장 유지
  - **신규**: `context7` — "외부 라이브러리(react-hook-form, zod, react-day-picker, radix-ui, next-themes 등) API를 추측하지 말고 context7로 최신 문서를 조회할 것. Next.js 자체 문서는 `node_modules/next/dist/docs/`를 우선 참조(위 Breaking Changes 섹션 참고)"
  - **신규**: `sequential-thinking` — "여러 shadcn 컴포넌트를 조합하는 신규 기능 설계, 캐싱 전략 선택 등 다단계 판단이 필요한 작업에 사용"처럼 이 프로젝트 맥락에 한정된 짧은 트리거 조건만 명시 (범용 "복잡한 작업에 사용" 같은 공허한 문장 지양)
  - **신규**: `shadcn` MCP — 존재만 짧게 언급하고 상세 사용법은 아래 3번 항목(shadcn/ui 섹션)으로 위임 (중복 서술 방지)

### 2. "shadcn/ui Component Library" 섹션 (라인 58~70) — MCP 병기

**현재:**
```
- **When to update components**: Run `npx shadcn@latest add <component-name>` to regenerate. It will update files in `components/ui/` and install any new dependencies to `package.json`.
```

**변경 후:**
- 위 문장 유지
- 바로 아래에 한 줄 추가: "`shadcn` MCP 서버(`.mcp.json`에 구성)로도 동일 작업이 가능 — CLI(`npx shadcn@latest add`)가 기본 경로이며, MCP는 대화형 컨텍스트에서 컴포넌트를 탐색/선택해야 할 때 대안으로 사용"
- 근거: 이 섹션은 이미 "언제 무엇을 실행하는지"를 다루는 자리이므로 MCP 대안을 같은 자리에 병기하는 것이 자연스러움 (섹션 신설 대신 기존 섹션 확장)

### 3. code-reviewer.md / review.md 구버전 명령어 (별도 트랙, CLAUDE.md 비수정)

CLAUDE.md 실행 파일 목록에는 포함하지 않음. 별도 승인 시 다음 3곳만 타겟 치환:
- `.claude/agents/code-reviewer.md:45` — `npx shadcn-ui@latest add` → `npx shadcn@latest add`
- `.claude/agents/code-reviewer.md:77` — 동일 치환
- `.claude/commands/review.md:65` — 동일 치환

각 파일 내 다른 서술(5개 분석 항목, 프로젝트 컨텍스트 등)은 이미 정확하므로 손대지 않음.

## 범위에서 제외 (검토했으나 변경 불필요)

- 라인 5~13(Breaking Changes)과 라인 153~161(Performance & Caching)의 캐싱 관련 중복 — 이전 세션에서 "상단은 필독 경고, 하단은 구체적 전략"으로 의도적 분리 확정됨. 재검토 불필요.
- Slack 웹훅, PostToolUse 자동 포맷팅 — 개인 설정 성격, 기존 결정대로 CLAUDE.md에서 계속 제외.
- `components.json`의 menuColor/menuAccent/registries — 기본값/빈 값이라 서술 실익 없음.
- `eslint.config.mjs` 상세 구조 — 파일 열람 시 바로 파악되는 정보, 문서화 실익 없음.
- `permissions.allow`에 context7/shadcn MCP 권한이 없는 점 — CLAUDE.md 범위 밖(`.claude/settings.json` 이슈), 이번 계획에서 다루지 않음. 필요 시 사용자에게 별도 안건으로 언급만.

## 실행 파일

- `D:\claude\claude-nextjs-starterkit\CLAUDE.md` — 위 1, 2번 항목 수정 (본 계획의 핵심 범위)
- (선택, 별도 승인 시) `D:\claude\claude-nextjs-starterkit\.claude\agents\code-reviewer.md` — shadcn-ui 치환 2곳
- (선택, 별도 승인 시) `D:\claude\claude-nextjs-starterkit\.claude\commands\review.md` — shadcn-ui 치환 1곳

## 검증 방법

문서 수정이므로 빌드/테스트 불필요. 수정 후 CLAUDE.md를 재독해 다음을 확인:
- MCP Tools 섹션이 4개 서버(playwright/context7/sequential-thinking/shadcn) 각각의 "언제 쓰는지" 트리거를 담고 있는지
- shadcn/ui 섹션의 MCP 병기 문장이 기존 CLI 문장과 자연스럽게 이어지는지
- 전체 분량이 과도하게 늘지 않았는지 (타겟팅된 추가인지, 재작성이 아닌지) 확인
