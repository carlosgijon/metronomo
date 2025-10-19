import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePresetDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(30)
  @Max(300)
  bpm: number;

  @IsInt()
  @Min(1)
  @Max(16)
  beats_per_measure: number;

  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 4, 8, 16])
  note_value?: number;

  @IsOptional()
  @IsString()
  sound_type?: string;

  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @IsOptional()
  @IsString()
  user_id?: string;
}

export class UpdatePresetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(300)
  bpm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(16)
  beats_per_measure?: number;

  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 4, 8, 16])
  note_value?: number;

  @IsOptional()
  @IsString()
  sound_type?: string;

  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;
}
