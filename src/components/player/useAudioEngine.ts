import { useRef, useState, useCallback, useEffect } from "react";
import type { AudioState, AudioControls } from "./types";

export function useAudioEngine(src: string): AudioState & AudioControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceCreated = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.2);
  const [repeat, setRepeat] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audio.volume = 0.2;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = "";
      ctxRef.current?.close();
    };
  }, [src]);

  // Handle repeat
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = repeat;
    }
  }, [repeat]);

  const ensureAudioContext = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;

    if (audioRef.current && !sourceCreated.current) {
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);
      sourceCreated.current = true;
    }

    ctxRef.current = ctx;
    analyserRef.current = analyserNode;
    setAnalyser(analyserNode);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    ensureAudioContext();

    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume();
    }

    if (audio.paused) {
      audio.play().then(
        () => setIsPlaying(true),
        () => {}, // audio source not ready
      );
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [ensureAudioContext]);

  const seek = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration, audio.currentTime + delta),
    );
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, time));
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVol = Math.max(0, Math.min(1, audio.volume + delta));
    audio.volume = newVol;
    setVolume(newVol);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat((r) => !r);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    analyser,
    togglePlay,
    seek,
    seekTo,
    adjustVolume,
    toggleRepeat,
  };
}
