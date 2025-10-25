import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { WSMessage, WSMessageType } from '../models/websocket.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private messageSubject = new Subject<WSMessage>();
  private latency: number = 0;
  private clockOffset: number = 0;
  private latencyMeasurements: number[] = [];

  constructor() {}

  /**
   * Mide la latencia y clock offset con el servidor
   * Hace múltiples pings para obtener un promedio preciso
   */
  async measureLatency(samples: number = 10): Promise<{ latency: number; clockOffset: number }> {
    if (!this.socket || !this.socket.connected) {
      console.warn('⚠️ Socket no conectado, no se puede medir latencia');
      return { latency: 0, clockOffset: 0 };
    }

    console.log(`📊 Midiendo latencia con ${samples} muestras...`);
    const latencies: number[] = [];
    const offsets: number[] = [];

    for (let i = 0; i < samples; i++) {
      try {
        const clientSendTime = Date.now();

        // Enviar ping y esperar pong
        const pong = await new Promise<any>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout esperando pong'));
          }, 5000);

          this.socket!.emit(WSMessageType.PING, { timestamp: clientSendTime });

          const handler = (message: any) => {
            clearTimeout(timeout);
            this.socket!.off(WSMessageType.PONG, handler);
            resolve(message);
          };

          this.socket!.on(WSMessageType.PONG, handler);
        });

        const clientReceiveTime = Date.now();
        const { clientSendTime: originalSendTime, serverReceiveTime, serverSendTime } = pong.payload;

        // Calcular RTT (Round Trip Time)
        const rtt = clientReceiveTime - originalSendTime;
        latencies.push(rtt);

        // Calcular clock offset usando el método NTP
        // offset = ((T2 - T1) + (T3 - T4)) / 2
        // T1 = clientSendTime, T2 = serverReceiveTime, T3 = serverSendTime, T4 = clientReceiveTime
        const offset = ((serverReceiveTime - originalSendTime) + (serverSendTime - clientReceiveTime)) / 2;
        offsets.push(offset);

        // Pequeña pausa entre mediciones
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`⚠️ Error en medición ${i + 1}:`, error);
      }
    }

    if (latencies.length === 0) {
      console.error('❌ No se pudo medir latencia');
      return { latency: 0, clockOffset: 0 };
    }

    // Calcular promedio de latencia (latency = RTT / 2)
    this.latency = latencies.reduce((a, b) => a + b, 0) / latencies.length / 2;

    // Calcular promedio de clock offset
    this.clockOffset = offsets.reduce((a, b) => a + b, 0) / offsets.length;

    this.latencyMeasurements = latencies;

    console.log(`✅ Latencia medida: ${this.latency.toFixed(2)}ms (RTT: ${(this.latency * 2).toFixed(2)}ms)`);
    console.log(`✅ Clock offset: ${this.clockOffset.toFixed(2)}ms`);
    console.log(`📈 Mediciones RTT:`, latencies.map(l => `${l}ms`).join(', '));

    return {
      latency: this.latency,
      clockOffset: this.clockOffset
    };
  }

  /**
   * Obtiene el tiempo del servidor ajustado
   */
  getServerTime(): number {
    return Date.now() + this.clockOffset;
  }

  /**
   * Obtiene la latencia actual
   */
  getLatency(): number {
    return this.latency;
  }

  /**
   * Obtiene el clock offset actual
   */
  getClockOffset(): number {
    return this.clockOffset;
  }

  connect(url: string): Observable<boolean> {
    return new Observable(observer => {
      try {
        this.socket = io(url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        this.socket.on('connect', () => {
          console.log('✅ Socket.IO conectado, ID:', this.socket?.id);
          observer.next(true);
          observer.complete();

          // Escuchar todos los tipos de mensajes
          Object.values(WSMessageType).forEach(type => {
            this.socket?.on(type, (message: WSMessage) => {
              console.log(`📩 Mensaje recibido [${type}]:`, message);
              this.messageSubject.next(message);
            });
          });

          console.log('✅ Listeners registrados para tipos:', Object.values(WSMessageType));
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO error de conexión:', error);
          observer.error(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket.IO desconectado:', reason);
        });

      } catch (error) {
        observer.error(error);
      }
    });
  }

  send<T>(type: WSMessageType, payload: T): void {
    if (this.socket && this.socket.connected) {
      const message: WSMessage<T> = {
        type,
        payload,
        timestamp: Date.now()
      };
      console.log(`📤 Enviando mensaje [${type}]:`, payload);
      this.socket.emit(type, message.payload);
    } else {
      console.error('❌ Socket.IO no está conectado, no se puede enviar:', type);
    }
  }

  onMessage<T>(messageType: WSMessageType): Observable<T> {
    return this.messageSubject.pipe(
      filter(msg => msg.type === messageType),
      map(msg => msg.payload as T)
    );
  }

  onAnyMessage(): Observable<WSMessage> {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}
