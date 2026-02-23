export type VisualizerMode = "spectrum" | "waveform" | "braille" | "matrix" | "off";

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: boolean;
  analyser: AnalyserNode | null;
}

export interface AudioControls {
  togglePlay: () => void;
  seek: (delta: number) => void;
  seekTo: (time: number) => void;
  adjustVolume: (delta: number) => void;
  toggleRepeat: () => void;
}
