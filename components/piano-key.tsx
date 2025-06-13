"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PianoKeyProps {
  id: string;
  note: string;
  color: string; // Tailwind color classes e.g. "bg-red-500"
  isSharp: boolean;
  isActive: boolean;
  isHighlighted?: boolean;
  keyboardKey: string;
  frequency: number; // Frequency in Hz for the note sound
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export default function PianoKey({
  id,
  note,
  color,
  isSharp,
  isActive,
  isHighlighted = false,
  keyboardKey,
  frequency,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
}: PianoKeyProps) {
  const isWhiteKey = !isSharp;
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Create/resume AudioContext on first interaction to fix mobile sound blocking
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const unlockAudio = () => {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
    };

    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("mousedown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("mousedown", unlockAudio);
    };
  }, []);

  // Play note sound
  const playNote = () => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine"; // You can change waveform: sine, square, triangle, sawtooth
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
    oscillator.stop(audioCtx.currentTime + 1);
  };

  // Handlers that both trigger the passed props and play sound on down
  const handleDown = () => {
    onMouseDown();
    playNote();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDown();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.toLowerCase() === keyboardKey.toLowerCase()) {
      handleDown();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key.toLowerCase() === keyboardKey.toLowerCase()) {
      onMouseUp();
    }
  };

  return (
    <motion.div
      id={id}
      role="button"
      tabIndex={0}
      aria-label={`Piano key ${note}`}
      className={cn(
        "relative select-none cursor-pointer",
        isWhiteKey
          ? "w-12 md:w-16 h-40 md:h-48"
          : "w-8 md:w-10 h-24 md:h-28 absolute z-10 -mx-4 md:-mx-5"
      )}
      whileTap={{ scale: 0.98 }}
      onMouseDown={handleDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => {
        e.preventDefault();
        onMouseUp();
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{ touchAction: "none" }}
    >
      <motion.div
        className={cn(
          "absolute inset-0.5 rounded-b-md flex flex-col items-center justify-end pb-2",
          isWhiteKey
            ? isActive
              ? color
              : isHighlighted
              ? "bg-white bg-opacity-90 border-2 border-yellow-300"
              : "bg-white"
            : isActive
            ? color
            : isHighlighted
            ? "bg-gray-800 border-2 border-yellow-300"
            : "bg-gray-800"
        )}
        animate={{
          y: isActive ? 2 : 0,
          boxShadow: isActive
            ? `0 0 20px ${isHighlighted ? "rgba(255, 255, 0, 0.7)" : "rgba(255, 255, 255, 0.5)"}`
            : isHighlighted
            ? "0 0 15px rgba(255, 255, 0, 0.5)"
            : isWhiteKey
            ? "0 4px 6px rgba(0, 0, 0, 0.1)"
            : "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {(isActive || isHighlighted) && (
          <motion.div
            className="absolute inset-0 rounded-b-md opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHighlighted ? 0.7 : 0.5 }}
            exit={{ opacity: 0 }}
            style={{
              background: isHighlighted
                ? "radial-gradient(circle at center, yellow, transparent)"
                : `radial-gradient(circle at center, ${isWhiteKey ? "white" : "rgba(255,255,255,0.3)"}, transparent)`,
            }}
          />
        )}

        <span
          className={cn(
            "text-xs font-medium",
            isWhiteKey ? (isActive ? "text-white" : "text-gray-500") : "text-gray-300"
          )}
        >
          {note}
        </span>

        <span
          className={cn(
            "text-[10px] mt-1 opacity-70",
            isWhiteKey ? (isActive ? "text-white" : "text-gray-400") : "text-gray-400"
          )}
        >
          {keyboardKey}
        </span>
      </motion.div>
    </motion.div>
  );
}
