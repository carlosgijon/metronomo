export interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  timeSignature: string;
  currentBeat: number;
  accentFirst: boolean;
  soundType: 'click' | 'beep' | 'wood';
  timestamp: number;
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
  latency: number;
  connectedAt: Date;
}
