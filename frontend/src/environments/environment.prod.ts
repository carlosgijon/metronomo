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

  // Fallback
  return {
    apiUrl: '/api',
    wsUrl: 'ws://localhost:3000'
  };
};

const serverUrls = getServerUrl();

export const environment = {
  production: true,
  apiUrl: serverUrls.apiUrl,
  wsUrl: serverUrls.wsUrl
};
