// Detección automática del servidor según el contexto
const getServerIP = (): string => {
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

export const environment = {
  production: false,
  wsUrl: `ws://${SERVER_IP}:${SERVER_PORT}`,
  apiUrl: `http://${SERVER_IP}:${SERVER_PORT}/api`
};
