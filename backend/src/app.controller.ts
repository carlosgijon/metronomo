import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return {
      message: 'Metronome API - NestJS',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        presets: '/api/presets',
        sessions: '/api/sessions',
      },
    };
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
