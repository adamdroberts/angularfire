import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom, toArray } from 'rxjs';
import { take } from 'rxjs/operators';
import { ɵscreenViewEvent } from './screen-tracking.service';

@Component({
  selector: 'app-test-home',
  template: '<div>Home</div>',
  standalone: true,
})
class TestHomeComponent {}

@Component({
  selector: 'app-test-detail',
  template: '<div>Detail</div>',
  standalone: true,
})
class TestDetailComponent {}

@Component({
  template: '<div>Parent <router-outlet></router-outlet></div>',
  standalone: true,
})
class TestParentComponent {}

describe('ɵscreenViewEvent', () => {
  it('reports selector for a decorated component and tracks navigation details', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'home', component: TestHomeComponent },
          { path: 'detail', component: TestDetailComponent },
        ]),
        Title,
      ],
    });

    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);
    title.setTitle('Test App Title');

    const eventsPromise = firstValueFrom(ɵscreenViewEvent(router, title).pipe(take(2), toArray()));

    await router.navigateByUrl('/home');
    await router.navigateByUrl('/detail');

    const events = await eventsPromise;
    expect(events.length).toBe(2);

    expect(events[0].screen_class).toBe('app-test-home');
    expect(events[0].screen_name).toBe('home');
    expect(events[0].page_path).toBe('/home');
    expect(events[0].page_title).toBe('Test App Title');
    expect(events[0].firebase_event_origin).toBe('auto');

    expect(events[1].screen_class).toBe('app-test-detail');
    expect(events[1].screen_name).toBe('detail');
    expect(events[1].page_path).toBe('/detail');
    expect(events[1].firebase_previous_class).toBe('app-test-home');
    expect(events[1].firebase_previous_screen).toBe('home');
  });

  it('resolves deepest active component for nested routes', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'parent',
            component: TestParentComponent,
            children: [
              { path: 'child', component: TestDetailComponent },
            ],
          },
        ]),
      ],
    });

    const router = TestBed.inject(Router);

    const eventPromise = firstValueFrom(ɵscreenViewEvent(router, null).pipe(take(1)));
    await router.navigateByUrl('/parent/child');

    const event = await eventPromise;
    expect(event.screen_class).toBe('app-test-detail');
    expect(event.screen_name).toBe('parent/child');
  });

  it('handles string components cleanly if specified', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'string-route', component: 'legacy-string-component' as any },
        ]),
      ],
    });

    const router = TestBed.inject(Router);

    const eventPromise = firstValueFrom(ɵscreenViewEvent(router, null).pipe(take(1)));
    await router.navigateByUrl('/string-route');

    const event = await eventPromise;
    expect(event.screen_class).toBe('legacy-string-component');
  });
});
