export interface Preset {
  id?: string;
  name: string;
  bpm: number;
  timeSignature: string; // ej: "4/4", "3/4", "6/8"
  accentFirst: boolean;
  soundType: 'click' | 'beep' | 'wood';
  createdAt?: Date;
  updatedAt?: Date;
}
