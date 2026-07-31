# 컨텍스트

사용자는 Next.js(App Router) + TypeScript + TailwindCSS + shadcn/ui + lucide-react 조합의 범용 웹 개발 스타터킷을 요청했다. 기술 스택 설치는 이미 완료된 상태.

**중요 발견**: AGENTS.md의 경고("이것은 당신이 아는 Next.js가 아니다")는 사실이었다. 실제 설치된 버전은 Next.js **16.2.12**(사용자가 언급한 15가 아님), React 19.2.4, Tailwind v4(CSS 기반 설정, `tailwind.config` 파일 없음), shadcn CLI v4.16.0(`components.json`의 `style: "radix-nova"`), radix-ui 통합 패키지 v1.6.7, lucide-react v1.28.0. 이 버전들은 각 생태계의 통상적인 버전대보다 높아 API 패턴이 다르므로, 코드는 반드시 실제 문서(`node_modules/next/dist/docs/`)와 이미 설치된 `components/ui/button.tsx`의 실제 패턴을 따른다.

사용자의 1차 피드백(수정 요청) 반영:
1. **범용 웹앱에 필요한 컴포넌트/레이아웃을 먼저 체계적으로 정리**한다.
2. 이 컴포넌트들을 **계층(layer)** 으로 분류한다 — 무작정 나열하지 않고 역할 기반 구조로 구성.
3. shadcn/ui 컴포넌트를 활용해 **레이아웃까지 실제로 구현**한다 (설명에 그치지 않음).
4. **"바퀴를 재발명하지 마라"** — 폼, 날짜, 토스트 등 기능 추가 시 검증되고 널리 쓰이는 라이브러리를 직접 구현 대신 채택한다.

직전 조사에서 확정한 라이브러리 채택 여부:

| 영역 | 결론 | 패키지 |
|---|---|---|
| 폼 상태+검증 | 채택 | `react-hook-form`, `zod`, `@hookform/resolvers` |
| 날짜 선택 | 채택 | (shadcn `calendar`가 의존) `react-day-picker`, `date-fns` |
| 토스트 알림 | 채택 (구 useToast는 deprecated) | `sonner` |
| 다크모드 상태 | 채택 | `next-themes` |
| 애니메이션 | 기존 `tw-animate-css`로 충분 | 추가 설치 안 함 |
| 복잡 데이터 테이블(`@tanstack/react-table`) | 범위 제외 | 스타터킷 기본에는 과함, 필요 시 사용자가 추가 |
| 전역 클라이언트 상태(zustand 등) | 범위 제외 | 앱마다 요구가 달라 미리 넣지 않음 |

# 컴포넌트/레이아웃 계층 구조

바퀴를 재발명하지 않기 위해, 각 계층에서 "직접 만드는 것"과 "라이브러리에 위임하는 것"을 명확히 구분한다.

```
Layer 0: Foundation (스타일/토큰) — 이미 완료
  └─ globals.css의 oklch 색상 변수, @theme, tw-animate-css
  └─ lib/utils.ts의 cn()

Layer 1: Primitives (shadcn/ui, radix-ui 위임)
  └─ 이미 있음: Button
  └─ 신규: Card, Input, Label, Textarea, Separator, Avatar,
           Dropdown Menu, Dialog, Sheet, Tabs, Badge, Skeleton,
           Popover, Calendar, Sonner(Toaster)
  └─ 원칙: 전부 `npx shadcn add`로 설치, 직접 작성 안 함

Layer 2: Composite Patterns (shadcn 프리미티브 + 검증된 라이브러리 조합)
  └─ Form 컴포넌트군 (Form/FormField/FormItem 등)
     → react-hook-form + zod 위임, shadcn add form으로 wrapper만 생성
  └─ Date Picker (Calendar + Popover 조합)
     → react-day-picker 위임
  └─ ThemeProvider (next-themes 래핑)
     → next-themes 위임, 얇은 클라이언트 컴포넌트 래퍼만 직접 작성

Layer 3: Layout Components (직접 작성 — 여기가 프로젝트 고유 영역)
  └─ SiteHeader (nav + ThemeToggle)
  └─ SiteFooter
  └─ Container (max-width + padding 래퍼, 반복 사용되는 유일한 "직접 구현" 레이아웃 프리미티브)
  └─ PageHeader (타이틀 + 설명 + actions 슬롯 — 페이지 상단 공통 패턴)

Layer 4: Application Shell (Next.js App Router 규약)
  └─ app/layout.tsx: RootLayout — ThemeProvider + SiteHeader + Container + SiteFooter + Toaster 조립
  └─ app/page.tsx: 위 컴포넌트들을 실제로 사용하는 데모 페이지 (폼 + 데이트피커 + 카드 + 아바타 + 드롭다운 + 토스트를 한 화면에서 검증)
```

**핵심 원칙**: Layer 1~2는 100% shadcn CLI + 검증된 라이브러리에 위임(직접 스타일링/로직 작성 최소화). Layer 3(레이아웃)만 이 프로젝트에서 직접 설계하는 영역이며, 여기서도 `Container`/`PageHeader` 같은 재사용 가능한 최소 프리미티브로 관리해 향후 페이지 추가 시 반복 작업을 줄인다.

# 실행 계획

## 1. 패키지 설치
```
npm install next-themes react-hook-form zod @hookform/resolvers
npx shadcn add card input label textarea separator avatar dropdown-menu dialog sheet tabs badge skeleton popover calendar form sonner
```
(react-day-picker, date-fns는 `calendar` add 시 shadcn이 자동으로 의존성 설치하는지 확인, 누락 시 수동 설치)

## 2. Layer 2 — Composite 래퍼
- `components/theme-provider.tsx`: `"use client"` + next-themes `ThemeProvider` 얇은 래퍼.
- `app/layout.tsx`: `<html suppressHydrationWarning>` + `ThemeProvider(attribute="class", defaultTheme="system", enableSystem)` + `<Toaster />`(sonner, `components/ui/sonner.tsx`는 CLI가 생성).

## 3. Layer 3 — 레이아웃 컴포넌트 (직접 작성)
- `components/layout/site-header.tsx`: sticky 헤더, 로고/타이틀, 우측 `ThemeToggle`, 하단 `Separator`.
- `components/layout/site-footer.tsx`: 최소 저작권/링크 영역.
- `components/layout/container.tsx`: `max-w-*` + 반응형 padding 래퍼 — 모든 페이지 콘텐츠가 공통으로 쓰는 유일한 자체 프리미티브.
- `components/layout/page-header.tsx`: 페이지 타이틀 + 설명 + 우측 액션 버튼 슬롯 (새 페이지 만들 때 반복되는 상단 패턴을 표준화).
- `components/theme-toggle.tsx`: `useTheme()` + lucide `Sun`/`Moon` + shadcn `DropdownMenu`로 Light/Dark/System 선택.

## 4. Layer 4 — 조립 및 데모
- `app/layout.tsx`: `RootLayout`에서 `ThemeProvider` → `SiteHeader` → `<Container>{children}</Container>` → `SiteFooter` 순서로 조립. metadata를 스타터킷에 맞게 교체.
- `app/page.tsx`: create-next-app 기본 템플릿 제거 후, `PageHeader` + 아래 요소로 구성된 데모 페이지:
  - `Card` 안에 `react-hook-form` + `zod` 스키마로 검증되는 샘플 폼(`Input`, `Label`, `Calendar` 기반 날짜 필드, 제출 시 `sonner`의 `toast.success(...)` 호출)
  - `Avatar` + `DropdownMenu`를 쓰는 사용자 메뉴 예시
  - `Dialog`, `Sheet`, `Tabs`, `Badge` 각각을 한 번씩 보여주는 섹션
  - 이 페이지 자체가 "모든 Layer 1/2 컴포넌트가 실제로 동작함"을 검증하는 실행 가능한 문서 역할을 겸함.

# 건드리지 않는 것
- `next.config.ts`의 `cacheComponents` 등 캐싱 실험 플래그.
- `middleware`/`proxy.ts`, API routes, 인증.
- `@tanstack/react-table`, 전역 상태 관리 라이브러리 — 필요 시 사용자가 개별 도입.
- Prettier 설정.

# 검증
1. `npm run dev` 후 브라우저 확인:
   - 헤더/푸터/Container가 모든 페이지에 일관 적용되는지
   - 다크모드 토글이 즉시 반영되고 새로고침 후에도 유지되는지
   - 데모 폼: zod 검증 에러 메시지가 표시되는지, 제출 시 sonner 토스트가 뜨는지
   - Calendar/Date Picker, Dialog, Sheet, Tabs, Dropdown Menu, Avatar가 모두 정상 인터랙션되는지
2. `npm run build` — 타입/빌드 에러 없는지.
3. `npm run lint` — ESLint 통과 확인.
