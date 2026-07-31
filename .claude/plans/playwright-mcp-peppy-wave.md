# CLAUDE.md 생성

## Context

`/init` 명령으로 이 저장소에 대한 `CLAUDE.md`를 생성해야 한다. 현재 `CLAUDE.md`는 `@AGENTS.md` 한 줄만 참조하고 있고, `AGENTS.md`는 "이 Next.js 버전은 학습 데이터와 다르니 `node_modules/next/dist/docs/`를 먼저 읽어라"는 경고만 담고 있다. README.md는 `create-next-app` 기본 템플릿 그대로라 프로젝트 고유 정보가 없다. Cursor/Copilot 규칙 파일은 없다.

즉 향후 Claude Code 인스턴스가 이 저장소에서 바로 생산적으로 작업하려면, 실제 코드를 읽어서 파악한 아키텍처와 커맨드를 `CLAUDE.md`에 정리해 남겨야 한다.

## 조사 결과 요약

**규모**: `app/`, `components/`, `lib/` 합쳐서 22개 `.tsx`/`.ts` 파일뿐인 소규모 데모 스타터킷. 라우트도 `/` 하나뿐(`app/page.tsx`), API 라우트 없음.

**스택**: Next.js 16.2.12 (Turbopack, App Router) + React 19.2.4 + TypeScript(strict) + Tailwind v4(CSS-first, `tailwind.config.*` 없음) + shadcn/ui(`radix-nova` 스타일, `components.json`) + react-hook-form + zod + next-themes + sonner + lucide-react + date-fns + react-day-picker.

**커맨드** (package.json scripts):
- `npm run dev` → `next dev` (Turbopack, 기본 포트 3000)
- `npm run build` → `next build`
- `npm run start` → `next start`
- `npm run lint` → `eslint` (테스트 러너 없음 — vitest/jest/playwright 러너 미설치. `.mcp.json`의 playwright는 브라우저 자동화 MCP 도구일 뿐 테스트 프레임워크 아님)
- 단일 파일 lint: `npx eslint <path>`

**아키텍처 핵심 포인트**:
1. **AGENTS.md 경고가 최우선 규칙** — Next.js 16 문서(`node_modules/next/dist/docs/01-app/`)를 먼저 확인해야 함. 특히 `use cache`/Cache Components, Adapters API가 신규 개념.
2. **레이아웃 계층**: `app/layout.tsx` (서버 컴포넌트, Geist 폰트+메타데이터) → `ThemeProvider`(`components/theme-provider.tsx`, next-themes 래퍼, `"use client"`) → `SiteHeader`/`Container`/`{children}`/`SiteFooter`/`Toaster` 순서로 조립. `components/layout/`에 헤더·푸터·컨테이너·페이지헤더가 분리되어 있음.
3. **`app/page.tsx`는 전체가 `"use client"`** — 서버 컴포넌트가 아님. react-hook-form+zod 폼, Calendar/Popover, Dialog, Sheet, Tabs, Badge, Avatar, DropdownMenu 등 shadcn/ui 컴포넌트 쇼케이스.
4. **shadcn/ui 컴포넌트는 `components/ui/`에 로컬 복사**되어 있고 `components.json`의 alias(`@/components`, `@/lib/utils`, `@/components/ui` 등)를 통해 참조. `cn()` 유틸은 `lib/utils.ts` (clsx + tailwind-merge).
5. **Tailwind v4 CSS-first 설정**: `tailwind.config.*` 파일 없음. 전부 `app/globals.css`의 `@theme inline` 블록 + `:root`/`.dark`의 CSS 변수(oklch 색상 체계)로 정의. `@import "shadcn/tailwind.css"`로 shadcn 패키지에서 직접 베이스 스타일을 가져오는 비전형적 패턴(구버전 shadcn CLI 로컬 복사 방식과 다름).
6. **컴포넌트 alias 체계**: `components.json`에 `style: "radix-nova"`, aliases(`components`, `utils`, `ui`, `lib`, `hooks`) 정의. `hooks/` 디렉토리는 alias만 있고 실제 폴더는 아직 없음(사용 시 새로 생성 필요).

## CLAUDE.md 구조 (작성할 내용)

1. 필수 프리픽스 (`# CLAUDE.md` + 안내 문구)
2. **가장 먼저**: AGENTS.md의 경고를 그대로 강조 인용 (Next.js 16 breaking change, 문서 우선 확인)
3. **Commands** 섹션: dev/build/start/lint, 단일 파일 lint 방법, 테스트 러너 없음을 명시
4. **Architecture** 섹션:
   - 레이아웃 조립 순서 (layout.tsx → ThemeProvider → Header/Container/children/Footer/Toaster)
   - `app/page.tsx`가 통째로 client component라는 점
   - shadcn/ui 컴포넌트 alias 구조와 `cn()` 유틸 위치
   - Tailwind v4 CSS-first 설정 방식과 `globals.css` 내 `@theme inline`/oklch 변수 구조
   - `components.json`의 `radix-nova` 스타일이 표준 shadcn 스타일과 다르다는 점

## 실행 방법
- 위 내용을 반영해 `D:\claude\claude-nextjs-starterkit\CLAUDE.md`를 새로 작성(현재 `@AGENTS.md` 한 줄을 대체하되, `@AGENTS.md` import는 유지하거나 내용을 통합 — AGENTS.md 자체는 건드리지 않음)
- 파일 크기는 스캔하기 쉽게 간결하게 유지 (불필요한 표/설명 나열 지양)

## 검증 방법
- 작성 후 `CLAUDE.md`를 다시 읽어 AGENTS.md 경고가 누락되지 않았는지, 실제 파일 경로들이 정확한지 재확인
