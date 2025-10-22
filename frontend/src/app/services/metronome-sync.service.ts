import { Injectable, signal } from '@angular/core';
import { WebSocketService } from './websocket.service';
import { AuthService } from './auth.service';
import { MetronomeState, BeatEvent } from '../models/metronome.model';
import { WSMessageType } from '../models/websocket.model';

@Injectable({
  providedIn: 'root'
})
export class MetronomeSyncService {
  private stateSignal = signal<MetronomeState>({
    isPlaying: false,
    bpm: 120,
    timeSignature: '4/4',
    currentBeat: 0,
    accentFirst: true,
    soundType: 'click',
    timestamp: 0
  });

  public state = this.stateSignal.asReadonly();

  private audioContext: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private beepBuffer: AudioBuffer | null = null;
  private woodBuffer: AudioBuffer | null = null;
  private scheduledBeats: number[] = [];
  private scheduleAheadTime = 0.1; // Programar con 100ms de anticipación
  private timerID: any = null;

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService
  ) {
    this.initAudioContext();
    this.subscribeToMetronomeEvents();
  }

  private initAudioContext(): void {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 AudioContext creado, estado:', this.audioContext.state);
      this.createSounds();
    }
  }

  async unlockAudio(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('🔓 AudioContext desbloqueado, estado:', this.audioContext.state);
    }
  }

  private createSounds(): void {
    if (!this.audioContext) return;

    // Sonido de click (frecuencias altas)
    this.clickBuffer = this.createClickSound();

    // Sonido de beep (tono puro)
    this.beepBuffer = this.createBeepSound();

    // Sonido de madera (más grave)
    this.woodBuffer = this.createWoodSound();
  }

  private createClickSound(): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * 0.05, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 1000 * (i / sampleRate)) * Math.exp(-3 * i / buffer.length);
    }

    return buffer;
  }

  private createBeepSound(): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * 0.1, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 800 * (i / sampleRate)) * Math.exp(-5 * i / buffer.length);
    }

    return buffer;
  }

  private createWoodSound(): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * 0.08, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-10 * i / buffer.length);
    }

    return buffer;
  }

  private subscribeToMetronomeEvents(): void {
    // Escuchar cambios de estado del metrónomo
    this.wsService.onMessage<MetronomeState>(WSMessageType.METRONOME_STATE)
      .subscribe(state => {
        this.stateSignal.set(state);
      });

    // Escuchar eventos de beat
    this.wsService.onMessage<BeatEvent>(WSMessageType.BEAT_EVENT)
      .subscribe(beatEvent => {
        this.handleBeatEvent(beatEvent);
      });
  }

  private handleBeatEvent(beatEvent: BeatEvent): void {
    const user = this.authService.currentUser();
    if (!user) return;

    console.log('🥁 Beat recibido:', beatEvent.beatNumber, 'Acento:', beatEvent.isAccent);

    // Desbloquear audio si está suspendido
    if (this.audioContext?.state === 'suspended') {
      this.unlockAudio();
    }

    // Programar el sonido inmediatamente con un pequeño delay
    // (no usamos scheduledTime del servidor porque es un timestamp absoluto)
    this.scheduleSound(beatEvent.isAccent);

    // Actualizar el beat actual
    this.stateSignal.update(state => ({
      ...state,
      currentBeat: beatEvent.beatNumber
    }));
  }

  private scheduleSound(isAccent: boolean): void {
    if (!this.audioContext) {
      console.warn('⚠️ AudioContext no disponible');
      return;
    }

    if (this.audioContext.state !== 'running') {
      console.warn('⚠️ AudioContext no está corriendo, estado:', this.audioContext.state);
      return;
    }

    const currentState = this.stateSignal();
    let buffer: AudioBuffer | null = null;

    switch (currentState.soundType) {
      case 'click':
        buffer = this.clickBuffer;
        break;
      case 'beep':
        buffer = this.beepBuffer;
        break;
      case 'wood':
        buffer = this.woodBuffer;
        break;
    }

    if (!buffer) {
      console.warn('⚠️ Buffer de sonido no disponible');
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = isAccent ? 1.0 : 0.6;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Programar para reproducir inmediatamente
      const playTime = this.audioContext.currentTime + 0.01;
      source.start(playTime);
      console.log('🔊 Sonido programado para:', playTime, 'currentTime:', this.audioContext.currentTime, 'Acento:', isAccent);
    } catch (error) {
      console.error('❌ Error reproduciendo sonido:', error);
    }
  }

  // Métodos para el maestro
  startMetronome(): void {
    this.wsService.send(WSMessageType.METRONOME_START, {});
  }

  stopMetronome(): void {
    this.wsService.send(WSMessageType.METRONOME_STOP, {});
  }

  updateMetronome(updates: Partial<MetronomeState>): void {
    this.wsService.send(WSMessageType.METRONOME_UPDATE, updates);
  }

  setBpm(bpm: number): void {
    this.updateMetronome({ bpm });
  }

  setTimeSignature(timeSignature: string): void {
    this.updateMetronome({ timeSignature });
  }

  setSoundType(soundType: 'click' | 'beep' | 'wood'): void {
    this.updateMetronome({ soundType });
  }

  setAccentFirst(accentFirst: boolean): void {
    this.updateMetronome({ accentFirst });
  }
}
