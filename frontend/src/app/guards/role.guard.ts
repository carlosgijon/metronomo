import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const user = authService.currentUser();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // Redirigir según el rol del usuario
    if (user) {
      switch (user.role) {
        case UserRole.MASTER:
          router.navigate(['/master']);
          break;
        case UserRole.FOLLOWER:
          router.navigate(['/follower']);
          break;
        case UserRole.ADMIN:
          router.navigate(['/admin']);
          break;
      }
    }

    return false;
  };
};
