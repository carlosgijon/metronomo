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

@Controller('presets')
export class PresetsController {
  constructor(private readonly presetsService: PresetsService) {}

  @Get()
  findAll() {
    return this.presetsService.findAll();
  }

  @Get('favorites')
  findFavorites() {
    return this.presetsService.findFavorites();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.presetsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPresetDto: CreatePresetDto) {
    return this.presetsService.create(createPresetDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePresetDto: UpdatePresetDto) {
    return this.presetsService.update(id, updatePresetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.presetsService.remove(id);
  }
}
