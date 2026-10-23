'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Repeat,
  Repeat1,
  Maximize2,
  Minimize2,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { RECITER_OPTIONS, ReciterOption } from '@/lib/quranData';

interface AudioPlayerBarProps {
  surahNumber: number;
  surahEnglishName: string;
  surahArabicName: string;
  currentAyahNumber: number;
  totalAyahs: number;
  currentAudioUrl: string;
  isPlaying: boolean;
  selectedReciter: string;
  autoScroll: boolean;
  onTogglePlay: () => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  onSelectAyah: (ayah: number) => void;
  onReciterChange: (reciterId: string) => void;
  onToggleAutoScroll: () => void;
  onClose: () => void;
}

export default function AudioPlayerBar({
  surahNumber,
  surahEnglishName,
  surahArabicName,
  currentAyahNumber,
  totalAyahs,
  currentAudioUrl,
  isPlaying,
  selectedReciter,
  autoScroll,
  onTogglePlay,
  onPrevAyah,
  onNextAyah,
  onSelectAyah,
  onReciterChange,
  onToggleAutoScroll,
  onClose,
}: AudioPlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<'surah' | 'ayah' | 'off'>('surah');
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showReciterMenu, setShowReciterMenu] = useState(false);

  // Sync audio source and playback
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // Load new url if changed
    if (audio.src !== currentAudioUrl && currentAudioUrl) {
      audio.src = currentAudioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => console.warn('Audio play prevented:', err));
      }
    } else {
      if (isPlaying && audio.paused) {
        audio.play().catch((err) => console.warn('Audio play prevented:', err));
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
    }
  }, [currentAudioUrl, isPlaying]);

  // Sync speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'ayah') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
    } else if (repeatMode === 'surah' || repeatMode === 'off') {
      if (currentAyahNumber < totalAyahs) {
        onNextAyah();
      } else if (repeatMode === 'surah') {
        // Loop back to Ayah 1 of surah
        onSelectAyah(1);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cycleRepeat = () => {
    if (repeatMode === 'surah') setRepeatMode('ayah');
    else if (repeatMode === 'ayah') setRepeatMode('off');
    else setRepeatMode('surah');
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeReciter = RECITER_OPTIONS.find((r) => r.id === selectedReciter) || RECITER_OPTIONS[0];

  return (
    <div
      className={`fixed left-0 right-0 z-40 transition-all duration-200 border-t-2 border-border bg-card shadow-2xl select-none ${
        /* Position above bottom mobile nav bar (h-16 = 64px) on mobile, and flush at bottom on desktop */
        'bottom-16 md:bottom-0'
      }`}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Top scrubber bar (only when not minimized) */}
      {!isMinimized && (
        <div className="relative w-full h-1.5 bg-secondary group cursor-pointer">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Audio scrubber"
          />
        </div>
      )}

      {/* Main Controls Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Surah & Ayah Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 border border-primary/40 bg-secondary text-primary flex items-center justify-center rounded-[2px] font-serif font-bold text-sm shrink-0">
            {currentAyahNumber}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-foreground truncate">
                {surahEnglishName}
              </span>
              <span className="text-xs px-1.5 py-0.2 border border-border bg-secondary text-accent font-semibold rounded-[2px] shrink-0">
                Ayah {currentAyahNumber}/{totalAyahs}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">
              {activeReciter.name}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Previous Ayah */}
          <button
            onClick={onPrevAyah}
            disabled={currentAyahNumber <= 1}
            className="p-2 text-foreground hover:bg-secondary rounded-[2px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Ayah"
            aria-label="Previous Ayah"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-full cursor-pointer transition-transform active:scale-95 shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Ayah */}
          <button
            onClick={onNextAyah}
            disabled={currentAyahNumber >= totalAyahs}
            className="p-2 text-foreground hover:bg-secondary rounded-[2px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Ayah"
            aria-label="Next Ayah"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Repeat Mode */}
          <button
            onClick={cycleRepeat}
            className={`p-2 rounded-[2px] cursor-pointer transition-colors hidden sm:flex items-center justify-center ${
              repeatMode !== 'off'
                ? 'text-primary bg-secondary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={`Repeat: ${repeatMode === 'ayah' ? 'Repeat Verse' : repeatMode === 'surah' ? 'Loop Surah' : 'Off'}`}
            aria-label="Toggle repeat"
          >
            {repeatMode === 'ayah' ? (
              <Repeat1 className="w-4 h-4 text-primary" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right: Timing, Settings & Reciter Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Time display */}
          <span className="text-xs text-muted-foreground font-mono hidden md:inline">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Playback Speed */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 text-xs font-bold border border-border bg-secondary hover:bg-border text-foreground rounded-[2px] cursor-pointer"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          {/* Auto-scroll toggle */}
          <button
            onClick={onToggleAutoScroll}
            className={`px-2 py-1 text-xs border rounded-[2px] cursor-pointer hidden lg:inline-flex items-center gap-1 ${
              autoScroll
                ? 'border-primary bg-primary/10 text-primary font-semibold'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            title="Keep currently reciting verse centered in view"
          >
            Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
          </button>

          {/* Reciter Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowReciterMenu(!showReciterMenu)}
              className="p-2 border border-border bg-secondary hover:bg-border text-foreground rounded-[2px] cursor-pointer flex items-center gap-1.5"
              title="Select Reciter"
              aria-label="Select Reciter"
            >
              <Radio className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium hidden xl:inline max-w-[120px] truncate">
                {activeReciter.name.split(' ')[0]}
              </span>
            </button>

            {showReciterMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-card border-2 border-border rounded-card p-1 shadow-xl z-50">
                <div className="p-2 border-b border-border text-xs font-bold text-accent uppercase tracking-wider">
                  Select Reciter
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {RECITER_OPTIONS.map((reciter) => (
                    <button
                      key={reciter.id}
                      onClick={() => {
                        onReciterChange(reciter.id);
                        setShowReciterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-[2px] flex flex-col cursor-pointer transition-colors ${
                        reciter.id === selectedReciter
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <span>{reciter.name}</span>
                      <span className={`text-[10px] ${reciter.id === selectedReciter ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {reciter.subtext}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-2 text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer hidden sm:block"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer"
            title="Close audio player"
            aria-label="Close audio player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
