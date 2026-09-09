# CLAUDE.md 최적화 계획

## Context

`CLAUDE.md`는 Claude Code가 이 저장소에서 작업할 때마다 참조하는 프로젝트 지침 문서다. 실제 코드베이스(`package.json`, `components.json`, `app/`, `components/`, `.claude/agents/`, `.claude/commands/`, `node_modules/next/dist/docs/`)와 대조 검증한 결과, 문서 자체의 전반적인 구조와 설명 품질은 양호하지만 **실행하면 실패하는 outdated 명령어**와 **이미 존재하는 자산이 반영되지 않은 부분**이 발견됐다. "최적화"의 핵심은 분량을 줄이는 것이 아니라 정확성을 회복하고, 최근 커밋(`code-reviewer` 에이전트, `/review` 커맨드 추가)으로 생긴 문서 공백을 메우는 것이다.

## 발견한 문제와 근거

1. **`npx shadcn-ui@latest add` 명령어 오류** (2곳: "shadcn/ui Component Library" 섹션, "Workflow Tips" 섹션)
   - `package.json:24`에 `"shadcn": "^4.16.0"`이 설치되어 있음 — 이는 새 패키지명이다. 구 패키지명 `shadcn-ui`는 deprecated되어 이 명령어를 실행하면 실패하거나 잘못된 패키지를 받는다.
   - 참고로 동일한 오류가 `.claude/agents/code-reviewer.md:45,77`와 `.claude/commands/review.md:65`에도 있지만, 이번 작업 범위는 `CLAUDE.md`로 한정한다(사용자 요청 범위).

2. **`page-header.tsx`를 "(Optional)"로 서술** (Directory Structure 트리)
   - 실제로는 이미 `components/layout/page-header.tsx`로 존재하고, `app/page.tsx:8`에서 `PageHeader`로 import되어 사용 중이다. "선택적으로 만들 수 있는 컴포넌트"처럼 서술되어 있어 이미 사용 중인 컴포넌트를 없는 것처럼 오인시킨다.

3. **Code Review Automation 섹션의 정보 공백**
   - 현재 2줄뿐이며, "파일 수정 후 code-reviewer 서브에이전트를 자동 호출하라"는 내용만 있다.
   - 실제로는 `.claude/commands/review.md`라는 **수동 `/review` 커맨드**도 이미 존재하며, 특정 코드/파일을 지정해 리뷰받을 때 쓴다. 자동 트리거(서브에이전트)와 수동 트리거(커맨드)의 역할이 다른데 문서에 구분이 없어, 향후 세션에서 "코드 리뷰해줘" 같은 모호한 요청을 받았을 때 어느 쪽을 써야 할지 판단 근거가 부족하다.
   - 상세 리뷰 기준(5개 분석 항목 등)은 `.claude/agents/code-reviewer.md`와 `.claude/commands/review.md`에 이미 원본으로 존재하므로, CLAUDE.md에 복제 서술하지 않고 파일 경로만 참조한다 (단일 진실 소스 유지 — 두 곳에 같은 내용을 적어두면 한쪽만 고치고 다른 쪽을 깜빡하는 drift가 생긴다).

## 범위에서 제외한 것 (검토했으나 변경 불필요)

- **캐싱 관련 두 섹션("🚨 Critical" vs "Performance & Caching")**: 부분적으로 겹치지만 사용자 확인 결과 현재 구조 유지로 결정 — 상단은 "코딩 전 필독 경고", 하단은 "구체적 캐싱 전략"으로 목적이 이미 자연스럽게 분리되어 있다.
- **`node_modules/next/dist/docs/01-app/` 경로들**: `01-getting-started/08-caching.md`, `01-api-reference/01-directives/use-cache.md`, `03-api-reference/07-adapters/` 모두 실제로 존재함을 확인 — 수정 불필요.
- **`.claude/slack-webhook.ps1` 및 관련 훅**: `.claude/settings.local.json`의 개인 로컬 알림 설정(Notification/Stop 훅)일 뿐, 프로젝트 공용 아키텍처/컨벤션이 아니므로 CLAUDE.md에 넣지 않는다.

## 실행 파일

- `D:\claude\claude-nextjs-starterkit\CLAUDE.md` — 위 3가지 항목만 수정

## 구체적 수정 내용

### 1. shadcn 명령어 수정 (2곳)
- "shadcn/ui Component Library" 섹션의 "When to update components" 항목
- "Workflow Tips" 섹션 2번 항목
- `npx shadcn-ui@latest add <component-name>` → `npx shadcn@latest add <component-name>`

### 2. page-header.tsx 설명 정정
- Directory Structure 트리의 `└── page-header.tsx   # (Optional) for page titles`
- → 이미 존재하며 사용 중임을 반영 (예: `# Page title/description wrapper (used in app/page.tsx)`)

### 3. Code Review Automation 섹션 확장
기존 2줄을 다음 내용으로 교체:
- 자동 트리거: 파일 생성/수정 완료 직후 → `code-reviewer` 서브에이전트(`.claude/agents/code-reviewer.md`) 자동 호출, 결과를 요약해 사용자에게 보고
- 수동 트리거: 특정 코드 조각/파일을 지정해 리뷰가 필요할 때 → `/review` 커맨드(`.claude/commands/review.md`) 사용
- 두 경로 모두 리뷰 기준(5개 분석 항목, 프로젝트 컨벤션 체크리스트)은 해당 파일에 정의되어 있으므로 이 문서에서는 반복하지 않음

## 검증 방법

- 코드 실행이 필요한 변경이 아니므로(문서 수정) `npm run lint`나 빌드는 불필요.
- 수정 후 `CLAUDE.md`를 다시 읽어 사용자에게 diff 형태로 확인시키고, 3가지 항목이 모두 반영됐는지 육안 확인.
