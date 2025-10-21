// Detectar automáticamente el host del servidor
const getServerUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;

    return {
      apiUrl: `${protocol}://${host}:3000/api`,
      wsUrl: `${wsProtocol}://${host}:3000`
    };
  }

  // Fallback para desarrollo local
  return {
    apiUrl: 'http://localhost:3000/api',
    wsUrl: 'ws://localhost:3000'
  };
};

const serverUrls = getServerUrl();

export const environment = {
  production: false,
  apiUrl: serverUrls.apiUrl,
  wsUrl: serverUrls.wsUrl
};
