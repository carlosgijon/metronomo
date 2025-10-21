import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preset } from './preset.entity';
import { PresetsController } from './presets.controller';
import { PresetsService } from './presets.service';
import { MetronomeModule } from '../metronome/metronome.module';

@Module({
  imports: [TypeOrmModule.forFeature([Preset]), MetronomeModule],
  controllers: [PresetsController],
  providers: [PresetsService],
  exports: [PresetsService],
})
export class PresetsModule {}
