"use client"

import { motion } from "framer-motion"

interface NoteParticleProps {
  x: number
  color: string
}

export default function NoteParticle({ x, color }: NoteParticleProps) {
  // Random values for animation
  const size = Math.random() * 20 + 10
  const duration = Math.random() * 1 + 1
  const yOffset = Math.random() * 100 - 50
  const xOffset = Math.random() * 100 - 50
  const delay = Math.random() * 0.2
  const rotation = Math.random() * 360

  // Random shape (circle, square, triangle, music note)
  const shapes = [
    // Circle
    <motion.div key="circle" className={`${color} rounded-full opacity-80`} style={{ width: size, height: size }} />,
    // Square
    <motion.div key="square" className={`${color} rounded-md opacity-80`} style={{ width: size, height: size }} />,
    // Triangle (using clip-path)
    <motion.div
      key="triangle"
      className={`${color} opacity-80`}
      style={{
        width: size,
        height: size,
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
      }}
    />,
    // Music note (♪)
    <motion.div
      key="note"
      className={`${color} flex items-center justify-center text-white opacity-90 font-bold`}
      style={{ width: size, height: size }}
    >
      ♪
    </motion.div>,
  ]

  const randomShape = shapes[Math.floor(Math.random() * shapes.length)]

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: "100%" }}
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: -300 + yOffset,
        x: xOffset,
        opacity: 0,
        rotate: rotation,
        scale: [1, 1.2, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {randomShape}
    </motion.div>
  )
}

