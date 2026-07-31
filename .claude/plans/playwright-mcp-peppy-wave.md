# 미커밋 변경사항을 의미 단위로 분리하여 커밋

## Context

이전 세션에서 Playwright MCP로 오류를 진단하는 과정과, Claude Code / VS Code 사용 과정에서 여러 untracked 파일이 생겼다. `app/page.tsx`, `components/theme-toggle.tsx`의 실제 버그 수정은 이미 `7bcd94d` 커밋으로 반영되어 있고, 지금 워킹트리에 남은 것은 전부 untracked 파일이다.

사용자는 이 untracked 파일들을 "의미 있는 단위로 분리"해서 커밋하길 원한다. 이를 위해 먼저 각 파일이 (a) 저장소에 실제로 커밋할 가치가 있는 설정/문서인지, (b) 로컬 전용/일회성 산출물이라 `.gitignore`에 넣어야 하는지 구분해야 한다. 무분별하게 전부 커밋하면 로그 파일이나 개인 권한 설정 같은 노이즈가 git 이력에 영구히 남는다.

## 조사 결과: 파일별 성격 분류

| 경로 | 성격 | 처리 방침 |
|---|---|---|
| `.mcp.json` | 프로젝트 MCP 서버 설정 (Playwright MCP) — 팀원 누구나 공유해야 동작 | **커밋** |
| `.vscode/settings.json` | 에디터 설정 (`css.lint.unknownAtRules: ignore` — Tailwind v4 `@theme`/`@apply` at-rule 경고 방지) — 팀 공유 가치 있음 | **커밋** |
| `.claude/settings.json` | 프로젝트 공통 Claude Code 권한 설정 (Bash, WebSearch, mcp__playwright 허용) | **커밋** |
| `.claude/settings.local.json` | 이름상 로컬 전용 오버라이드 파일 (Claude Code 컨벤션) — `settings.json`과 내용이 동일하며 개인 환경마다 달라질 수 있음 | **gitignore 처리, 커밋 제외** (사용자 확인 완료) |
| `.claude/plans/*.md` | 세션 중 생성된 계획 문서 2개 | **커밋** (사용자 확인 완료 — 작업 이력으로 저장소에 보존) |
| `.claude/scheduled_tasks.lock` | 스케줄 실행 중 생성되는 런타임 lock 파일 | **gitignore 처리, 커밋 제외** |
| `.playwright-mcp/*` (log, yml, png) | Playwright MCP 세션 산출물 (콘솔 로그, 스냅샷, 스크린샷) — 완전히 일회성 디버깅 산출물 | **gitignore 처리, 커밋 제외** |
| `build.log` | 이전 세션에서 `npm run build | tee build.log`로 생성한 임시 로그 | **삭제 후 gitignore 처리** |

## 실행 계획

### 1. `.gitignore`에 항목 추가
기존 `.gitignore`(misc/debug 섹션 근처)에 다음을 추가:
```
# claude code (로컬 전용/런타임 산출물)
.claude/settings.local.json
.claude/scheduled_tasks.lock

# playwright mcp 세션 산출물
.playwright-mcp/

# 임시 빌드 로그
build.log
```
(`.claude/plans/`는 커밋 대상이므로 gitignore에 넣지 않음)

### 2. 불필요한 산출물 제거
- `build.log` 삭제 (이미 완료된 디버깅용 임시 파일, 저장소에 둘 이유 없음)
- `.playwright-mcp/`는 `.gitignore` 처리만 하고 디렉토리 자체는 그대로 둠 (로컬 디버깅 산출물이라 삭제 여부는 사용자 판단에 맡기되, 기본적으로 git 추적 대상에서만 제외)

### 3. 의미 단위로 커밋 분리 (3개 커밋)

**커밋 1 — 프로젝트 공유 설정 추가**
- 대상: `.mcp.json`, `.vscode/settings.json`, `.claude/settings.json`
- 메시지 예: `Playwright MCP 및 에디터 설정 추가`

**커밋 2 — 작업 계획 문서 보존**
- 대상: `.claude/plans/playwright-mcp-peppy-wave.md`, `.claude/plans/staged-pondering-crescent.md`
- 메시지 예: `이전 작업 세션의 계획 문서 추가`

**커밋 3 — gitignore 정리**
- 대상: `.gitignore` (수정). `build.log`는 이미 rm으로 삭제 — untracked였던 파일이라 삭제해도 git에는 기록이 안 남으므로 별도 add 불필요
- 메시지 예: `Claude Code 로컬 설정 및 임시 산출물 gitignore 처리`

## 검증 방법
- 각 커밋 후 `git show --stat <commit>`으로 커밋에 포함된 파일 목록이 의도대로인지 확인
- 최종적으로 `git status`가 clean한지 (untracked 파일 없음) 확인
- `git log --oneline -5`로 커밋 분리가 의도대로 되었는지 확인
