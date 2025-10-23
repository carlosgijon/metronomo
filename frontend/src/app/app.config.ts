import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import es_ES from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

import { routes } from './app.routes';

registerLocaleData(es_ES);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideNzConfig({
      theme: {
        primaryColor: '#1890ff',
      },
    }),
  ],
};
