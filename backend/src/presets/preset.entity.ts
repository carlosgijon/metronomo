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

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  bpm: number;

  @Column({ type: 'int' })
  beats_per_measure: number;

  @Column({ type: 'int', default: 4 })
  note_value: number;

  @Column({ type: 'varchar', length: 20, default: 'classic' })
  sound_type: string;

  @Column({ type: 'boolean', default: false })
  is_favorite: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
