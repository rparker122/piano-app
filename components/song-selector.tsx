"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Song {
  id: string
  title: string
  notes: { note: string; duration: number }[]
}

interface SongSelectorProps {
  songs: Song[]
  selectedSong: string | null
  onSelect: (songId: string) => void
}

export default function SongSelector({ songs, selectedSong, onSelect }: SongSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedSongTitle = selectedSong
    ? songs.find((s) => s.id === selectedSong)?.title || "Select a song"
    : "Select a song"

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium"
        whileTap={{ scale: 0.97 }}
      >
        <span className="truncate max-w-[150px]">{selectedSongTitle}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20"
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {songs.map((song) => (
                <motion.button
                  key={song.id}
                  onClick={() => {
                    onSelect(song.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm",
                    selectedSong === song.id ? "bg-indigo-600 text-white" : "text-gray-200 hover:bg-gray-700",
                  )}
                  whileHover={{ backgroundColor: selectedSong === song.id ? "#4f46e5" : "#374151" }}
                >
                  {song.title}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

