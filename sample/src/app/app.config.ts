import { ApplicationConfig, inject, provideZonelessChangeDetection } from '@angular/core';
import { initializeApp, provideFirebaseApp, FirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth(inject(FirebaseApp));
      if ((auth as any)._canInitEmulator && environment.emulatorPorts?.auth) {
        connectAuthEmulator(auth, `http://localhost:${environment.emulatorPorts.auth}`, { disableWarnings: true });
      }
      return auth;
    }),
  ],
};
