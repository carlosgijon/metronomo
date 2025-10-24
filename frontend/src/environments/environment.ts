// CONFIGURACIÓN: Cambia esta IP a la IP de tu servidor
const SERVER_IP = 'localhost'; // Cambia esto por la IP de tu servidor (ej: '192.168.1.100' o 'miservidor.com')
const SERVER_PORT = 3000;

export const environment = {
  production: false,
  wsUrl: `ws://${SERVER_IP}:${SERVER_PORT}`,
  apiUrl: `http://${SERVER_IP}:${SERVER_PORT}/api`
};
