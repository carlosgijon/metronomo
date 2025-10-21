import { Injectable } from '@angular/core';
import { WebSocketService } from './websocket.service';
import { WSMessageType } from '../models/websocket.model';
import { LatencyMeasurement } from '../models/metronome.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LatencyService {
  private measurements: LatencyMeasurement[] = [];
  private readonly numMeasurements = 5; // Número de mediciones para promediar

  constructor(private wsService: WebSocketService) {}

  async measureLatency(): Promise<number> {
    this.measurements = [];

    // Realizar múltiples mediciones
    for (let i = 0; i < this.numMeasurements; i++) {
      const measurement = await this.singleMeasurement();
      this.measurements.push(measurement);

      // Pequeña pausa entre mediciones
      await this.delay(100);
    }

    // Calcular latencia media
    const avgLatency = this.calculateAverageLatency();
    console.log(`Latencia promedio: ${avgLatency.toFixed(2)}ms`);

    return avgLatency;
  }

  private async singleMeasurement(): Promise<LatencyMeasurement> {
    const clientSendTime = Date.now();

    // Enviar ping
    this.wsService.send(WSMessageType.PING, { timestamp: clientSendTime });

    // Esperar pong
    const pongData = await firstValueFrom(
      this.wsService.onMessage<any>(WSMessageType.PONG)
    );

    const clientReceiveTime = Date.now();
    const serverReceiveTime = pongData.serverReceiveTime;
    const serverSendTime = pongData.serverSendTime;

    const roundTripTime = clientReceiveTime - clientSendTime;
    const serverProcessingTime = serverSendTime - serverReceiveTime;
    const estimatedLatency = (roundTripTime - serverProcessingTime) / 2;

    return {
      clientSendTime,
      serverReceiveTime,
      serverSendTime,
      clientReceiveTime,
      roundTripTime,
      estimatedLatency
    };
  }

  private calculateAverageLatency(): number {
    if (this.measurements.length === 0) return 0;

    const sum = this.measurements.reduce(
      (acc, m) => acc + m.estimatedLatency,
      0
    );

    return sum / this.measurements.length;
  }

  getLastMeasurement(): LatencyMeasurement | null {
    return this.measurements.length > 0
      ? this.measurements[this.measurements.length - 1]
      : null;
  }

  getAllMeasurements(): LatencyMeasurement[] {
    return [...this.measurements];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
