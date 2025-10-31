import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { FEATURE_TOGGLES } from './app/core/tokens/feature-toggles.token';
import { environment } from './environments/environment';
import { apiBaseUrlInterceptor } from './app/core/interceptors/api-base-url.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode()
    }),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, errorInterceptor])),
    { provide: FEATURE_TOGGLES, useValue: environment.features }
  ]
}).catch(err => console.error(err));
