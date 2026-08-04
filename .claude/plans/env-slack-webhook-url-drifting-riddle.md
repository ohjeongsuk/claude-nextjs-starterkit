# Slack 웹훅 URL을 .env로 이전

## Context

`.claude/slack-webhook.ps1`은 Claude Code의 `Notification`/`Stop` hook(`.claude/settings.local.json`에 연결됨)에서 호출되어 Slack으로 알림을 보내는 스크립트다. 현재 이 스크립트에는 실제 Slack Incoming Webhook URL이 하드코딩되어 있다.

- `slack-webhook.ps1`은 아직 git에 추적되지 않은 상태(untracked)이며, 사용자는 이 프로젝트를 곧 GitHub에 공개할 계획이다.
- `.env`는 이미 존재하고 동일한 URL을 `SLACK_WEBHOOK_URL`로 담고 있으며, `.gitignore`의 `.env*` 규칙에 의해 커밋 대상에서 제외되어 있다.
- 문제는 `.env`가 아니라 `slack-webhook.ps1`이다 — URL이 스크립트에 그대로 박혀 있으면, `.env`를 아무리 gitignore해도 이 파일이 커밋되는 순간 URL이 깃허브 히스토리에 영구적으로 남는다.

목표: URL이 하드코딩된 곳을 전부 `.env` 참조로 바꾸고, `slack-webhook.ps1`을 안전하게 커밋 가능한 상태로 만든다. `.env` 자체는 계속 무시되며, 다른 사람이 프로젝트를 받았을 때 필요한 환경변수를 알 수 있도록 `.env.example` 템플릿을 추가한다.

## 변경 사항

### 1. `.claude/slack-webhook.ps1` — `.env`에서 URL 읽어오기

PowerShell에는 Node의 `dotenv`에 해당하는 내장 기능이 없으므로, 스크립트 시작부에서 `.env` 파일을 직접 파싱한다. 경로는 스크립트 자신의 위치(`$PSScriptRoot`) 기준 상대 경로로 계산해, 어느 디렉터리에서 호출되든 항상 프로젝트 루트의 `.env`를 찾도록 한다.

```powershell
param(
    [string]$Message = "Claude Code 알림"
)

# .claude/ 상위 = 프로젝트 루트의 .env
$EnvPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $EnvPath) {
    Get-Content $EnvPath | ForEach-Object {
        if ($_ -match '^\s*SLACK_WEBHOOK_URL\s*=\s*(.+)\s*$') {
            $script:WebhookUrl = $Matches[1].Trim()
        }
    }
}

if (-not $WebhookUrl) {
    Write-Error "SLACK_WEBHOOK_URL이 .env에 설정되어 있지 않습니다."
    exit 1
}

$JsonBody = '{"text":"' + $Message + '"}'

try {
    Invoke-WebRequest -Uri $WebhookUrl `
        -Method Post `
        -ContentType "application/json; charset=utf-8" `
        -Body $JsonBody `
        -ErrorAction Stop | Out-Null
    exit 0
} catch {
    exit 1
}
```

- 정규식은 `SLACK_WEBHOOK_URL=` 라인만 매칭하므로 `.env`에 다른 키(`# 주석` 포함)가 추가돼도 안전하다.
- URL을 못 찾으면 명확한 에러 메시지와 함께 종료해, 향후 `.env` 설정 누락을 바로 알아챌 수 있다.

### 2. `.env.example` 신규 생성

GitHub 공유 시 다른 사용자가 어떤 환경변수를 설정해야 하는지 알 수 있도록, 실제 값 없이 키와 설명만 담은 템플릿을 추가한다.

```
# Slack 웹훅 URL for Claude Code 알림
# Slack 앱 설정에서 Incoming Webhooks를 활성화하고 생성된 URL을 여기에 설정하세요
SLACK_WEBHOOK_URL=
```

`.env.example`은 `.gitignore`의 `.env*` 패턴에 걸려 무시되므로, `.gitignore`에 예외 규칙을 추가한다:

```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

### 3. 다른 위치 URL 하드코딩 여부

프로젝트 전체(`node_modules`, `.git` 제외)를 `hooks.slack.com` 문자열로 검색한 결과, `slack-webhook.ps1` 외에 URL이 하드코딩된 파일은 없었다. `.claude/settings.local.json`은 hook 커맨드에서 스크립트 경로만 참조할 뿐 URL을 직접 담고 있지 않으며, 이 파일은 이미 `.gitignore`에 등록되어 있어 손댈 필요가 없다.

## 검증 방법

1. `.env`의 `SLACK_WEBHOOK_URL` 값을 유지한 채, PowerShell에서 직접 스크립트를 실행해 Slack 채널에 테스트 메시지가 도착하는지 확인:
   ```powershell
   powershell -File .claude\slack-webhook.ps1 -Message "테스트 메시지"
   ```
2. `.env`를 임시로 이름 변경(`.env.bak`)한 뒤 스크립트를 실행해, `SLACK_WEBHOOK_URL이 .env에 설정되어 있지 않습니다` 에러와 함께 정상 종료(exit 1)되는지 확인 후 원상복구.
3. `git status`로 `.env`가 추적되지 않고 `.env.example`은 추적 대상으로 잡히는지 확인.
4. `git diff --stat`으로 `slack-webhook.ps1`에 실제 URL 문자열이 더 이상 없는지 육안 확인 (`hooks.slack.com` 재검색).
