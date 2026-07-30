import { Separator } from "@/components/ui/separator"
import { Container } from "./container"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-background">
      <Container className="py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold">⚡ StarterKit</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Next.js, TypeScript, TailwindCSS, shadcn/ui로 만든
              <br />
              모던 웹 개발 스타터 킷입니다.
            </p>
          </div>
          <div>
            <h4 className="font-medium">리소스</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  문서
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  예제
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">커뮤니티</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Discussions
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} StarterKit. 모든 권리 보유.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              이용약관
            </a>
            <a href="#" className="hover:text-foreground">
              개인정보
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
