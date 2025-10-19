import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async getHealth() {
    try {
      // Verificar conexión a la base de datos
      await this.connection.query('SELECT NOW()');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'metronome-backend',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'metronome-backend',
        database: 'disconnected',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error.message,
      };
    }
  }
}
