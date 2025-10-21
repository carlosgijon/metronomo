import { Module } from '@nestjs/common';
import { MetronomeService } from './metronome.service';
import { MetronomeGateway } from './metronome.gateway';

@Module({
  providers: [MetronomeService, MetronomeGateway],
  exports: [MetronomeService, MetronomeGateway],
})
export class MetronomeModule {}
