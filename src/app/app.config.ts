import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, isDevMode } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { inject as vercelInject } from '@vercel/analytics';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {
        vercelInject({ mode: isDevMode() ? 'development' : 'production' });
      },
      multi: true,
    },
  ],
};
