import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MetronomeSyncService } from '../../services/metronome-sync.service';
import { AuthService } from '../../services/auth.service';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, logOut, checkmarkCircle, closeCircle } from 'ionicons/icons';

@Component({
  selector: 'app-follower',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonBadge
  ],
  templateUrl: './follower.component.html',
  styleUrl: './follower.component.css'
})
export class FollowerComponent {
  public metronomeService = inject(MetronomeSyncService);
  private authService = inject(AuthService);
  private router = inject(Router);

  metronomeState = this.metronomeService.state;
  user = this.authService.currentUser;
  flashBeat = signal(false);

  // Computed para saber cuántos beats tiene el compás
  beatsPerMeasure = computed(() => {
    const timeSignature = this.metronomeState().timeSignature;
    return parseInt(timeSignature.split('/')[0]);
  });

  // Computed para las clases de la card
  cardClasses = computed(() => {
    const state = this.metronomeState();
    const classes: string[] = ['metronome-fullscreen-card'];

    if (this.flashBeat()) {
      classes.push('beat-flash');
    }

    if (state.isPlaying && state.currentBeat === 1) {
      classes.push('beat-first');
    } else if (state.isPlaying && state.currentBeat > 0) {
      classes.push('beat-other');
    }

    return classes.join(' ');
  });

  constructor() {
    addIcons({ person, logOut, checkmarkCircle, closeCircle });

    // Effect para hacer parpadear la card en cada beat
    effect(() => {
      const state = this.metronomeState();

      if (state.isPlaying && state.currentBeat > 0) {
        // Activar el parpadeo
        this.flashBeat.set(true);

        // Desactivarlo después de la animación
        setTimeout(() => {
          this.flashBeat.set(false);
        }, 150);
      }
    });
  }

  isBeatActive(beatNumber: number): boolean {
    return this.metronomeState().currentBeat === beatNumber;
  }

  logout(): void {
    this.authService.logout();
  }
}
