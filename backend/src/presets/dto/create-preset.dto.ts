import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
} from 'class-validator';

export class CreatePresetDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(40)
  @Max(240)
  bpm: number;

  @IsString()
  @Matches(/^\d+\/\d+$/, { message: 'timeSignature debe tener el formato "4/4"' })
  timeSignature: string;

  @IsOptional()
  @IsBoolean()
  accentFirst?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['click', 'beep', 'wood'])
  soundType?: string;
}

export class UpdatePresetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(240)
  bpm?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d+\/\d+$/, { message: 'timeSignature debe tener el formato "4/4"' })
  timeSignature?: string;

  @IsOptional()
  @IsBoolean()
  accentFirst?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['click', 'beep', 'wood'])
  soundType?: string;
}
