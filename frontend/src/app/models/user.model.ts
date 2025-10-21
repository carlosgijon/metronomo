export enum UserRole {
  MASTER = 'master',
  FOLLOWER = 'follower',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  latency: number; // latencia en milisegundos
}

export interface LoginRequest {
  name: string;
  role: UserRole;
}
