# 코드 리뷰 서브에이전트(`code-reviewer`) 추가

## Context
현재 프로젝트에는 `/review`라는 읽기 전용 슬래시 커맨드(`.claude/commands/review.md`)가 이미 있어, 사용자가 명시적으로 호출했을 때 코드 조각/파일을 리뷰해준다. 이번 요청은 이것과 별개로, **코드 구현이 끝날 때마다 자동으로 실행되는 전용 서브에이전트**를 `.claude/agents/`에 만드는 것이다. 서브에이전트는 권한을 읽기 전용(Read, Grep, Glob)으로 제한하고, sonnet 모델로 동작해야 한다.

기존 `/review` 커맨드에는 이 프로젝트(Next.js 16 / TypeScript strict / shadcn/ui / Tailwind v4 / react-hook-form+zod) 맞춤 리뷰 체크리스트가 이미 잘 정리되어 있으므로, 새 서브에이전트는 이 체크리스트를 재사용하여 두 진입점(수동 `/review`, 자동 사후 리뷰) 간 리뷰 기준을 일치시킨다.

## 변경 사항

### 1. `.claude/agents/code-reviewer.md` 신규 생성
Claude Code 서브에이전트 정의 파일 형식(YAML frontmatter + 시스템 프롬프트 본문)을 따른다:

```markdown
---
name: code-reviewer
description: 코드 구현이 완료된 직후 자동으로 호출되어, 방금 작성/수정된 코드를 이 프로젝트(Next.js 16 / TypeScript strict / shadcn/ui / Tailwind v4) 컨벤션 기준으로 검토하는 읽기 전용 리뷰 에이전트. 코드 작성이나 파일 수정이 끝난 시점에 사용한다.
tools: Read, Grep, Glob
model: sonnet
---

(시스템 프롬프트 본문 — 아래 "본문 설계" 참고)
```

- `tools: Read, Grep, Glob` — 읽기 전용 3종만 명시해 쓰기/실행/네트워크 도구 접근을 원천 차단.
- `model: sonnet` — 이 에이전트 호출 시 항상 sonnet 사용(메인 세션 모델과 무관하게 고정).
- `description`은 메인 에이전트가 "언제 이 서브에이전트를 써야 하는지" 판단하는 유일한 근거이므로, "구현 완료 후" 트리거 조건을 명시적으로 문장에 포함시킨다.

### 2. 본문 설계 (시스템 프롬프트)
`.claude/commands/review.md`의 5개 분석 항목·프로젝트 컨텍스트·참고사항을 그대로 이식하되, 커맨드가 아닌 자동 호출 에이전트에 맞게 다음을 조정한다:
- 리뷰 대상: 사용자가 명시한 코드 블록이 아니라 "직전에 구현/수정된 파일들" — 호출부(메인 에이전트)가 프롬프트에 변경된 파일 경로 또는 diff를 넘겨준다고 가정하고, 이를 대상으로 Read/Grep/Glob으로 관련 컨텍스트를 확인 후 분석.
- 출력 형식: 요약 / 가독성·리팩토링 / 잠재적 버그·에러 처리 / 성능·보안 / 개선 제안 5개 섹션 유지. 단, "개선 코드"는 읽기 전용이라 직접 수정 불가하므로 **구체적 수정 diff 제안**으로 대체(적용은 메인 에이전트나 사용자 몫).
- 프로젝트 컨텍스트(Tailwind v4 oklch, shadcn/ui 재사용, react-hook-form+zod, 경로 별칭, TS strict) 절 그대로 포함.
- 근거 없는 지적 금지, 특이사항 없는 항목은 "특이사항 없음"으로 짧게 명시 — 기존 `/review` 원칙 유지.
- 한국어로 응답 (전역 CLAUDE.md 지침).

### 3. 자동 호출 트리거 — `CLAUDE.md`에 지침 추가
서브에이전트 정의만으로는 "구현 완료 후 자동 실행"이 보장되지 않는다 (에이전트 정의는 호출 대상일 뿐, 호출 시점을 스스로 결정하지 않음). 메인 에이전트가 이 규칙을 인지하도록 프로젝트 `CLAUDE.md`에 짧은 절을 추가한다:

```markdown
## 코드 리뷰 자동화

코드 구현(파일 생성/수정)이 끝나면 `code-reviewer` 서브에이전트(Agent 도구, subagent_type: code-reviewer)를 호출해 방금 변경한 파일을 검토한다. 리뷰 결과는 사용자에게 요약해서 보고한다.
```

- 위치: `CLAUDE.md`의 "Workflow Tips" 절 뒤에 새 절로 추가.

## 검증
- `.claude/agents/code-reviewer.md` 파일이 올바른 YAML frontmatter(구분자 `---`, `name`/`description`/`tools`/`model` 필드)를 갖는지 육안 확인.
- 간단한 더미 수정(예: 주석 한 줄 추가) 후 Agent 도구로 `subagent_type: code-reviewer` 호출이 정상적으로 이루어지는지 테스트 — 도구 접근이 Read/Grep/Glob으로 제한되는지, sonnet 모델로 응답하는지 확인.
- `git status`로 신규 파일(`code-reviewer.md`) 및 `CLAUDE.md` 변경 확인 후 커밋은 사용자 요청 시 별도 진행 (커밋은 이 작업 범위에 포함하지 않음).
