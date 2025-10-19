import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePresetDto, UpdatePresetDto } from './dto/create-preset.dto';
import { Preset } from './preset.entity';

@Injectable()
export class PresetsService {
  constructor(
    @InjectRepository(Preset)
    private presetsRepository: Repository<Preset>,
  ) {}

  async findAll(): Promise<Preset[]> {
    return this.presetsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Preset> {
    const preset = await this.presetsRepository.findOne({ where: { id } });
    if (!preset) {
      throw new NotFoundException(`Preset con ID ${id} no encontrado`);
    }
    return preset;
  }

  async create(createPresetDto: CreatePresetDto): Promise<Preset> {
    const preset = this.presetsRepository.create(createPresetDto);
    return this.presetsRepository.save(preset);
  }

  async update(id: string, updatePresetDto: UpdatePresetDto): Promise<Preset> {
    const preset = await this.findOne(id);
    Object.assign(preset, updatePresetDto);
    return this.presetsRepository.save(preset);
  }

  async remove(id: string): Promise<void> {
    const preset = await this.findOne(id);
    await this.presetsRepository.remove(preset);
  }

  async findFavorites(): Promise<Preset[]> {
    return this.presetsRepository.find({
      where: { is_favorite: true },
      order: { created_at: 'DESC' },
    });
  }
}
