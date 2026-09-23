import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingInterceptor } from './app/loading.interceptor';

bootstrapApplication(App, {
  providers: [
    appConfig.providers,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
