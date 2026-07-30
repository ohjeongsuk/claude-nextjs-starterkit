import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Container } from "./container"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-block font-bold text-lg">⚡ StarterKit</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                홈
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                문서
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </Container>
      <Separator />
    </header>
  )
}
