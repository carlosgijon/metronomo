export interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  timeSignature: string;
  currentBeat: number;
  accentFirst: boolean;
  soundType: 'click' | 'beep' | 'wood';
  timestamp: number; // timestamp del servidor
  startTime?: number; // tiempo absoluto sincronizado de inicio (opcional)
  countdownSeconds?: number; // segundos de countdown antes de empezar
  isPreparing?: boolean; // si está en estado de preparación
}

export interface BeatEvent {
  beatNumber: number;
  isAccent: boolean;
  serverTimestamp: number;
  scheduledTime: number; // tiempo ajustado para sincronización
}

export interface LatencyMeasurement {
  clientSendTime: number;
  serverReceiveTime: number;
  serverSendTime: number;
  clientReceiveTime: number;
  roundTripTime: number;
  estimatedLatency: number;
}
