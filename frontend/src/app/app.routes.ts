import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';
import { LoginComponent } from './components/login/login.component';
import { MasterComponent } from './components/master/master.component';
import { FollowerComponent } from './components/follower/follower.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'master',
    component: MasterComponent,
    canActivate: [authGuard, roleGuard([UserRole.MASTER])]
  },
  {
    path: 'follower',
    component: FollowerComponent,
    canActivate: [authGuard, roleGuard([UserRole.FOLLOWER])]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
