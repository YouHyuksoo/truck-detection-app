"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import ParticlesBackground from "./particles-background"
import AnimatedLogo from "./animated-logo"

export default function EnhancedIntroScreen() {
  const router = useRouter()
  const [showEnterButton, setShowEnterButton] = useState(false)

  // 5초 후에 Enter 버튼 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEnterButton(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // 시스템 특징 아이템
  const features = [
    { title: "실시간 감지", description: "고성능 AI 기반 트럭 및 컨테이너 실시간 감지" },
    { title: "OCR 인식", description: "컨테이너 번호 및 차량 번호판 자동 인식" },
    { title: "데이터 분석", description: "고급 통계 및 분석 대시보드" },
    { title: "PLC 연동", description: "산업용 장비 및 시스템과의 원활한 통합" },
  ]

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* 파티클 배경 */}
      <ParticlesBackground />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
        {/* 회사 로고 및 이름 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-medium text-blue-400">JiSung Solution Consulting</h2>
        </motion.div>

        {/* 애니메이션 로고 */}
        <AnimatedLogo />

        {/* 시스템 이름 */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 mt-8 mb-2"
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
          className="mb-12"
        >
          <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-full">Version 1.0</span>
        </motion.div>

        {/* 시스템 특징 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 3 + index * 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 text-left"
            >
              <h3 className="text-xl font-semibold text-blue-400 mb-2">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 입장 버튼 */}
        {showEnterButton && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button
              onClick={() => router.push("/detection")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-lg text-lg font-medium shadow-lg shadow-blue-500/20"
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
