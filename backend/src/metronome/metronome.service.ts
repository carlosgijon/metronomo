import { Injectable, Logger } from '@nestjs/common';
import { BeatEvent, MetronomeState } from './interfaces/metronome.interface';

@Injectable()
export class MetronomeService {
  private readonly logger = new Logger(MetronomeService.name);

  private state: MetronomeState = {
    isPlaying: false,
    bpm: 120,
    timeSignature: '4/4',
    currentBeat: 0,
    accentFirst: true,
    soundType: 'click',
    timestamp: Date.now(),
    countdownSeconds: 3, // 3 segundos de countdown por defecto
    isPreparing: false,
  };

  private beatInterval: NodeJS.Timeout | null = null;
  private beatCallback: ((beat: BeatEvent) => void) | null = null;

  getState(): MetronomeState {
    return { ...this.state };
  }

  /**
   * Prepara el inicio del metrónomo con countdown
   * @param maxLatency Latencia máxima de todos los clientes (ms)
   * @returns Timestamp absoluto de cuándo debe empezar
   */
  prepareStart(maxLatency: number = 0): number {
    if (this.state.isPlaying || this.state.isPreparing) {
      this.logger.warn('El metrónomo ya está en ejecución o preparándose');
      return this.state.startTime || Date.now();
    }

    this.state.isPreparing = true;

    // Calcular tiempo de inicio:
    // - countdownSeconds * 1000 ms para el countdown
    // - maxLatency * 2 para compensar ida y vuelta
    // - 500ms de buffer adicional
    const countdownMs = (this.state.countdownSeconds || 3) * 1000;
    const latencyBuffer = Math.max(maxLatency * 2, 500);
    const startTime = Date.now() + countdownMs + latencyBuffer;

    this.state.startTime = startTime;
    this.state.timestamp = Date.now();

    this.logger.log(
      `Metrónomo preparándose. Countdown: ${this.state.countdownSeconds}s, ` +
      `Latencia: ${maxLatency}ms, Inicio en: ${new Date(startTime).toISOString()}`
    );

    return startTime;
  }

  /**
   * Inicia el metrónomo en el tiempo programado
   */
  start(): void {
    if (this.state.isPlaying) {
      this.logger.warn('El metrónomo ya está en ejecución');
      return;
    }

    this.state.isPlaying = true;
    this.state.isPreparing = false;
    this.state.currentBeat = 1;
    this.state.timestamp = Date.now();

    this.scheduleBeat();
    this.logger.log(`Metrónomo iniciado a ${this.state.bpm} BPM`);
  }

  stop(): void {
    if (!this.state.isPlaying && !this.state.isPreparing) {
      return;
    }

    this.state.isPlaying = false;
    this.state.isPreparing = false;
    this.state.currentBeat = 0;
    this.state.startTime = undefined;

    if (this.beatInterval) {
      clearTimeout(this.beatInterval);
      this.beatInterval = null;
    }

    this.logger.log('Metrónomo detenido');
  }

  updateState(updates: Partial<MetronomeState>): void {
    const wasPlaying = this.state.isPlaying;

    // Si está tocando, detener antes de actualizar
    if (wasPlaying) {
      this.stop();
    }

    // Actualizar estado
    Object.assign(this.state, updates);
    this.state.timestamp = Date.now();

    // Si estaba tocando, reiniciar
    if (wasPlaying) {
      this.start();
    }

    this.logger.log(`Estado actualizado: ${JSON.stringify(updates)}`);
  }

  setBpm(bpm: number): void {
    if (bpm < 40 || bpm > 240) {
      throw new Error('BPM debe estar entre 40 y 240');
    }
    this.updateState({ bpm });
  }

  setTimeSignature(timeSignature: string): void {
    this.updateState({ timeSignature, currentBeat: 1 });
  }

  setSoundType(soundType: 'click' | 'beep' | 'wood'): void {
    this.updateState({ soundType });
  }

  setAccentFirst(accentFirst: boolean): void {
    this.updateState({ accentFirst });
  }

  onBeat(callback: (beat: BeatEvent) => void): void {
    this.beatCallback = callback;
  }

  private scheduleBeat(): void {
    if (!this.state.isPlaying) {
      return;
    }

    const beatsPerMeasure = this.getBeatsPerMeasure();
    const currentBeat = this.state.currentBeat;
    const isAccent = currentBeat === 1 && this.state.accentFirst;

    // Crear evento de beat
    const beatEvent: BeatEvent = {
      beatNumber: currentBeat,
      isAccent,
      serverTimestamp: Date.now(),
      scheduledTime: Date.now() / 1000, // Timestamp en segundos para Web Audio API
    };

    // Emitir el beat
    if (this.beatCallback) {
      this.beatCallback(beatEvent);
    }

    // Actualizar estado para el siguiente beat
    this.state.currentBeat =
      currentBeat >= beatsPerMeasure ? 1 : currentBeat + 1;

    // Programar el siguiente beat
    const intervalMs = (60 / this.state.bpm) * 1000;
    this.beatInterval = setTimeout(() => {
      this.scheduleBeat();
    }, intervalMs);
  }

  private getBeatsPerMeasure(): number {
    const [numerator] = this.state.timeSignature.split('/');
    return parseInt(numerator, 10);
  }
}
