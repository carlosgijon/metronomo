import { Capacitor } from '@capacitor/core';

// Configuración del servidor para apps nativas (Android/iOS)
// IMPORTANTE: Cambia estas IPs según donde esté tu servidor
const getServerIP = (): string => {
  // Detectar si está corriendo como app nativa
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // APP NATIVA (Android/iOS)
    // El móvil se conecta a la IP del servidor en la red móvil
    return '192.168.50.1';
  }

  // WEB (Navegador)
  if (typeof window === 'undefined') {
    return 'localhost';
  }

  const hostname = window.location.hostname;

  // Si estamos en localhost o 127.0.0.1 (desarrollo en el equipo)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '192.168.1.23'; // IP del servidor desde el equipo de programación
  }

  // Si estamos en la red móvil (192.168.50.*)
  if (hostname.startsWith('192.168.50.')) {
    return '192.168.50.1'; // IP del servidor desde móvil
  }

  // Si estamos en la misma máquina que el servidor
  if (hostname === '192.168.1.23' || hostname === '192.168.50.1') {
    return 'localhost';
  }

  // Por defecto, usar la IP del equipo de programación
  return '192.168.1.23';
};

const SERVER_IP = getServerIP();
const SERVER_PORT = 3000;
const USE_HTTPS = false;

const protocol = USE_HTTPS ? 'https' : 'http';
const wsProtocol = USE_HTTPS ? 'wss' : 'ws';

export const environment = {
  production: true,
  wsUrl: `${wsProtocol}://${SERVER_IP}:${SERVER_PORT}`,
  apiUrl: `${protocol}://${SERVER_IP}:${SERVER_PORT}/api`
};

// Debug: Ver qué IP se está usando
console.log('🔗 Conectando a:', SERVER_IP);
console.log('📱 Plataforma:', Capacitor.getPlatform());
console.log('🌐 WebSocket:', `${wsProtocol}://${SERVER_IP}:${SERVER_PORT}`);
