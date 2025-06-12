"use client"

import { useEffect, useRef } from "react"

interface BackgroundAnimationProps {
  isPlaying: boolean
}

export default function BackgroundAnimation({ isPlaying }: BackgroundAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<
    Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number
      rotation: number
    }>
  >([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Resize canvas to fill window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Generate a random color from a set of transparent hues
    const getRandomColor = () => {
      const colors = [
        "rgba(255, 0, 255, 0.3)",  // Magenta
        "rgba(0, 255, 255, 0.3)",  // Cyan
        "rgba(255, 0, 128, 0.3)",  // Pink
        "rgba(128, 0, 255, 0.3)",  // Purple
        "rgba(0, 128, 255, 0.3)",  // Blue
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // Initialize particles with random positions and speeds
    const createParticles = () => {
      particlesRef.current = []
      const particleCount = Math.min(Math.floor(window.innerWidth / 20), 50) // cap at 50

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: getRandomColor(),
          opacity: Math.random() * 0.3 + 0.1,
          rotation: Math.random() * 360,
        })
      }
    }
    createParticles()

    // Main animation loop
    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Move particles
        particle.x += particle.speedX * (isPlaying ? 1.5 : 0.5)
        particle.y += particle.speedY * (isPlaying ? 1.5 : 0.5)

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity * (isPlaying ? 1.2 : 0.8)
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)

        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        ctx.restore()

        // Rotate particle slowly
        particle.rotation += 0.1 * (isPlaying ? 1.5 : 0.5)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

