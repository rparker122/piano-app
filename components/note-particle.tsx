"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface NoteParticleProps {
  x: number
  color: string
}

export default function NoteParticle({ x, color }: NoteParticleProps) {
  // Memoize random values so they stay consistent during component lifecycle
  const size = useMemo(() => Math.random() * 20 + 10, [])
  const duration = useMemo(() => Math.random() * 1 + 1, [])
  const yOffset = useMemo(() => Math.random() * 100 - 50, [])
  const xOffset = useMemo(() => Math.random() * 100 - 50, [])
  const delay = useMemo(() => Math.random() * 0.2, [])
  const rotation = useMemo(() => Math.random() * 360, [])

  // Array of different shapes (circle, square, triangle, music note)
  const shapes = useMemo(
    () => [
      // Circle
      <motion.div
        key="circle"
        className={`${color} rounded-full opacity-80`}
        style={{ width: size, height: size }}
      />,
      // Square
      <motion.div
        key="square"
        className={`${color} rounded-md opacity-80`}
        style={{ width: size, height: size }}
      />,
      // Triangle using clip-path
      <motion.div
        key="triangle"
        className={`${color} opacity-80`}
        style={{
          width: size,
          height: size,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
      />,
      // Music note character ♪
      <motion.div
        key="note"
        className={`${color} flex items-center justify-center text-white opacity-90 font-bold`}
        style={{ width: size, height: size }}
      >
        ♪
      </motion.div>,
    ],
    [color, size]
  )

  // Pick one random shape, memoized so it doesn't flicker on re-render
  const randomShape = useMemo(() => shapes[Math.floor(Math.random() * shapes.length)], [shapes])

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
