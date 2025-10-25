import { Injectable, signal } from '@angular/core';
import { WebSocketService } from './websocket.service';
import { AuthService } from './auth.service';
import { MetronomeState } from '../models/metronome.model';
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
    timestamp: 0,
    countdownSeconds: 3,
    isPreparing: false
  });

  public state = this.stateSignal.asReadonly();

  private audioContext: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private beepBuffer: AudioBuffer | null = null;
  private woodBuffer: AudioBuffer | null = null;

  // Sistema de scheduling local para metrónomo preciso
  private schedulerInterval: any = null;
  private nextBeatTime: number = 0;
  private currentLocalBeat: number = 1;
  private scheduleAheadTime: number = 0.1; // Programar 100ms adelante
  private lookAhead: number = 25; // Chequear cada 25ms

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService
  ) {
    this.initAudioContext();
    this.subscribeToMetronomeEvents();
    // NO medir offset aquí, ya lo hicimos en login
  }

  private initAudioContext(): void {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 AudioContext creado, estado:', this.audioContext.state);
      this.createSounds();
    }
  }

  async unlockAudio(): Promise<void> {
    if (!this.audioContext) {
      console.error('❌ AudioContext no existe');
      return;
    }

    console.log('🔓 Intentando desbloquear AudioContext, estado actual:', this.audioContext.state);

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('✅ AudioContext desbloqueado, nuevo estado:', this.audioContext.state);
      } catch (error) {
        console.error('❌ Error desbloqueando AudioContext:', error);
      }
    } else {
      console.log('ℹ️ AudioContext ya está en estado:', this.audioContext.state);
    }
  }

  private createSounds(): void {
    if (!this.audioContext) {
      console.error('❌ No se puede crear sonidos: AudioContext no disponible');
      return;
    }

    try {
      this.clickBuffer = this.createClickSound();
      this.beepBuffer = this.createBeepSound();
      this.woodBuffer = this.createWoodSound();
      console.log('✅ Buffers de audio creados');
    } catch (error) {
      console.error('❌ Error creando buffers de sonido:', error);
    }
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
    console.log('📡 Suscribiéndose a eventos de metrónomo...');

    // Solo escuchar cambios de estado (START/STOP/UPDATE)
    this.wsService.onMessage<MetronomeState>(WSMessageType.METRONOME_STATE)
      .subscribe(state => {
        console.log('📊 Estado del metrónomo actualizado:', state);
        const wasPlaying = this.stateSignal().isPlaying;
        this.stateSignal.set(state);

        // Si cambió el estado de reproducción, iniciar/detener scheduler local
        if (state.isPlaying && !wasPlaying) {
          this.startLocalMetronome(state);
        } else if (!state.isPlaying && wasPlaying) {
          this.stopLocalMetronome();
        }
      });

    console.log('✅ Suscripciones a eventos completadas (modo sincronizado)');
  }

  private startLocalMetronome(state: MetronomeState): void {
    if (!this.audioContext) {
      console.error('❌ No se puede iniciar metrónomo: AudioContext no disponible');
      return;
    }

    console.log('▶️ Iniciando metrónomo local sincronizado');

    // Desbloquear audio si está suspendido
    if (this.audioContext.state === 'suspended') {
      this.unlockAudio();
    }

    // Si hay un startTime sincronizado, esperar hasta ese momento
    if (state.startTime) {
      // Obtener el tiempo del servidor sincronizado
      const serverTime = this.wsService.getServerTime();
      const delayMs = state.startTime - serverTime;

      console.log(`⏱️ Esperando hasta startTime:`);
      console.log(`  - Tiempo servidor: ${serverTime}ms`);
      console.log(`  - StartTime: ${state.startTime}ms`);
      console.log(`  - Delay: ${delayMs.toFixed(2)}ms`);

      if (delayMs > 0) {
        // Esperar hasta el tiempo de inicio sincronizado
        setTimeout(() => {
          this.currentLocalBeat = 1; // Empezar en beat 1
          this.initializeScheduler();
        }, delayMs);
      } else {
        // Si ya pasó el tiempo, calcular en qué beat estamos
        const timeSinceStart = -delayMs;
        const secondsPerBeat = 60.0 / state.bpm;
        const beatsPassed = Math.floor(timeSinceStart / 1000 / secondsPerBeat);
        const beatsPerMeasure = this.getBeatsPerMeasure(state.timeSignature);
        this.currentLocalBeat = (beatsPassed % beatsPerMeasure) + 1;

        console.log('⚠️ StartTime ya pasó, comenzando en beat:', this.currentLocalBeat);
        this.initializeScheduler();
      }
    } else {
      // Sin startTime, iniciar inmediatamente (modo legacy)
      this.currentLocalBeat = 1;
      this.initializeScheduler();
    }
  }

  private initializeScheduler(): void {
    // Inicializar tiempo del primer beat
    this.nextBeatTime = this.audioContext!.currentTime;

    // Iniciar scheduler
    this.schedulerInterval = setInterval(() => {
      this.scheduler();
    }, this.lookAhead);

    console.log('✅ Scheduler inicializado');
  }

  private stopLocalMetronome(): void {
    console.log('⏸️ Deteniendo metrónomo local');

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    this.currentLocalBeat = 1;
  }

  private scheduler(): void {
    if (!this.audioContext) return;

    const currentState = this.stateSignal();
    if (!currentState.isPlaying) return;

    // Programar todos los beats que caen dentro de la ventana de look-ahead
    while (this.nextBeatTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      const beatsPerMeasure = this.getBeatsPerMeasure(currentState.timeSignature);
      const isAccent = this.currentLocalBeat === 1 && currentState.accentFirst;

      // Programar el sonido
      this.scheduleNote(this.nextBeatTime, isAccent);

      // Actualizar UI con el beat actual
      this.stateSignal.update(state => ({
        ...state,
        currentBeat: this.currentLocalBeat
      }));

      // Calcular siguiente beat
      const secondsPerBeat = 60.0 / currentState.bpm;
      this.nextBeatTime += secondsPerBeat;

      // Avanzar al siguiente beat en el compás
      this.currentLocalBeat++;
      if (this.currentLocalBeat > beatsPerMeasure) {
        this.currentLocalBeat = 1;
      }
    }
  }

  private scheduleNote(time: number, isAccent: boolean): void {
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

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = isAccent ? 1.0 : 0.6;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(time);
    } catch (error) {
      console.error('❌ Error reproduciendo sonido:', error);
    }
  }

  private getBeatsPerMeasure(timeSignature: string): number {
    const [numerator] = timeSignature.split('/');
    return parseInt(numerator, 10);
  }

  // Métodos para el maestro
  startMetronome(): void {
    console.log('▶️ Enviando comando START al servidor...');
    this.wsService.send(WSMessageType.METRONOME_START, {});
  }

  stopMetronome(): void {
    console.log('⏸️ Enviando comando STOP al servidor...');
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
