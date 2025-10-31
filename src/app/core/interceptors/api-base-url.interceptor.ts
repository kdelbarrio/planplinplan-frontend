import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbsolute = /^https?:\/\//i.test(req.url);
  const url = isAbsolute ? req.url : `${environment.API_BASE_URL}/${req.url.replace(/^\/+/, '')}`;

  const cloned = req.clone({
    url,
    setHeaders: {
      'Accept': 'application/json'
    }
  });
  return next(cloned);
};
