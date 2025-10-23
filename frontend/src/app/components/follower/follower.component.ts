import { Component, computed, inject } from '@angular/core';
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
    addIcons({ person, logOut, checkmarkCircle, closeCircle });
  }

  isBeatActive(beatNumber: number): boolean {
    return this.metronomeState().currentBeat === beatNumber;
  }

  logout(): void {
    this.authService.logout();
  }
}
