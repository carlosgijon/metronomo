import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadioGroup,
  IonRadio,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { musicalNotes, person, people, settings } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRadioGroup,
    IonRadio,
    IonSpinner
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);

  name = signal('');
  selectedRole = signal<UserRole>(UserRole.FOLLOWER);
  isLoading = signal(false);
  errorMessage = signal('');

  readonly UserRole = UserRole;

  constructor() {
    addIcons({ musicalNotes, person, people, settings });
  }

  async onLogin(): Promise<void> {
    const nameValue = this.name();
    const roleValue = this.selectedRole();

    if (!nameValue.trim()) {
      this.errorMessage.set('Por favor, ingresa tu nombre');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login({
        name: nameValue,
        role: roleValue
      });
    } catch (error) {
      this.errorMessage.set('Error al conectar. Por favor, intenta de nuevo.');
      console.error('Error en login:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
  }
}
