"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Note {
  note: string
  duration: number
}

interface Song {
  id: string
  title: string
  notes: Note[]
}

interface SheetMusicProps {
  song: Song | undefined
  currentNoteIndex: number
  isPlaying: boolean
}

export default function SheetMusic({ song, currentNoteIndex, isPlaying }: SheetMusicProps) {
  if (!song) return null

  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-2">{song.title}</h3>

      <div className="flex flex-wrap gap-2 items-center">
        {song.notes.map((note, index) => {
          const isPast = index < currentNoteIndex
          const isCurrent = index === currentNoteIndex
          const isFuture = index > currentNoteIndex

          return (
            <motion.div
              key={`${note.note}-${index}`}
              className={cn(
                "px-3 py-2 rounded-md text-center min-w-[50px] relative",
                isPast
                  ? "bg-gray-700 text-gray-400"
                  : isCurrent
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                    : "bg-gray-700 text-white",
              )}
              animate={
                isCurrent && isPlaying
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { repeat: Number.POSITIVE_INFINITY, duration: 0.5 },
                    }
                  : {}
              }
            >
              <div className="font-bold">{note.note}</div>
              <div className="text-xs opacity-70">
                {note.duration === 0.5 ? "½" : note.duration === 0.25 ? "¼" : note.duration === 2 ? "2" : "1"}
              </div>

              {/* Current note indicator */}
              {isCurrent && isPlaying && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-2 h-2 bg-yellow-300 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                  style={{ x: "-50%" }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>Note: The highlighted note shows which key to press next.</p>
      </div>
    </div>
  )
}

