"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PianoKey from "@/components/piano-key"
import SongSelector from "@/components/song-selector"
import SheetMusic from "@/components/sheet-music"
import BackgroundAnimation from "@/components/background-animation"
import { cn } from "@/lib/utils"
import { songs } from "@/lib/songs"

// Piano notes with their frequencies
const notes = [
  { note: "C", freq: 261.63, color: "bg-red-500", key: "a" },
  { note: "C#", freq: 277.18, color: "bg-orange-500", key: "w" },
  { note: "D", freq: 293.66, color: "bg-yellow-500", key: "s" },
  { note: "D#", freq: 311.13, color: "bg-lime-500", key: "e" },
  { note: "E", freq: 329.63, color: "bg-green-500", key: "d" },
  { note: "F", freq: 349.23, color: "bg-emerald-500", key: "f" },
  { note: "F#", freq: 369.99, color: "bg-teal-500", key: "t" },
  { note: "G", freq: 392.0, color: "bg-cyan-500", key: "g" },
  { note: "G#", freq: 415.3, color: "bg-sky-500", key: "y" },
  { note: "A", freq: 440.0, color: "bg-blue-500", key: "h" },
  { note: "A#", freq: 466.16, color: "bg-indigo-500", key: "u" },
  { note: "B", freq: 493.88, color: "bg-violet-500", key: "j" },
  { note: "C2", freq: 523.25, color: "bg-purple-500", key: "k" },
]

export default function PianoApp() {
  const [activeNotes, setActiveNotes] = useState<string[]>([])
  const [selectedSong, setSelectedSong] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [mode, setMode] = useState<"free" | "guided">("free")

  const songTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const keyStates = useRef<Record<string, boolean>>({})

  // Super simple beep function
  const beep = (frequency: number, duration: number) => {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        console.error("AudioContext not supported")
        return
      }

      const audioCtx = new AudioContext()

      // Create oscillator
      const oscillator = audioCtx.createOscillator()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime)

      // Create gain node for volume control and to avoid clicks
      const gainNode = audioCtx.createGain()
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration)

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      // Start and stop
      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        // Clean up
        oscillator.disconnect()
        gainNode.disconnect()
      }, duration * 1000)
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = notes.find((n) => n.key === e.key.toLowerCase())
      if (note) {
        // Prevent key repeat events
        if (!keyStates.current[note.note]) {
          keyStates.current[note.note] = true
          playNote(note.note, note.freq)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = notes.find((n) => n.key === e.key.toLowerCase())
      if (note) {
        keyStates.current[note.note] = false
        stopNote(note.note)
      }
    }

    // Handle case where key up event might be missed
    const handleBlur = () => {
      // Stop all notes when window loses focus
      activeNotes.forEach((note) => {
        keyStates.current[note] = false
        stopNote(note)
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("blur", handleBlur)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("blur", handleBlur)
    }
  }, [activeNotes])

  // Song playback effect
  useEffect(() => {
    if (mode === "guided" && isPlaying && selectedSong) {
      const song = songs.find((s) => s.id === selectedSong)
      if (!song) return

      const playNextNote = () => {
        if (currentNoteIndex < song.notes.length) {
          const noteToPlay = song.notes[currentNoteIndex]
          const noteData = notes.find((n) => n.note === noteToPlay.note)

          if (noteData) {
            playNote(noteData.note, noteData.freq)

            // Schedule stopping the note based on duration
            setTimeout(() => {
              stopNote(noteData.note)
            }, noteToPlay.duration * 500) // Convert duration to ms

            // Schedule playing the next note
            songTimeoutRef.current = setTimeout(() => {
              setCurrentNoteIndex((prev) => prev + 1)
            }, noteToPlay.duration * 600) // Slightly longer than the note duration
          }
        } else {
          // Song finished
          setIsPlaying(false)
          setCurrentNoteIndex(0)
        }
      }

      playNextNote()

      return () => {
        if (songTimeoutRef.current) {
          clearTimeout(songTimeoutRef.current)
        }
      }
    }
  }, [currentNoteIndex, isPlaying, mode, selectedSong])

  // Play a note
  const playNote = (note: string, frequency: number) => {
    try {
      // Play a simple beep sound
      beep(frequency, 0.5)

      // Update state
      setActiveNotes((prev) => {
        if (prev.includes(note)) return prev
        return [...prev, note]
      })
    } catch (error) {
      console.error(`Error playing note ${note}:`, error)
    }
  }

  // Stop a note (just visual, sound stops automatically)
  const stopNote = (note: string) => {
    // Update state immediately to update UI
    setActiveNotes((prev) => prev.filter((n) => n !== note))
  }

  // Handle song selection
  const handleSongSelect = (songId: string) => {
    setSelectedSong(songId)
    setCurrentNoteIndex(0)
    setIsPlaying(false)
  }

  // Toggle between free play and guided mode
  const toggleMode = () => {
    setMode((prev) => (prev === "free" ? "guided" : "free"))
    setIsPlaying(false)
    setCurrentNoteIndex(0)
  }

  // Start or stop song playback
  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (songTimeoutRef.current) {
        clearTimeout(songTimeoutRef.current)
      }
      // Stop any playing notes
      activeNotes.forEach((note) => stopNote(note))
    } else {
      setCurrentNoteIndex(0)
      setIsPlaying(true)
    }
  }

  // Get the current song data
  const currentSong = selectedSong ? songs.find((s) => s.id === selectedSong) : null

  // Determine which keys should be highlighted in guided mode
  const getKeyHighlight = (noteKey: string) => {
    if (mode !== "guided" || !currentSong || !isPlaying) return false

    const currentNote = currentSong.notes[currentNoteIndex]
    return currentNote && currentNote.note === noteKey
  }

  // Function to play a test sound
  const playTestSound = () => {
    beep(440, 0.3) // A note
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Test sound button */}
      <button
        onClick={playTestSound}
        className="fixed bottom-4 left-4 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg z-30"
        aria-label="Test sound"
        title="Test sound"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Animated background */}
      <BackgroundAnimation isPlaying={activeNotes.length > 0} />

      {/* Controls panel - fixed at the top */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm p-4 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Colorful Piano
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMode}
              className={cn(
                "px-3 py-1.5 rounded-full text-white text-sm font-medium transition-colors",
                mode === "free"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                  : "bg-gradient-to-r from-pink-500 to-purple-600",
              )}
            >
              {mode === "free" ? "Free Play Mode" : "Guided Play Mode"}
            </motion.button>

            <AnimatePresence>
              {mode === "guided" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <SongSelector songs={songs} selectedSong={selectedSong} onSelect={handleSongSelect} />

                  {selectedSong && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={togglePlayback}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-white text-sm font-medium",
                        isPlaying
                          ? "bg-gradient-to-r from-red-500 to-orange-600"
                          : "bg-gradient-to-r from-green-500 to-emerald-600",
                      )}
                    >
                      {isPlaying ? "Stop" : "Play"}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sheet music display */}
      <AnimatePresence>
        {mode === "guided" && selectedSong && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-3xl mb-6 z-10"
          >
            <SheetMusic
              song={songs.find((s) => s.id === selectedSong)}
              currentNoteIndex={currentNoteIndex}
              isPlaying={isPlaying}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl z-10"
      >
        {/* Piano keys */}
        <div className="relative flex justify-center">
          <div className="relative flex">
            {notes.map((note) => (
              <PianoKey
                key={note.note}
                id={`key-${note.note}`}
                note={note.note}
                color={note.color}
                isSharp={note.note.includes("#")}
                isActive={activeNotes.includes(note.note)}
                isHighlighted={getKeyHighlight(note.note)}
                keyboardKey={note.key.toUpperCase()}
                onMouseDown={() => playNote(note.note, note.freq)}
                onMouseUp={() => stopNote(note.note)}
                onMouseLeave={() => activeNotes.includes(note.note) && stopNote(note.note)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-white text-center z-10"
      >
        <p className="text-gray-400 mb-2">Click the keys or use your keyboard to play</p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {notes.map((note) => (
            <div key={note.note} className="flex items-center justify-center">
              <span className={cn("inline-block px-2 py-1 rounded text-xs font-mono", note.color)}>
                {note.key.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

