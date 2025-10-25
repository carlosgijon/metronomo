import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole, LoginRequest } from '../models/user.model';
import { WebSocketService } from './websocket.service';
import { WSMessageType } from '../models/websocket.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private wsService: WebSocketService,
    private router: Router
  ) {
    // Cargar usuario desde localStorage si existe
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSignal.set(JSON.parse(savedUser));
    }
  }

  async login(loginRequest: LoginRequest): Promise<void> {
    try {
      console.log('🔌 Conectando al servidor...');
      // Conectar al WebSocket
      await this.wsService.connect(environment.wsUrl).toPromise();

      console.log('📊 Midiendo latencia y sincronizando reloj...');
      // Medir latencia y clock offset (5 samples = más rápido)
      const { latency, clockOffset } = await this.wsService.measureLatency(5);

      // Crear usuario
      const user: User = {
        id: this.generateUserId(),
        name: loginRequest.name,
        role: loginRequest.role
      };

      this.currentUserSignal.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      console.log(`✅ Registrando usuario con latencia: ${latency.toFixed(2)}ms, offset: ${clockOffset.toFixed(2)}ms`);

      // Enviar mensaje de conexión al servidor con latencia y clock offset
      this.wsService.send(WSMessageType.USER_CONNECTED, {
        name: user.name,
        role: user.role,
        latency: Math.round(latency),
        clockOffset: Math.round(clockOffset)
      });

      // Navegar según el rol
      this.navigateByRole(user.role);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  logout(): void {
    this.wsService.disconnect();
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSignal();
    return user !== null && user.role === role;
  }

  private navigateByRole(role: UserRole): void {
    switch (role) {
      case UserRole.MASTER:
        this.router.navigate(['/master']);
        break;
      case UserRole.FOLLOWER:
        this.router.navigate(['/follower']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin']);
        break;
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
