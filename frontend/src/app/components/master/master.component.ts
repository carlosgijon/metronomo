import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MetronomeSyncService } from '../../services/metronome-sync.service';
import { AuthService } from '../../services/auth.service';
import { PresetService } from '../../services/preset.service';
import { Preset } from '../../models/preset.model';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonRange,
  IonToggle,
  IonItem,
  IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { play, pause, musicalNotes, settings, person, logOut } from 'ionicons/icons';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonToggle,
    IonItem,
    IonList
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

    // Register icons
    addIcons({ play, pause, musicalNotes, settings, person, logOut });
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

  onBpmChange(event: any): void {
    const value = event.detail.value;
    this.bpmInput.set(value);
    this.metronomeService.setBpm(value);
  }

  onTimeSignatureChange(event: any): void {
    this.metronomeService.setTimeSignature(event.detail.value);
  }

  onSoundTypeChange(event: any): void {
    this.metronomeService.setSoundType(event.detail.value);
  }

  onAccentFirstChange(event: any): void {
    this.metronomeService.setAccentFirst(event.detail.checked);
  }

  loadPreset(event: any): void {
    const presetId = event.detail.value;
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
