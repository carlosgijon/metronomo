import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MetronomeSyncService } from '../../services/metronome-sync.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-follower',
  standalone: true,
  imports: [CommonModule],
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

  isBeatActive(beatNumber: number): boolean {
    return this.metronomeState().currentBeat === beatNumber;
  }

  logout(): void {
    this.authService.logout();
  }
}
