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
