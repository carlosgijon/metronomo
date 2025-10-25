export interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  timeSignature: string;
  currentBeat: number;
  accentFirst: boolean;
  soundType: 'click' | 'beep' | 'wood';
  timestamp: number;
  startTime?: number; // Timestamp absoluto de cuándo debe empezar (ms)
  countdownSeconds?: number; // Segundos de countdown antes de empezar
  isPreparing?: boolean; // Estado de preparación/sincronización
}

export interface BeatEvent {
  beatNumber: number;
  isAccent: boolean;
  serverTimestamp: number;
  scheduledTime: number;
}

export interface LatencyMeasurement {
  clientSendTime: number;
  serverReceiveTime: number;
  serverSendTime: number;
}

export interface ConnectedClient {
  id: string;
  name: string;
  role: 'master' | 'follower' | 'admin';
  latency: number; // Latencia RTT promedio (ms)
  clockOffset: number; // Diferencia entre reloj cliente y servidor (ms)
  connectedAt: Date;
  isReady: boolean; // Si el cliente está listo para sincronización
}
