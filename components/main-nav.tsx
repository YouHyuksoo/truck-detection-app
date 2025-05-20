"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Monitor, Settings, Database, FileText, BookOpen, Target, Cpu, BarChart2, Menu, X, Truck } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export default function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/detection",
      label: "객체 탐지",
      icon: Monitor,
      active: pathname === "/detection",
    },
    {
      href: "/settings",
      label: "환경 설정",
      icon: Settings,
      active: pathname === "/settings",
    },
    {
      href: "/training",
      label: "모델 학습",
      icon: Database,
      active: pathname === "/training",
    },
    {
      href: "/logs",
      label: "로그 조회",
      icon: FileText,
      active: pathname === "/logs",
    },
    {
      href: "/data-management",
      label: "데이터 관리",
      icon: BookOpen,
      active: pathname === "/data-management",
    },
    {
      href: "/roi",
      label: "관심영역",
      icon: Target,
      active: pathname === "/roi",
    },
    {
      href: "/plc",
      label: "PLC 설정",
      icon: Cpu,
      active: pathname === "/plc",
    },
    {
      href: "/stats",
      label: "통계",
      icon: BarChart2,
      active: pathname === "/stats",
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 group"
                >
                  <div className="relative">
                    <Truck className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                  <span className="font-bold hidden md:inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    트럭 감지 시스템
                  </span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <nav className="mt-8 flex flex-col gap-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                      route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 group"
          >
            <div className="relative">
              <Truck className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <span className="font-bold hidden md:inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              트럭 감지 시스템
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
