"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, Truck, Eye, BarChart2, Cog, Database } from "lucide-react"

export default function IntroScreen() {
  const router = useRouter()
  const [showEnterButton, setShowEnterButton] = useState(false)

  // 5초 후에 Enter 버튼 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEnterButton(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-500/10"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.1, 0.05],
                scale: [0, 1, 0.8],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* 회사 로고 및 이름 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-medium text-blue-400">JiSung Solution Consulting</h2>
        </motion.div>

        {/* 시스템 로고 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
            <Eye className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* 시스템 이름 */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 mb-2"
        >
          Infinity21
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-3xl md:text-4xl font-semibold text-white mb-4"
        >
          Vision Solution
        </motion.h2>

        {/* 버전 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="mb-8"
        >
          <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-full">Version 1.0</span>
        </motion.div>

        {/* 시스템 특징 아이콘 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3 }}
          className="flex flex-wrap justify-center gap-8 mb-12"
        >
          {[
            { icon: <Truck className="w-6 h-6" />, label: "트럭 감지" },
            { icon: <Eye className="w-6 h-6" />, label: "OCR 인식" },
            { icon: <BarChart2 className="w-6 h-6" />, label: "데이터 분석" },
            { icon: <Database className="w-6 h-6" />, label: "데이터 관리" },
            { icon: <Cog className="w-6 h-6" />, label: "시스템 설정" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 3 + index * 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 text-blue-400 mb-2">
                {item.icon}
              </div>
              <span className="text-sm text-slate-300">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* 시스템 설명 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 4 }}
          className="max-w-2xl text-slate-300 mb-8"
        >
          최첨단 AI 기반 트럭 감지 및 OCR 솔루션으로 물류 및 운송 관리를 혁신합니다. 실시간 모니터링, 데이터 분석,
          그리고 직관적인 관리 도구를 통해 업무 효율성을 극대화하세요.
        </motion.p>

        {/* 입장 버튼 */}
        {showEnterButton && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button
              onClick={() => router.push("/detection")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-lg text-lg font-medium"
            >
              시스템 입장하기 <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* 하단 정보 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 4.5 }}
        className="absolute bottom-4 text-center text-slate-500 text-sm"
      >
        © 2025 JiSung Solution Consulting. All rights reserved.
      </motion.div>
    </div>
  )
}
