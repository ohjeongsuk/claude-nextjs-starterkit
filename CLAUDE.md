# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 Critical: Next.js 16 Breaking Changes

**Before writing any code, read the relevant guide in `node_modules/next/dist/docs/01-app/` first.** This project uses Next.js 16.2.12, which has significant breaking changes from earlier versions:

- **`use cache` directive & Cache Components**: New caching architecture for server components (docs: `01-getting-started/08-caching.md`, `01-api-reference/01-directives/use-cache.md`)
- **Adapters API**: New way to configure deployment/runtime integration (`03-api-reference/07-adapters/`)
- **Turbopack**: Build system changes and config options (`turbopackFileSystemCache`, `typedRoutes`, etc.)

Always check deprecation notices and confirm APIs exist in Next.js 16 before implementing.

## Commands

**Development & Build:**
- `npm run dev` — Start dev server (Turbopack, http://localhost:3000)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint on all files
- `npx eslint <file>` — Lint a single file

**No test runner is installed.** The project uses ESLint only (no vitest/jest/Playwright test framework). Playwright MCP (configured in `.mcp.json`) is available for browser automation tasks, not unit testing.

## Architecture

### Layout Hierarchy (`app/layout.tsx` → Components)

The root layout is a **server component** that composes the page structure:

```
app/layout.tsx (server, imports Geist fonts & metadata)
  ↓
ThemeProvider (client, next-themes wrapper - "use client")
  ↓
SiteHeader (components/layout/site-header.tsx)
Container (components/layout/container.tsx - max-width wrapper)
  {children} (app/page.tsx - also "use client")
SiteFooter (components/layout/site-footer.tsx)
Toaster (sonner notifications)
```

Key patterns:
- **Geist fonts**: Loaded via `next/font/google`, variables injected as CSS classes into `<html>`
- **Dark mode**: `next-themes` provider (client-side), stores preference in localStorage, applies to `.dark` class
- **Responsive layout**: `Container` component uses Tailwind's responsive padding (`px-4 sm:px-6 lg:px-8`)

### Page Component (`app/page.tsx`)

Entire page is a **client component** (`"use client"`). It renders:
- Demo form with react-hook-form + zod validation
- Calendar component (react-day-picker + Popover)
- Component showcase: Dialog, Sheet, Tabs, Badge, Avatar, DropdownMenu

This is intentional—the starter kit's purpose is to demonstrate interactive patterns. For data-fetching or server-side logic, create new route segments under `app/` (e.g., `app/api/` for API routes, or nested folders like `app/about/page.tsx` for additional pages).

### shadcn/ui Component Library

shadcn/ui components are **generated and stored locally** in `components/ui/`. They are referenced via `components.json` aliases:

- **Alias config** (`components.json`):
  - `@/components` → `./components`
  - `@/components/ui` → `./components/ui`
  - `@/lib/utils` → `./lib/utils` (contains `cn()` function)
  - `style: "radix-nova"` — Non-standard shadcn style (not the traditional "new-york" or "default")

- **When to update components**: Run `npx shadcn@latest add <component-name>` to regenerate. It will update files in `components/ui/` and install any new dependencies to `package.json`.

- **Utility function** (`lib/utils.ts`): `cn()` combines clsx + tailwind-merge for conditional class handling.

### Styling: Tailwind v4 CSS-First

**There is no `tailwind.config.ts`.**  All configuration is in `app/globals.css` using the new CSS-first syntax:

1. **Imports**:
   ```css
   @import "tailwindcss";           /* Tailwind core */
   @import "tw-animate-css";         /* Animation utilities */
   @import "shadcn/tailwind.css";    /* shadcn base styles */
   ```

2. **Custom variant** (for dark mode):
   ```css
   @custom-variant dark (&:is(.dark *));
   ```

3. **Theme definition** (inline):
   ```css
   @theme inline {
     --color-primary: var(--primary);
     /* Maps Tailwind color names to CSS variables */
   }
   ```

4. **CSS Variables** (`:root` and `.dark`):
   - Colors defined in **oklch** color space (e.g., `oklch(0.205 0 0)`)
   - Covers: primary, secondary, destructive, muted, accent, border, background, foreground, card, popover, sidebar, chart colors, plus radius tokens
   - Dark mode overrides in `.dark` selector

**Why oklch?** Modern color space for better perceptual uniformity in dark/light themes. If converting colors, use an oklch converter (not hex/rgb).

### Component Aliases & Directory Structure

```
components/
├── ui/                    # shadcn/ui generated components
│   ├── button.tsx, card.tsx, dialog.tsx, sheet.tsx, etc.
├── layout/
│   ├── site-header.tsx   # Header with ThemeToggle
│   ├── site-footer.tsx   # Footer
│   ├── container.tsx     # Max-width wrapper
│   └── page-header.tsx   # Page title/description wrapper (used in app/page.tsx)
├── theme-provider.tsx    # "use client", next-themes wrapper
└── theme-toggle.tsx      # Dark mode toggle button

lib/
└── utils.ts              # Exports cn() utility

app/
├── layout.tsx            # Root layout (server component)
├── page.tsx              # Home page (client component, demo)
└── globals.css           # Tailwind v4 + theme config
```

**Note:** `hooks/` directory is aliased in `components.json` but does not yet exist. Create it as needed for custom React hooks.

### Form Handling

The demo form in `app/page.tsx` uses:

1. **react-hook-form**: State management (`useForm`, `register`, `handleSubmit`, `formState`)
2. **zod**: Schema validation (`z.object`, `z.string`, etc.)
3. **@hookform/resolvers**: Connects zod to react-hook-form via `zodResolver`
4. **sonner**: Toast notifications (`toast.success()`)

For new forms, follow the same pattern—define a Zod schema, pass `zodResolver(schema)` to `useForm`, and render controlled inputs via `register()`.

### Key Dependencies

- **Next.js 16.2.12**: Turbopack, App Router, built-in optimizations
- **React 19.2.4**: Latest stable React with Server Components support
- **TypeScript (strict)**: All files checked in strict mode
- **Tailwind CSS v4**: CSS-first configuration, no config file needed
- **shadcn/ui**: Radix-based component library
- **react-hook-form + zod**: Form state + validation
- **next-themes**: Dark mode with system preference detection
- **sonner**: Toast notifications
- **lucide-react**: Icon library
- **date-fns**: Date utility library
- **react-day-picker**: Headless calendar component

## Performance & Caching

With Next.js 16, default caching behavior has changed:

- Static Generation is the default (pages prerendered at build time)
- Dynamic content requires explicit `"use server"` or runtime opt-in
- Use `unstable_cache()`, `cacheLife()`, or the new `"use cache"` directive for fine-grained control

Check `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` before adding data fetching.

## Workflow Tips

1. **Add a new page**: Create `app/<route-name>/page.tsx`
2. **Add a new shadcn component**: `npx shadcn@latest add <component-name>`
3. **Create a server component**: Use the default (no `"use client"` directive)
4. **Create an interactive component**: Add `"use client"` at the top
5. **Debug styling issues**: Check `app/globals.css` and the oklch color values in `:root`/`.dark`
6. **Check TypeScript errors**: `npm run lint` and VS Code's TypeScript extension (configured via `.vscode/settings.json`)

## Code Review Automation

This project has two code review workflows, each for different use cases:

### Automatic Review (Post-Implementation)
After file creation or modification is complete, invoke the `code-reviewer` subagent (via `Agent` tool with `subagent_type: code-reviewer`) to review the changes. This automatically analyzes code quality against this project's conventions (Next.js 16, TypeScript strict, shadcn/ui, Tailwind v4) and reports findings to the user. See `.claude/agents/code-reviewer.md` for review criteria (5-item analysis rubric, project-specific guidelines).

### Manual Review (/review Command)
When you want to review a specific code snippet or file on demand, use the `/review` command (defined in `.claude/commands/review.md`). This allows you to paste code or reference a file path for immediate feedback without waiting for post-implementation automation. Same review criteria as automatic review.

---

**Last Updated**: 2026-07-31  
**Project Type**: Next.js 16 Starter Kit + shadcn/ui Demo
