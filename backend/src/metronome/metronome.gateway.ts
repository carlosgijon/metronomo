import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MetronomeService } from './metronome.service';
import { WSMessageType } from './interfaces/websocket.interface';
import { ConnectedClient } from './interfaces/metronome.interface';

@WebSocketGateway({
  cors: {
    origin: '*', // Permitir todos los orígenes en desarrollo
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})
export class MetronomeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MetronomeGateway.name);
  private connectedClients = new Map<string, ConnectedClient>();

  constructor(private metronomeService: MetronomeService) {
    // Configurar el callback de beats
    this.metronomeService.onBeat((beatEvent) => {
      this.server.emit(WSMessageType.BEAT_EVENT, {
        type: WSMessageType.BEAT_EVENT,
        payload: beatEvent,
        timestamp: Date.now(),
      });
    });
  }

  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway inicializado');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Cliente desconectado: ${client.id}`);

    this.server.emit(WSMessageType.USER_DISCONNECTED, {
      type: WSMessageType.USER_DISCONNECTED,
      payload: { clientId: client.id },
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage(WSMessageType.PING)
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { timestamp: number },
  ) {
    const serverReceiveTime = Date.now();
    const serverSendTime = Date.now();

    client.emit(WSMessageType.PONG, {
      type: WSMessageType.PONG,
      payload: {
        clientSendTime: data.timestamp,
        serverReceiveTime,
        serverSendTime,
      },
      timestamp: serverSendTime,
    });
  }

  @SubscribeMessage(WSMessageType.USER_CONNECTED)
  handleUserConnected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { name: string; role: string; latency: number },
  ) {
    const connectedClient: ConnectedClient = {
      id: client.id,
      name: data.name,
      role: data.role as 'master' | 'follower' | 'admin',
      latency: data.latency,
      connectedAt: new Date(),
    };

    this.connectedClients.set(client.id, connectedClient);
    this.logger.log(
      `Usuario conectado: ${data.name} (${data.role}) - Latencia: ${data.latency}ms`,
    );

    // Enviar el estado actual del metrónomo al nuevo cliente
    client.emit(WSMessageType.METRONOME_STATE, {
      type: WSMessageType.METRONOME_STATE,
      payload: this.metronomeService.getState(),
      timestamp: Date.now(),
    });

    // Notificar a todos los demás clientes
    client.broadcast.emit(WSMessageType.USER_CONNECTED, {
      type: WSMessageType.USER_CONNECTED,
      payload: connectedClient,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage(WSMessageType.METRONOME_START)
  handleMetronomeStart(@ConnectedSocket() client: Socket) {
    const connectedClient = this.connectedClients.get(client.id);

    if (connectedClient?.role !== 'master') {
      client.emit(WSMessageType.ERROR, {
        type: WSMessageType.ERROR,
        payload: { message: 'Solo el maestro puede iniciar el metrónomo' },
        timestamp: Date.now(),
      });
      return;
    }

    const currentState = this.metronomeService.getState();

    // Tiempo de inicio sincronizado: 200ms en el futuro
    // Esto da tiempo a todos los clientes para recibir el mensaje y prepararse
    const startTime = Date.now() + 200;

    this.metronomeService.start();

    // Broadcast del nuevo estado con startTime sincronizado
    this.server.emit(WSMessageType.METRONOME_STATE, {
      type: WSMessageType.METRONOME_STATE,
      payload: {
        ...this.metronomeService.getState(),
        startTime, // Tiempo absoluto de inicio
      },
      timestamp: Date.now(), // Tiempo del servidor ahora
    });

    this.logger.log(`Metrónomo iniciado, startTime: ${startTime}`);
  }

  @SubscribeMessage(WSMessageType.METRONOME_STOP)
  handleMetronomeStop(@ConnectedSocket() client: Socket) {
    const connectedClient = this.connectedClients.get(client.id);

    if (connectedClient?.role !== 'master') {
      client.emit(WSMessageType.ERROR, {
        type: WSMessageType.ERROR,
        payload: { message: 'Solo el maestro puede detener el metrónomo' },
        timestamp: Date.now(),
      });
      return;
    }

    this.metronomeService.stop();

    // Broadcast del nuevo estado a todos los clientes
    this.server.emit(WSMessageType.METRONOME_STATE, {
      type: WSMessageType.METRONOME_STATE,
      payload: this.metronomeService.getState(),
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage(WSMessageType.METRONOME_UPDATE)
  handleMetronomeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() updates: any,
  ) {
    const connectedClient = this.connectedClients.get(client.id);

    if (connectedClient?.role !== 'master') {
      client.emit(WSMessageType.ERROR, {
        type: WSMessageType.ERROR,
        payload: {
          message: 'Solo el maestro puede actualizar el metrónomo',
        },
        timestamp: Date.now(),
      });
      return;
    }

    try {
      this.metronomeService.updateState(updates);

      // Broadcast del nuevo estado a todos los clientes
      this.server.emit(WSMessageType.METRONOME_STATE, {
        type: WSMessageType.METRONOME_STATE,
        payload: this.metronomeService.getState(),
        timestamp: Date.now(),
      });
    } catch (error) {
      client.emit(WSMessageType.ERROR, {
        type: WSMessageType.ERROR,
        payload: { message: error.message },
        timestamp: Date.now(),
      });
    }
  }

  // Métodos para notificar cambios en presets
  notifyPresetCreated(preset: any) {
    this.server.emit(WSMessageType.PRESET_CREATED, {
      type: WSMessageType.PRESET_CREATED,
      payload: preset,
      timestamp: Date.now(),
    });
  }

  notifyPresetUpdated(preset: any) {
    this.server.emit(WSMessageType.PRESET_UPDATED, {
      type: WSMessageType.PRESET_UPDATED,
      payload: preset,
      timestamp: Date.now(),
    });
  }

  notifyPresetDeleted(presetId: string) {
    this.server.emit(WSMessageType.PRESET_DELETED, {
      type: WSMessageType.PRESET_DELETED,
      payload: { id: presetId },
      timestamp: Date.now(),
    });
  }
}
