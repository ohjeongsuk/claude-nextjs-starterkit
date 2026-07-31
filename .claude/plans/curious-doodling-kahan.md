# 커밋 계획: /review 커스텀 커맨드 추가

## Context
직전 작업에서 `.claude/commands/review.md`를 새로 작성했다 (제공된 코드를 프로젝트 컨벤션 기준으로 분석하는 `/review` 커스텀 슬래시 커맨드: 요약, 가독성/리팩토링, 버그/에러처리, 성능/보안, 개선코드 5개 항목 + 이 프로젝트의 Tailwind v4/shadcn/zod 컨벤션 반영, 읽기 전용 allowed-tools). 사용자가 이를 커밋하라고 요청했다.

## 변경 내용
`git status` 기준:
- 신규(미추적): `.claude/commands/review.md`
- 미추적 `.claude/plans/curious-doodling-kahan.md`는 플랜 산출물이므로 커밋 대상에서 제외 (기존 관례 유지)

## 실행 계획
`/git:commit` 커맨드 규칙(`.claude/commands/git/commit.md`)을 따른다: 이모지 컨벤셔널 포맷, Claude 서명 미포함, 원자적 커밋.

1. `git add .claude/commands/review.md`
2. 커밋 메시지: `✨ feat: /review 커스텀 커맨드 추가`
3. `git commit` (서명 없이)

## 검증
- `git log -1 --stat`으로 커밋 내용 확인
- `git status`로 작업 트리 확인 (plans 파일만 미추적으로 남아야 정상)
