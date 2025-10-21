import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PresetService } from '../../services/preset.service';
import { AuthService } from '../../services/auth.service';
import { Preset } from '../../models/preset.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private presetService = inject(PresetService);
  private authService = inject(AuthService);
  private router = inject(Router);

  presets = this.presetService.presets;
  user = this.authService.currentUser;

  isEditing = signal(false);
  isCreating = signal(false);
  editingPreset = signal<Preset | null>(null);

  // Form fields
  formName = signal('');
  formBpm = signal(120);
  formTimeSignature = signal('4/4');
  formAccentFirst = signal(true);
  formSoundType = signal<'click' | 'beep' | 'wood'>('click');

  timeSignatures = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];
  soundTypes: Array<'click' | 'beep' | 'wood'> = ['click', 'beep', 'wood'];

  openCreateModal(): void {
    this.resetForm();
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.editingPreset.set(null);
  }

  openEditModal(preset: Preset): void {
    this.formName.set(preset.name);
    this.formBpm.set(preset.bpm);
    this.formTimeSignature.set(preset.timeSignature);
    this.formAccentFirst.set(preset.accentFirst);
    this.formSoundType.set(preset.soundType);

    this.editingPreset.set(preset);
    this.isEditing.set(true);
    this.isCreating.set(false);
  }

  closeModal(): void {
    this.isCreating.set(false);
    this.isEditing.set(false);
    this.editingPreset.set(null);
    this.resetForm();
  }

  savePreset(): void {
    const preset: Preset = {
      name: this.formName(),
      bpm: this.formBpm(),
      timeSignature: this.formTimeSignature(),
      accentFirst: this.formAccentFirst(),
      soundType: this.formSoundType()
    };

    if (this.isEditing() && this.editingPreset()) {
      // Actualizar preset existente
      const id = this.editingPreset()!.id!;
      this.presetService.updatePreset(id, preset).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (error) => {
          console.error('Error actualizando preset:', error);
          alert('Error al actualizar el preset');
        }
      });
    } else {
      // Crear nuevo preset
      this.presetService.createPreset(preset).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creando preset:', error);
          alert('Error al crear el preset');
        }
      });
    }
  }

  deletePreset(preset: Preset): void {
    if (!preset.id) return;

    if (confirm(`¿Estás seguro de eliminar el preset "${preset.name}"?`)) {
      this.presetService.deletePreset(preset.id).subscribe({
        next: () => {
          console.log('Preset eliminado');
        },
        error: (error) => {
          console.error('Error eliminando preset:', error);
          alert('Error al eliminar el preset');
        }
      });
    }
  }

  private resetForm(): void {
    this.formName.set('');
    this.formBpm.set(120);
    this.formTimeSignature.set('4/4');
    this.formAccentFirst.set(true);
    this.formSoundType.set('click');
  }

  logout(): void {
    this.authService.logout();
  }
}
