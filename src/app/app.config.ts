import { APP_INITIALIZER, ApplicationConfig, PLATFORM_ID, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { NoPreloading, provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(NoPreloading),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: (platformId: object) => () => {
        if (!isPlatformBrowser(platformId)) return;

        void import('@vercel/analytics').then(({ inject: injectAnalytics }) => {
          injectAnalytics({ mode: isDevMode() ? 'development' : 'production' });
        });
      },
      deps: [PLATFORM_ID],
      multi: true,
    },
  ],
};
