# 헤더에 로그인 버튼 추가 계획

## Context

메인페이지(전역 헤더 `SiteHeader`)에서 `/login` 페이지로 이동할 수 있는 버튼이 없어, 사용자가 로그인 페이지에 접근할 방법이 URL 직접 입력뿐이었다. 요청에 따라 헤더의 `ThemeToggle`(다크모드 버튼) 바로 왼쪽에 "로그인" 버튼을 추가한다. shadcn MCP 서버를 통해 프로젝트의 기존 버튼 사용 패턴을 재확인했다.

## 현재 구조 확인

`components/layout/site-header.tsx:6-36`:
```tsx
<header className="sticky top-0 z-50 ...">
  <Container>
    <div className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/">⚡ StarterKit</Link>
        <nav className="hidden gap-6 md:flex">홈 / 문서</nav>
      </div>
      <ThemeToggle />
    </div>
  </Container>
  <Separator />
</header>
```
헤더는 `justify-between`으로 좌측 그룹(로고+nav)과 우측(`ThemeToggle`) 두 블록으로 나뉘어 있다. "다크모드 버튼의 왼쪽"은 곧 우측 그룹 안에서 `ThemeToggle` 앞자리를 의미한다.

## 구현 내용

### `components/layout/site-header.tsx` 수정

1. `next/link`의 `Link`와 `@/components/ui/button`의 `Button`을 새로 import.
2. `<ThemeToggle />` 앞에 로그인 버튼을 추가하고, 두 요소를 감싸는 `<div className="flex items-center gap-2">`로 그룹화 (헤더 전체 `justify-between` 구조는 유지):

```tsx
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" asChild>
    <Link href="/login">로그인</Link>
  </Button>
  <ThemeToggle />
</div>
```

**버튼 스타일 결정 근거:**
- `variant="outline"`: `app/page.tsx`의 Dialog/Sheet 트리거(`<Button>...열기</Button>`)는 기본(`default`) variant를 쓰지만, 날짜 선택 버튼(`DatePickerDemo`)은 `variant="outline"`을 사용 중이다. 헤더는 항상 눈에 띄는 상단 영역이라 `default`(꽉 찬 배경)보다 `outline`이 헤더의 미니멀한 톤(로고 텍스트, ghost 아이콘 버튼)과 더 잘 어울린다. shadcn MCP의 `button-demo` 예제도 `outline`을 기본값으로 보여준다.
- `size="sm"`: 헤더 높이가 `h-16`이고 `ThemeToggle`이 `size="icon"`(아이콘 전용, 작은 크기)이므로, 버튼도 `sm`으로 맞춰야 시각적 균형이 맞는다. 기본 `size="default"`는 헤더 안에서 상대적으로 크고 둔해 보인다.
- `asChild` + `Link`: shadcn 버튼의 표준 네비게이션 패턴이다 (Radix `Slot` 기반으로 `Button`의 스타일을 `Link`에 그대로 위임). `site-header.tsx`의 다른 `Link`들(로고, 홈, 문서)은 네이티브 `<Link>` 텍스트라 스타일이 다르지만, 버튼 모양이 필요하므로 `asChild` 패턴이 맞다.

### 반응형/접근성 확인
- `ThemeToggle`은 아이콘 전용이라 모든 화면 크기에서 보이고, `nav`(홈/문서 링크)는 `hidden md:flex`로 모바일에서 숨겨진다. 로그인 버튼은 로그인 기능 접근성이 중요하므로 `nav`와 달리 모바일에서도 항상 노출한다(숨김 처리 없음). 텍스트가 "로그인" 두 글자로 짧아 좁은 화면에서도 레이아웃 깨짐 없음.
- 다크모드는 `Button`이 기존 shadcn 테마 토큰을 사용하므로 별도 처리 불필요 (`outline` variant는 `.dark`에서 자동 대응).

## 검증 방법

1. `npm run dev` 후 `http://localhost:3000/` 접속
2. Playwright MCP로 확인:
   - 데스크톱: 헤더 우측에 "로그인" 버튼이 다크모드 토글 왼쪽에 위치하는지, 클릭 시 `/login`으로 정상 이동하는지
   - 모바일(375px): 버튼이 헤더 안에서 잘리거나 줄바꿈되지 않는지
   - 다크모드 토글 후 버튼 색상이 정상 전환되는지
3. `npm run lint` 실행하여 통과 확인
