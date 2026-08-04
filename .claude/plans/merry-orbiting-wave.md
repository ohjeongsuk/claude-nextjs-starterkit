# Slack 모바일 알림 훅 설정 계획

## Context

사용자는 Claude Code가 (1) 권한 요청을 할 때, (2) 작업을 완료했을 때 슬랙 모바일 앱으로 푸시 알림을 받고 싶어합니다. Claude Code 세션이 터미널에서 조용히 대기 중일 때(권한 승인 대기) 또는 긴 작업이 끝났을 때 즉시 인지할 수 있도록 하는 것이 목적입니다.

Claude Code Hooks 시스템은 이런 라이프사이클 이벤트에 반응해 임의의 셸 명령을 실행할 수 있게 해줍니다:
- **`Notification` 훅**: 권한 승인 대기, 유휴 상태 등 사용자 주의가 필요할 때 발생. stdin으로 `{ "message": "...", "title": "..." }` 형태의 JSON 전달.
- **`Stop` 훅**: Claude가 응답(턴)을 마쳤을 때 발생.

두 이벤트 모두 커맨드 훅에서 Slack Incoming Webhook에 POST 요청을 보내면 모바일 Slack 앱으로 푸시 알림이 전달됩니다 (Slack 알림 설정이 켜져 있다는 전제).

환경이 Windows(PowerShell)이므로, 훅 명령은 `curl.exe` 또는 PowerShell `Invoke-RestMethod`를 사용합니다. Claude Code의 커맨드 훅은 기본적으로 셸(POSIX 계열)에서 실행되지만 Windows에서는 Git Bash가 없을 경우 PowerShell로 실행되므로, 이식성을 위해 `curl.exe`를 직접 호출하는 방식을 사용합니다 (Windows 10/11에는 curl.exe가 기본 내장되어 있음).

## 설정 대상 파일

`.claude/settings.local.json` (프로젝트 로컬, git에 커밋되지 않음 — 이미 `.gitignore`에 등록 확인됨)

기존 내용(permissions, enabledMcpjsonServers 등)은 보존하고 `hooks` 키만 추가합니다.

## 구현 내용

### 1. Notification 훅 (권한 요청 시)

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "jq -r '.message // \"Claude Code에서 알림이 도착했습니다\"' | { read -r msg; curl.exe -s -X POST -H \"Content-Type: application/json\" -d \"{\\\"text\\\":\\\"🔔 *Claude Code 알림*\\n$msg\\\"}\" \"<WEBHOOK_URL>\"; } 2>$null || exit 0",
      "timeout": 10
    }
  ]
}
```

- stdin JSON에서 `message` 필드를 jq로 추출해 Slack 메시지 본문에 포함
- 실패해도 Claude 작업을 막지 않도록 항상 exit 0

### 2. Stop 훅 (작업 완료 시)

```json
{
  "hooks": [
    {
      "type": "command",
      "command": "curl.exe -s -X POST -H \"Content-Type: application/json\" -d \"{\\\"text\\\":\\\"✅ *Claude Code 작업 완료*\\n프로젝트: claude-nextjs-starterkit\\\"}\" \"<WEBHOOK_URL>\" 2>$null || exit 0",
      "timeout": 10
    }
  ]
}
```

- Stop 이벤트는 별도 payload가 필요 없으므로 고정 메시지 전송
- 무한 루프 방지: Stop 훅 자체는 Claude를 재호출하지 않는 단순 알림이므로 안전

### `<WEBHOOK_URL>` 값

사용자가 아직 실제 URL을 제공하지 않았으므로, 우선 `<SLACK_WEBHOOK_URL>` 플레이스홀더 문자열로 두 훅을 구성합니다. 파일 상단(또는 훅 옆)에 짧은 안내를 남겨, 이 문자열을 실제 `https://hooks.slack.com/services/...` 값으로 교체해야 훅이 동작함을 알립니다. 사용자가 실제 URL을 알려주면 즉시 치환합니다.

## 검증 절차

1. `jq -e '.hooks.Notification[0].hooks[0].command' .claude/settings.local.json` 및 `Stop` 버전으로 JSON 문법/스키마 확인 (exit 0 + 명령어 출력되면 정상)
2. 플레이스홀더 상태에서는 실제 Slack 전송 대신 curl 명령 자체가 올바르게 구성되는지(문자열 이스케이프, JSON payload 형태)만 dry-run으로 확인
3. **사용자가 실제 Webhook URL을 알려준 뒤**: Notification 훅 파이프 테스트 `echo '{"message":"테스트 알림입니다"}' | <command>` 실행 → 실제 Slack 채널에 메시지 도착 확인 요청
4. **사용자가 실제 Webhook URL을 알려준 뒤**: Stop 훅 파이프 테스트 `echo '{}' | <command>` 실행 → 실제 Slack 채널에 메시지 도착 확인 요청
5. 훅 설정이 새로 생성되는 파일이 아니라 기존 파일 수정이므로 워처 재시작이 필요할 수 있음 — `/hooks` 메뉴 확인을 안내

## 주의사항

- Webhook URL이 평문으로 파일에 남으므로, 파일이 실수로 커밋/공유되지 않도록 `.gitignore` 등록 상태를 재확인함 (이미 등록됨 확인 완료)
- 모바일에서 푸시를 받으려면 Slack 앱 알림 설정에서 해당 채널 알림이 켜져 있어야 함 — 이는 Claude Code 밖의 사용자 조치이므로 안내만 제공
- **현재 `<SLACK_WEBHOOK_URL>`은 플레이스홀더입니다.** 실제 URL로 교체하기 전까지 두 훅 모두 curl이 잘못된 주소로 요청을 보내 실패(무해하게 조용히 실패)합니다. 사용자가 실제 URL을 제공하는 즉시 치환 작업을 진행합니다.
