import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MetronomeSyncService } from '../../services/metronome-sync.service';
import { AuthService } from '../../services/auth.service';
import { PresetService } from '../../services/preset.service';
import { Preset } from '../../models/preset.model';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzSliderModule,
    NzSelectModule,
    NzSwitchModule,
    NzIconModule,
    NzBadgeModule,
    NzSpaceModule,
    NzDividerModule,
    NzSegmentedModule
  ],
  templateUrl: './master.component.html',
  styleUrl: './master.component.css'
})
export class MasterComponent {
  public metronomeService = inject(MetronomeSyncService);
  private authService = inject(AuthService);
  private presetService = inject(PresetService);
  private router = inject(Router);

  metronomeState = this.metronomeService.state;
  user = this.authService.currentUser;
  presets = this.presetService.presets;

  bpmInput = signal(120);
  selectedPreset = signal<string | null>(null);

  timeSignatures = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];
  soundTypes: Array<'click' | 'beep' | 'wood'> = ['click', 'beep', 'wood'];
  soundTypeOptions = [
    { label: 'Click', value: 'click' },
    { label: 'Beep', value: 'beep' },
    { label: 'Madera', value: 'wood' }
  ];

  // Computed para saber cuántos beats tiene el compás
  beatsPerMeasure = computed(() => {
    const timeSignature = this.metronomeState().timeSignature;
    return parseInt(timeSignature.split('/')[0]);
  });

  // Array para visualizar los beats
  beats = computed(() => {
    const numBeats = this.beatsPerMeasure();
    return Array.from({ length: numBeats }, (_, i) => i + 1);
  });

  constructor() {
    this.bpmInput.set(this.metronomeState().bpm);
  }

  async toggleMetronome(): Promise<void> {
    const state = this.metronomeState();
    if (state.isPlaying) {
      this.metronomeService.stopMetronome();
    } else {
      // Desbloquear audio antes de iniciar
      await this.metronomeService.unlockAudio();
      this.metronomeService.startMetronome();
    }
  }

  onBpmChange(value: number): void {
    this.bpmInput.set(value);
    this.metronomeService.setBpm(value);
  }

  onTimeSignatureChange(timeSignature: string): void {
    this.metronomeService.setTimeSignature(timeSignature);
  }

  onSoundTypeChange(soundType: 'click' | 'beep' | 'wood'): void {
    this.metronomeService.setSoundType(soundType);
  }

  onAccentFirstChange(accentFirst: boolean): void {
    this.metronomeService.setAccentFirst(accentFirst);
  }

  loadPreset(presetId: string): void {
    const preset = this.presets().find(p => p.id === presetId);
    if (preset) {
      this.selectedPreset.set(presetId);
      this.bpmInput.set(preset.bpm);
      this.metronomeService.updateMetronome({
        bpm: preset.bpm,
        timeSignature: preset.timeSignature,
        soundType: preset.soundType,
        accentFirst: preset.accentFirst
      });
    }
  }

  isBeatActive(beatNumber: number): boolean {
    return this.metronomeState().currentBeat === beatNumber;
  }

  logout(): void {
    this.authService.logout();
  }
}
