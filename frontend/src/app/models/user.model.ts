export enum UserRole {
  MASTER = 'master',
  FOLLOWER = 'follower',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  latency?: number; // Opcional - ya no se usa compensación de latencia
}

export interface LoginRequest {
  name: string;
  role: UserRole;
}
