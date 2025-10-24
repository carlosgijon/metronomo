// CONFIGURACIÓN DE PRODUCCIÓN: Cambia esta IP a la IP de tu servidor
const SERVER_IP = 'localhost'; // Cambia esto por la IP de tu servidor (ej: '192.168.1.100' o 'miservidor.com')
const SERVER_PORT = 3000;
const USE_HTTPS = false; // Cambia a true si usas HTTPS

const protocol = USE_HTTPS ? 'https' : 'http';
const wsProtocol = USE_HTTPS ? 'wss' : 'ws';

export const environment = {
  production: true,
  wsUrl: `${wsProtocol}://${SERVER_IP}:${SERVER_PORT}`,
  apiUrl: `${protocol}://${SERVER_IP}:${SERVER_PORT}/api`
};
