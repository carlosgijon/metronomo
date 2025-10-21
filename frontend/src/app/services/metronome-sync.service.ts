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
      this.createSounds();
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

    // Ajustar el tiempo del beat según la latencia del usuario
    const adjustedTime = beatEvent.scheduledTime + (user.latency / 1000);

    // Programar el sonido
    this.scheduleSound(adjustedTime, beatEvent.isAccent);

    // Actualizar el beat actual
    this.stateSignal.update(state => ({
      ...state,
      currentBeat: beatEvent.beatNumber
    }));
  }

  private scheduleSound(time: number, isAccent: boolean): void {
    if (!this.audioContext) return;

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

    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = isAccent ? 1.0 : 0.6;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(time);
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
