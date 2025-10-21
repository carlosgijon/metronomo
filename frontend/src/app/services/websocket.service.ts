import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';
import { WSMessage, WSMessageType } from '../models/websocket.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WSMessage>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor() {}

  connect(url: string): Observable<boolean> {
    return new Observable(observer => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('WebSocket conectado');
          this.reconnectAttempts = 0;
          observer.next(true);
          observer.complete();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.messageSubject.next(message);
          } catch (error) {
            console.error('Error parseando mensaje WebSocket:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          observer.error(error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket cerrado');
          this.attemptReconnect(url);
        };
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(url).subscribe({
          error: (err) => console.error('Error en reconexión:', err)
        });
      }, this.reconnectDelay);
    }
  }

  send<T>(type: WSMessageType, payload: T): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WSMessage<T> = {
        type,
        payload,
        timestamp: Date.now()
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket no está conectado');
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
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
