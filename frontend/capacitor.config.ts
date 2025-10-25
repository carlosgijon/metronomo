import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.metronomo.sync',
  appName: 'Metrónomo Sincronizado',
  webDir: 'dist/frontend/browser',
  server: {
    androidScheme: 'https',
    // Permitir conexiones HTTP en desarrollo
    // IMPORTANTE: Para producción, usa HTTPS
    cleartext: true,
    // Permitir conexiones a cualquier host (desarrollo)
    allowNavigation: ['*']
  },
  android: {
    // Permitir tráfico HTTP (cleartext)
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
