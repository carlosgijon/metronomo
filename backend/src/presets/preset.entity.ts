import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('metronome_presets')
export class Preset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  bpm: number;

  @Column({ type: 'varchar', length: 10 })
  timeSignature: string; // ej: "4/4", "3/4", "6/8"

  @Column({ type: 'boolean', default: true })
  accentFirst: boolean;

  @Column({ type: 'varchar', length: 20, default: 'click' })
  soundType: string; // 'click' | 'beep' | 'wood'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
