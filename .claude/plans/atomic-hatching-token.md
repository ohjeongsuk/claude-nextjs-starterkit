# Context

사용자가 "PostToolUse 훅으로 Edit/Write 후 Prettier+ESLint 자동 실행"을 구현하기 위해 직접 작성한 플랜모드용 프롬프트를 검토해 달라고 요청했습니다. 이번 작업의 목표는 **코드 구현이 아니라, 그 프롬프트를 사실관계에 맞게 보완하는 것**입니다. 조사 결과, 프롬프트의 전반적인 구조(Hook 위치 확인 → 스크립트 설계 → 단계별 Action Plan)는 타당하지만, 이 프로젝트의 실제 상태와 맞지 않는 전제가 하나 있고, Claude Code Hooks의 정확한 스펙을 몰라서 비워둔 부분들이 있습니다.

# 조사로 확인한 사실

1. **이 프로젝트에는 Prettier가 설치되어 있지 않습니다.** `package.json`의 devDependencies에 `eslint`(^9), `eslint-config-next`만 있고 prettier 관련 패키지는 전무합니다. 즉 사용자가 요구사항 2번에서 "없을 경우 처리 방식 고려"라고 적은 시나리오는 가정이 아니라 **지금 당장 마주치는 상황**입니다.
2. **`.claude/settings.local.json`에 이미 hooks 필드가 존재합니다.** `Notification`/`Stop` 이벤트에 `.claude/slack-webhook.ps1`을 호출하는 훅이 구성되어 있어, 새 `PostToolUse` 훅을 추가할 때 그대로 따를 실제 레퍼런스 포맷이 있습니다. 환경은 Windows PowerShell입니다.
3. **Claude Code Hooks 공식 스펙** (claude-code-guide 조사 결과):
   - 이벤트 이름은 `PostToolUse`가 정확합니다.
   - stdin으로 `{ session_id, cwd, hook_event_name, tool_name, tool_input: { file_path, ... } }` 형태의 JSON이 전달됩니다. `tool_input.file_path`가 바로 수정된 파일 경로입니다.
   - matcher는 `"Edit|Write"`(파이프) 문법을 지원합니다 (공식 예제와 동일).
   - exit code 2는 stderr를 Claude에게 블로킹 피드백으로 전달하지만, PostToolUse는 이미 실행 후 시점이라 실질적 블로킹 효과는 없고 exit 0이 표준입니다.
   - hook 실행 시 `cwd`는 stdin으로 전달되며, 상대경로 대신 `${CLAUDE_PROJECT_DIR}` 환경변수로 절대경로를 명시하는 것이 권장됩니다.
   - 설정 위치는 `.claude/settings.json`(팀 공유, git 커밋됨) vs `.claude/settings.local.json`(개인, gitignored) 중 선택 — 이 프로젝트는 기존 Slack 훅을 `settings.local.json`에 넣었으므로 일관성을 고려해야 합니다.

# 원본 프롬프트 대비 보완 제안

**보완 1 — "Prettier 없을 경우"를 조건부 처리가 아니라 명시적 설치 여부 질문으로 전환**
원본은 "고려해달라"고만 되어 있어 모호합니다. 실제로 Prettier가 없으므로, 프롬프트에 "Prettier를 새로 설치할지, ESLint만으로 포맷팅까지 커버할지"를 먼저 결정하도록 명시해야 합니다. (`eslint-config-next`는 자체 포맷 규칙이 약하므로 Prettier 병행이 일반적이지만, 이건 사용자가 선택할 사안입니다.)

**보완 2 — Hook 이벤트/구문을 "확인 요청"이 아니라 이미 조사된 사실로 프롬프트에 명시**
원본 1번 항목은 Claude에게 "제시해달라"고 리서치를 요청하는 형태인데, 이는 이미 답이 나온 사실입니다. 프롬프트에 정확한 스펙(이벤트명 `PostToolUse`, stdin의 `tool_input.file_path`, matcher `"Edit|Write"` 문법)을 미리 박아두면 다음 플랜모드 세션에서 같은 조사를 반복하지 않아도 됩니다.

**보완 3 — 기존 `.claude/settings.local.json`과의 통합 방식 명시**
원본은 "Claude Code 설정 파일 업데이트 계획"이라고만 되어 있어, 새 파일을 만들지 기존 파일에 병합할지가 불명확합니다. 이 프로젝트는 이미 `settings.local.json`에 `hooks.Notification`, `hooks.Stop`이 있으므로, 새 `PostToolUse` 훅은 **같은 파일의 `hooks` 객체에 키를 추가하는 형태**(병합)여야 합니다. 이걸 명시하지 않으면 실행 단계에서 기존 훅을 덮어쓸 위험이 있습니다.

**보완 4 — "스크립트 파일 vs 인라인 명령어" 결정 기준 추가**
원본 Step 2는 "bash 스크립트 또는 json 직렬 명령어" 중 결정하라고만 되어 있는데, 기준이 없습니다. 이 프로젝트는 Windows PowerShell 환경이고 기존 `slack-webhook.ps1`처럼 `.claude/` 아래 `.ps1` 스크립트로 분리하는 관례가 있으므로, 이번에도 **`.claude/format-on-save.ps1` 같은 별도 스크립트 파일**로 분리하는 편이 일관됩니다. 인라인 JSON 명령어는 `jq` 같은 POSIX 도구 의존성이 생겨 Windows PowerShell 환경과 마찰이 있습니다(원본 예시의 `jq -r '.tool_input.file_path' | xargs ...`는 Unix 셸 전제이며, 이 프로젝트의 Bash 도구는 Git Bash라 `jq`가 기본 설치되어 있지 않을 수 있음 — 확인 필요).

**보완 5 — 확장자 필터링 위치 재검토**
원본은 "대상 파일 확장자 구분 처리"를 스크립트 책임으로 두었는데, matcher는 도구 이름만 매칭하고 파일 확장자는 매칭하지 못하므로 이 처리는 스크립트(또는 PowerShell) 내부에서 `file_path`의 확장자를 검사하는 로직이 맞습니다. 원본 방향은 옳으나, "matcher에서 확장자까지 거를 수 있는지"를 헷갈리지 않도록 명확히 못박는 게 좋습니다.

# 보완된 프롬프트 (재사용 가능한 최종본)

```
[목표]
Claude Code의 Hook 기능을 사용하여 Edit 또는 Write 도구 실행 후(PostToolUse) 변경된 파일에 대해
ESLint --fix를 자동 실행하고, Prettier가 설치되어 있다면 함께 --write를 실행하도록 설정한다.

[전제 조건 - 이미 확인된 사실]
- 이 프로젝트(package.json)에는 ESLint(^9, eslint-config-next)만 설치되어 있고 Prettier는 없음.
  → Prettier 설치 여부를 먼저 사용자에게 확인하고, "설치 후 사용" vs "ESLint만 사용" 중 선택받을 것.
- .claude/settings.local.json에 이미 hooks.Notification, hooks.Stop이 구성되어 있음.
  → 새 PostToolUse 훅은 같은 파일의 hooks 객체에 키를 추가하는 "병합" 방식으로 진행하고,
    기존 Notification/Stop 훅을 덮어쓰지 않을 것.
- 환경은 Windows PowerShell. 기존 관례상 훅 로직은 .claude/*.ps1 스크립트로 분리되어 있음
  (예: .claude/slack-webhook.ps1). 이번에도 .claude/format-on-save.ps1로 분리한다.

[Hook 스펙 - 이미 조사된 사실, 재조사 불필요]
- 이벤트 이름: PostToolUse (정확한 명칭)
- matcher 문법: "Edit|Write" (파이프로 다중 도구 매칭, 공식 예제와 동일)
- stdin으로 전달되는 JSON: { session_id, cwd, hook_event_name, tool_name,
  tool_input: { file_path, ... } } → tool_input.file_path가 수정된 파일의 절대경로.
- exit code: PostToolUse는 이미 실행 후 시점이라 블로킹 불가. 정상 종료는 exit 0.
  실패해도 작업을 막지 않고 stderr로 로그만 남기는 방식으로 설계.
- cwd: stdin의 cwd 필드 기준. 상대경로 의존을 피하려면 ${CLAUDE_PROJECT_DIR} 환경변수로
  프로젝트 루트를 명시.

[요구사항]
1. .claude/format-on-save.ps1 작성
   - stdin(JSON)을 PowerShell에서 파싱하여 tool_input.file_path 추출
   - 확장자가 .js/.jsx/.ts/.tsx인 경우에만 처리 (그 외는 조용히 종료, exit 0)
   - Prettier 설치 여부를 devDependencies 또는 node_modules/.bin 존재로 판별 →
     있으면 npx prettier --write "<file>", 없으면 스킵(경고 로그만)
   - npx eslint --fix "<file>" 실행
   - 각 단계 실패 시에도 exit 0으로 종료하고 stderr에 이유만 남길 것
     (PostToolUse가 Claude의 작업 흐름을 막지 않도록)

2. .claude/settings.local.json에 PostToolUse 훅 등록
   - matcher: "Edit|Write"
   - command: powershell -File 방식으로 format-on-save.ps1 호출 (기존 slack-webhook.ps1 호출 패턴과 동일한 형태)
   - 기존 hooks.Notification, hooks.Stop 키는 그대로 유지

3. 구현 단계
   - Step 1: Prettier 설치 여부를 사용자에게 확인 (설치할지 여부 결정)
   - Step 2: format-on-save.ps1 작성 및 단독 실행 테스트 (가짜 JSON을 stdin으로 흘려서 검증)
   - Step 3: settings.local.json에 PostToolUse 훅 병합
   - Step 4: 실제 Edit 도구로 .ts 파일을 하나 수정해보고 훅이 정상 트리거되는지, ESLint 결과가
     반영되는지 확인. eslint.config.mjs(flat config)가 이미 존재하므로 별도 --config 지정 불필요.

[사용자 확정 답변]
- Prettier: 설치 후 포함 (prettier --write + eslint --fix 둘 다 실행)
- 훅 등록 위치: .claude/settings.local.json (기존 Slack 훅과 통일)
```

# 다음 단계

프롬프트 검토와 두 가지 갈림길(Prettier 포함 여부, 설정 파일 위치)에 대한 사용자 결정까지 완료했습니다:
- **Prettier**: 설치 후 `prettier --write` + `eslint --fix` 둘 다 실행
- **설정 파일**: `.claude/settings.local.json`에 기존 Slack 훅(Notification/Stop)과 병합

이 결정을 반영한 위 "보완된 프롬프트"를 그대로 다음 플랜모드 세션에 붙여넣으면, 재조사 없이 바로 Step 1(Prettier 설치)부터 Step 4(실제 동작 테스트)까지 구현 계획을 세울 수 있습니다. 이번 세션에서는 프롬프트 검토 및 의사결정만 수행했고 실제 파일 수정은 하지 않았습니다.
