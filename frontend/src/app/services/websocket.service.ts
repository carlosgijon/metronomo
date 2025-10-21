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

  constructor() {}

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
          console.log('Socket.IO conectado');
          observer.next(true);
          observer.complete();

          // Escuchar todos los tipos de mensajes
          Object.values(WSMessageType).forEach(type => {
            this.socket?.on(type, (message: WSMessage) => {
              this.messageSubject.next(message);
            });
          });
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
      this.socket.emit(type, message.payload);
    } else {
      console.error('Socket.IO no está conectado');
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
