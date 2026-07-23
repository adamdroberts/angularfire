import { mergeApplicationConfig, ApplicationConfig, inject, REQUEST_CONTEXT } from '@angular/core';
import { initializeApp, initializeServerApp, provideFirebaseApp } from '@angular/fire/app';
import { provideServerRendering as providePlatformServerRendering } from '@angular/platform-server';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { environment } from '../environments/environment';

const serverConfig: ApplicationConfig = {
  providers: [
    providePlatformServerRendering(),
    provideServerRendering(withRoutes(serverRoutes)),
    provideFirebaseApp(() => {
      const requestContext = inject(REQUEST_CONTEXT, { optional: true }) as {
        authIdToken: string,
      } | undefined;
      if (requestContext?.authIdToken) {
        return initializeServerApp(environment.firebase, { authIdToken: requestContext.authIdToken });
      }
      return initializeApp(environment.firebase);
    }),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
