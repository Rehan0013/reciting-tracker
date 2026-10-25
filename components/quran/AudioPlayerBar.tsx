'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  X,
  Volume2,
  VolumeX,
  Radio,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
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
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<'surah' | 'ayah' | 'off'>('surah');
  const [isMuted, setIsMuted] = useState(false);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync audio source and playback
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

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

  const desktopProgressRef = useRef<HTMLDivElement | null>(null);
  const mobileProgressRef = useRef<HTMLDivElement | null>(null);
  const desktopScrubberRef = useRef<HTMLInputElement | null>(null);
  const mobileScrubberRef = useRef<HTMLInputElement | null>(null);
  const desktopTimeRef = useRef<HTMLSpanElement | null>(null);
  const mobileCurrentTimeRef = useRef<HTMLSpanElement | null>(null);
  const isSeekingRef = useRef<boolean>(false);

  // 60fps buttery-smooth progress bar loop
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const audio = audioRef.current;
      if (audio && !isSeekingRef.current && audio.duration > 0) {
        const cur = audio.currentTime;
        const dur = audio.duration;
        const pct = Math.min(100, Math.max(0, (cur / dur) * 100));

        // Direct DOM updates: 60fps hardware composited, zero React re-render overhead
        if (desktopProgressRef.current) {
          desktopProgressRef.current.style.width = `${pct}%`;
        }
        if (mobileProgressRef.current) {
          mobileProgressRef.current.style.width = `${pct}%`;
        }

        if (desktopScrubberRef.current) {
          desktopScrubberRef.current.value = String(cur);
        }
        if (mobileScrubberRef.current) {
          mobileScrubberRef.current.value = String(cur);
        }

        const formattedCur = formatTime(cur);
        if (mobileCurrentTimeRef.current && mobileCurrentTimeRef.current.textContent !== formattedCur) {
          mobileCurrentTimeRef.current.textContent = formattedCur;
        }
        if (desktopTimeRef.current) {
          const fullTime = `${formattedCur} / ${formatTime(dur)}`;
          if (desktopTimeRef.current.textContent !== fullTime) {
            desktopTimeRef.current.textContent = fullTime;
          }
        }
      }

      if (isPlaying) {
        animId = requestAnimationFrame(renderLoop);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeekingRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(cur);
      setDuration(dur);

      if (dur > 0) {
        const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
        if (desktopProgressRef.current) desktopProgressRef.current.style.width = `${pct}%`;
        if (mobileProgressRef.current) mobileProgressRef.current.style.width = `${pct}%`;
      }
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
        onSelectAyah(1);
      }
    }
  };

  const handleSeekStart = () => {
    isSeekingRef.current = true;
  };

  const handleSeekInput = (val: number) => {
    const dur = duration || audioRef.current?.duration || 0;
    if (dur > 0) {
      const pct = Math.min(100, Math.max(0, (val / dur) * 100));
      if (desktopProgressRef.current) desktopProgressRef.current.style.width = `${pct}%`;
      if (mobileProgressRef.current) mobileProgressRef.current.style.width = `${pct}%`;
    }
    const formatted = formatTime(val);
    if (mobileCurrentTimeRef.current) mobileCurrentTimeRef.current.textContent = formatted;
    if (desktopTimeRef.current) {
      desktopTimeRef.current.textContent = `${formatted} / ${formatTime(dur)}`;
    }
  };

  const handleSeekEnd = (val: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
    isSeekingRef.current = false;
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
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* ======================================================== */}
      {/* MOBILE EXPANDED AUDIO SHEET (When toggled on mobile)     */}
      {/* ======================================================== */}
      {showMobileDetails && mounted && createPortal(
        <div className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div className="bg-card border-t-2 border-border rounded-t-2xl p-5 pb-12 space-y-4 shadow-2xl max-h-[85dvh] overflow-y-auto">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center justify-center font-serif font-bold text-xs">
                  {currentAyahNumber}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">
                    {surahEnglishName} · Ayah {currentAyahNumber}/{totalAyahs}
                  </h3>
                  <p className="text-xs text-muted-foreground">{activeReciter.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileDetails(false)}
                className="p-2 border border-border bg-secondary hover:bg-card text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
                aria-label="Close details"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Scrubber & Time */}
            <div className="space-y-1.5 pt-1">
              <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden flex items-center">
                <div
                  ref={mobileProgressRef}
                  className="h-full bg-primary"
                  style={{ width: `${progressPercent}%` }}
                />
                <input
                  ref={mobileScrubberRef}
                  type="range"
                  min={0}
                  max={duration || 100}
                  step="any"
                  defaultValue={currentTime}
                  onPointerDown={handleSeekStart}
                  onPointerUp={(e) => handleSeekEnd(parseFloat((e.target as HTMLInputElement).value))}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleSeekInput(val);
                    if (!isSeekingRef.current) {
                      handleSeekEnd(val);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Audio scrubber"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span ref={mobileCurrentTimeRef}>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Playback Controls for Mobile Sheet */}
            <div className="flex items-center justify-center gap-6 py-2">
              <button
                onClick={onPrevAyah}
                disabled={currentAyahNumber <= 1}
                className="w-12 h-12 border border-border bg-secondary hover:bg-card text-foreground rounded-full flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95"
                title="Previous Ayah"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-16 h-16 bg-primary text-primary-foreground hover:bg-primary/95 rounded-full flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={onNextAyah}
                disabled={currentAyahNumber >= totalAyahs}
                className="w-12 h-12 border border-border bg-secondary hover:bg-card text-foreground rounded-full flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95"
                title="Next Ayah"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Row: Speed, Repeat, Auto-Scroll */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={cycleSpeed}
                className="py-2.5 px-3 border border-border bg-secondary hover:bg-card text-foreground rounded-[2px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Speed:</span>
                <span className="font-bold text-primary">{playbackSpeed}x</span>
              </button>

              <button
                onClick={cycleRepeat}
                className={`py-2.5 px-3 border rounded-[2px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  repeatMode !== 'off'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground'
                }`}
              >
                {repeatMode === 'ayah' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                <span className="capitalize">{repeatMode === 'off' ? 'No Repeat' : repeatMode}</span>
              </button>

              <button
                onClick={onToggleAutoScroll}
                className={`py-2.5 px-3 border rounded-[2px] text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                  autoScroll
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground'
                }`}
              >
                <span>Scroll:</span>
                <span className="font-bold">{autoScroll ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Reciter Picker List */}
            <div className="space-y-1.5 pt-2">
              <p className="text-xs font-bold text-accent uppercase tracking-wider">
                Reciter Voice
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {RECITER_OPTIONS.map((reciter) => (
                  <button
                    key={reciter.id}
                    onClick={() => onReciterChange(reciter.id)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-[2px] flex items-center justify-between cursor-pointer transition-colors ${
                      reciter.id === selectedReciter
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'border border-border bg-secondary text-foreground hover:bg-card'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{reciter.name}</p>
                      <p className={`text-[10px] ${reciter.id === selectedReciter ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {reciter.subtext}
                      </p>
                    </div>
                    {reciter.id === selectedReciter && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* MAIN AUDIO PLAYER BAR (Desktop Floating / Mobile Docked)*/}
      {/* ======================================================== */}
      <div
        className={`fixed z-40 transition-all duration-200 select-none ${
          /* Mobile: docked right above bottom navigation bar (64px) */
          'bottom-16 left-0 right-0 border-t-2 border-border bg-card/95 backdrop-blur-md shadow-2xl'
        } ${
          /* Desktop: elevated luxury floating card centered at bottom */
          'md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl md:w-[94%] md:border-2 md:rounded-card'
        }`}
      >
        {/* Scrubber Line (Edge-to-edge on top of the bar) */}
        <div className="relative w-full h-1.5 bg-secondary group cursor-pointer overflow-hidden">
          <div
            ref={desktopProgressRef}
            className="h-full bg-primary relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <input
            ref={desktopScrubberRef}
            type="range"
            min={0}
            max={duration || 100}
            step="any"
            defaultValue={currentTime}
            onPointerDown={handleSeekStart}
            onPointerUp={(e) => handleSeekEnd(parseFloat((e.target as HTMLInputElement).value))}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              handleSeekInput(val);
              if (!isSeekingRef.current) {
                handleSeekEnd(val);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Audio progress scrubber"
          />
        </div>

        {/* Player Body */}
        <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* ==================================================== */}
          {/* LEFT: Surah & Ayah info + Soundwave animation       */}
          {/* ==================================================== */}
          <div
            onClick={() => setShowMobileDetails(true)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer md:cursor-default group"
          >
            {/* Ayah Badge */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 border border-primary/40 bg-secondary text-primary flex items-center justify-center rounded-[2px] font-serif font-bold text-xs sm:text-sm shrink-0 shadow-xs">
              {currentAyahNumber}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary md:group-hover:text-foreground transition-colors">
                  {surahEnglishName}
                </span>
                <span className="text-[10px] sm:text-xs px-1.5 py-0.2 border border-border bg-secondary text-accent font-semibold rounded-[2px] shrink-0 font-mono">
                  {surahNumber}:{currentAyahNumber}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-muted-foreground truncate max-w-[110px] sm:max-w-[150px]">
                  {activeReciter.name}
                </p>
                {/* Visual Audio Wave indicator */}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-2.5 pb-0.5">
                    <span className="w-0.5 bg-primary rounded-full animate-pulse h-2" />
                    <span className="w-0.5 bg-accent rounded-full animate-pulse h-3 delay-75" />
                    <span className="w-0.5 bg-primary rounded-full animate-pulse h-1.5 delay-150" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* CENTER: Playback Controls (Prev, Play/Pause, Next)  */}
          {/* ==================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Previous Ayah */}
            <button
              onClick={onPrevAyah}
              disabled={currentAyahNumber <= 1}
              className="p-1.5 sm:p-2 text-foreground hover:bg-secondary rounded-[2px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Ayah"
              aria-label="Previous Ayah"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-full cursor-pointer transition-transform active:scale-95 shadow-md shrink-0"
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
              className="p-1.5 sm:p-2 text-foreground hover:bg-secondary rounded-[2px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Ayah"
              aria-label="Next Ayah"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Repeat Mode (Desktop) */}
            <button
              onClick={cycleRepeat}
              className={`p-2 rounded-[2px] cursor-pointer transition-colors hidden sm:flex items-center justify-center ${
                repeatMode !== 'off'
                  ? 'text-primary bg-secondary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={`Repeat: ${repeatMode === 'ayah' ? 'Repeat Verse' : repeatMode === 'surah' ? 'Loop Surah' : 'Off'}`}
              aria-label="Toggle repeat mode"
            >
              {repeatMode === 'ayah' ? (
                <Repeat1 className="w-4 h-4 text-primary" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* ==================================================== */}
          {/* RIGHT: Tools & Options                              */}
          {/* ==================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Time display (Desktop) */}
            <span
              ref={desktopTimeRef}
              className="text-xs text-muted-foreground font-mono hidden md:inline"
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Playback Speed Pill */}
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 text-xs font-bold border border-border bg-secondary hover:bg-border text-foreground rounded-[2px] cursor-pointer"
              title="Change playback speed"
            >
              {playbackSpeed}x
            </button>

            {/* Auto-scroll toggle (Desktop) */}
            <button
              onClick={onToggleAutoScroll}
              className={`px-2 py-1 text-xs border rounded-[2px] cursor-pointer hidden lg:inline-flex items-center gap-1 ${
                autoScroll
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              title="Auto-scroll to currently reciting verse"
            >
              Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>

            {/* Reciter Selector Dropdown (Desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowReciterMenu(!showReciterMenu)}
                className="p-1.5 sm:p-2 border border-border bg-secondary hover:bg-border text-foreground rounded-[2px] cursor-pointer flex items-center gap-1.5"
                title="Select Reciter"
                aria-label="Select Reciter"
              >
                <Radio className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium hidden xl:inline max-w-[120px] truncate">
                  {activeReciter.name.split(' ')[0]}
                </span>
              </button>

              {showReciterMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-64 bg-card border-2 border-border rounded-card p-1 shadow-2xl z-50">
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
                        <div className="flex items-center justify-between">
                          <span>{reciter.name}</span>
                          {reciter.id === selectedReciter && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[10px] ${reciter.id === selectedReciter ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {reciter.subtext}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mute button (Desktop) */}
            <button
              onClick={toggleMute}
              className="p-2 text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer hidden sm:block"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Mobile Expand / Settings Button */}
            <button
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer"
              title="Audio options & reciters"
              aria-label="Audio options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Close Player */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer"
              title="Close audio player"
              aria-label="Close audio player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
