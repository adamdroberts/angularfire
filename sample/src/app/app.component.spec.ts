import { TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';
import { AppComponent } from './app.component';
import { initializeApp, getApps, provideFirebaseApp, FirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';

describe('AppComponent', () => {
  beforeEach(async () => {
    if (getApps().length === 0) {
      initializeApp(environment.firebase);
    }
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth(inject(FirebaseApp))),
        provideDatabase(() => getDatabase(inject(FirebaseApp))),
        provideFirestore(() => getFirestore(inject(FirebaseApp))),
        provideFunctions(() => getFunctions(inject(FirebaseApp))),
        provideStorage(() => getStorage(inject(FirebaseApp))),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'angularfire-sample' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('angularfire-sample');
  });

  it('should render content', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hello World!');
  });
});
