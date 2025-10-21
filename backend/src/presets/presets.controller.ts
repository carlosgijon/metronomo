import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreatePresetDto, UpdatePresetDto } from './dto/create-preset.dto';
import { PresetsService } from './presets.service';
import { MetronomeGateway } from '../metronome/metronome.gateway';

@Controller('presets')
export class PresetsController {
  constructor(
    private readonly presetsService: PresetsService,
    private readonly metronomeGateway: MetronomeGateway,
  ) {}

  @Get()
  findAll() {
    return this.presetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.presetsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPresetDto: CreatePresetDto) {
    const preset = await this.presetsService.create(createPresetDto);
    this.metronomeGateway.notifyPresetCreated(preset);
    return preset;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePresetDto: UpdatePresetDto,
  ) {
    const preset = await this.presetsService.update(id, updatePresetDto);
    this.metronomeGateway.notifyPresetUpdated(preset);
    return preset;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.presetsService.remove(id);
    this.metronomeGateway.notifyPresetDeleted(id);
  }
}
