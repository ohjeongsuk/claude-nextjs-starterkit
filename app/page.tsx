"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { MoreVertical } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "이름은 최소 2글자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  message: z.string().min(10, "메시지는 최소 10글자 이상이어야 합니다"),
})

type FormData = z.infer<typeof formSchema>

function DemoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (data: FormData) => {
    toast.success(`반갑습니다, ${data.name}님! 메시지가 전송되었습니다.`)
    reset()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>폼 + 검증 예제</CardTitle>
        <CardDescription>react-hook-form + zod로 검증되는 폼</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="홍길동"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">메시지</Label>
            <Textarea
              id="message"
              placeholder="여기에 메시지를 입력해주세요"
              {...register("message")}
              className={errors.message ? "border-destructive" : ""}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            제출하기
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>날짜 선택 (Calendar)</CardTitle>
        <CardDescription>react-day-picker 기반 날짜 선택</CardDescription>
      </CardHeader>
      <CardContent>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {date ? format(date, "PPP", { locale: ko }) : "날짜를 선택해주세요"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ko}
            />
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  )
}

function ComponentsShowcase() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-2xl font-bold">컴포넌트 라이브러리</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Dialog */}
          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
              <CardDescription>모달 대화상자</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Dialog 열기</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog 제목</DialogTitle>
                    <DialogDescription>
                      이것은 shadcn/ui의 Dialog 컴포넌트입니다. Radix UI 기반으로
                      작동합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <Button>확인</Button>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Sheet */}
          <Card>
            <CardHeader>
              <CardTitle>Sheet</CardTitle>
              <CardDescription>슬라이드 사이드 패널</CardDescription>
            </CardHeader>
            <CardContent>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Sheet 열기</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet 제목</SheetTitle>
                    <SheetDescription>
                      이것은 shadcn/ui의 Sheet 컴포넌트입니다.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>탭 네비게이션</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tab1">탭 1</TabsTrigger>
                  <TabsTrigger value="tab2">탭 2</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <p className="text-sm text-muted-foreground">첫 번째 탭의 콘텐츠</p>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <p className="text-sm text-muted-foreground">두 번째 탭의 콘텐츠</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Badge</CardTitle>
              <CardDescription>라벨 / 태그</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>기본</Badge>
              <Badge variant="secondary">보조</Badge>
              <Badge variant="destructive">위험</Badge>
              <Badge variant="outline">아웃라인</Badge>
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>프로필 이미지</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>HD</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          {/* Dropdown Menu */}
          <Card>
            <CardHeader>
              <CardTitle>Dropdown Menu</CardTitle>
              <CardDescription>컨텍스트 메뉴</CardDescription>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>편집</DropdownMenuItem>
                  <DropdownMenuItem>복사</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function Home() {
  return (
    <div className="space-y-8 py-8">
      <PageHeader
        title="⚡ StarterKit 데모"
        description="Next.js 16 + TypeScript + TailwindCSS + shadcn/ui로 만든 모던 스타터 킷. 아래는 컴포넌트와 기능들의 실제 동작 예제입니다."
      />

      <Separator />

      <div className="grid gap-8 md:grid-cols-2">
        <DemoForm />
        <DatePickerDemo />
      </div>

      <Separator />

      <ComponentsShowcase />

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">🚀 시작하기</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm">
              <p>
                이 스타터킷은 다음과 같은 특징을 가지고 있습니다:
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>
                  <strong>Next.js 16.2.12</strong> - 최신 App Router 기반
                </li>
                <li>
                  <strong>TypeScript</strong> - 완벽한 타입 안전성
                </li>
                <li>
                  <strong>TailwindCSS v4</strong> - CSS-in-CSS 기반 설정
                </li>
                <li>
                  <strong>shadcn/ui</strong> - 복사 가능한 컴포넌트 라이브러리 (radix-nova 스타일)
                </li>
                <li>
                  <strong>react-hook-form + zod</strong> - 폼 상태 관리 및 검증
                </li>
                <li>
                  <strong>next-themes</strong> - 다크모드 지원
                </li>
                <li>
                  <strong>sonner</strong> - 토스트 알림
                </li>
                <li>
                  <strong>lucide-react</strong> - 아이콘 라이브러리
                </li>
              </ul>
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  바퀴를 재발명하지 마라는 원칙에 따라, 폼 검증/날짜/토스트 등
                  복잡한 기능은 검증된 라이브러리를 직접 채택했습니다.
                  레이아웃과 페이지 구조만 프로젝트 맞춤으로 설계했습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
