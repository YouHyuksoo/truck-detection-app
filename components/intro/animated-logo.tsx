"use client"

import { motion } from "framer-motion"

export default function AnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative w-32 h-32"
    >
      {/* 외부 원 */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute inset-0 rounded-full border-4 border-blue-500/30"
      />

      {/* 중간 원 */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 0.75 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full border-4 border-purple-500/40"
      />

      {/* 내부 원 */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 0.5 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute inset-0 m-auto w-1/2 h-1/2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
      />

      {/* 무한대 기호 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold"
      >
        ∞
      </motion.div>

      {/* 숫자 21 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute bottom-2 right-2 text-white text-sm font-bold"
      >
        21
      </motion.div>

      {/* 회전하는 점들 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-blue-400"
          style={{
            top: "50%",
            left: "50%",
            margin: "-4px 0 0 -4px",
          }}
          animate={{
            x: Math.cos(i * (Math.PI / 4)) * 60,
            y: Math.sin(i * (Math.PI / 4)) * 60,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: i * 0.1,
          }}
        />
      ))}
    </motion.div>
  )
}
