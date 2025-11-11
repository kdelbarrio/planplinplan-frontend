import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { FEATURE_TOGGLES } from './app/core/tokens/feature-toggles.token';
import { environment } from './environments/environment';
import { apiBaseUrlInterceptor } from './app/core/interceptors/api-base-url.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './app/shared/i18n/spanish-paginator-intl';

import { LOCALE_ID } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEs);


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode()
    }),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, errorInterceptor])),
    { provide: FEATURE_TOGGLES, useValue: environment.features },
    importProvidersFrom(MatIconModule)
  ]
}).catch(err => console.error(err));
