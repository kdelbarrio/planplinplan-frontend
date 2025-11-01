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

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode()
    }),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, errorInterceptor])),
    { provide: FEATURE_TOGGLES, useValue: environment.features },
    importProvidersFrom(MatIconModule)
  ]
}).catch(err => console.error(err));
