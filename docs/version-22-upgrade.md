# Upgrading to AngularFire 22.0

AngularFire 22.0 provides compatibility with Angular 22, TypeScript 6, and Node 22+.

`ng add @angular/fire@next`

## Requirements

* **Angular**: `^22.0.0`
* **Node.js**: `^22.22.3 || ^24.15.0 || >=26.0.0`
* **TypeScript**: `>=6.0 <6.1`
* **RxJS**: `~7.8.0`

## Installation

Install the AngularFire 22 release candidate using npm's `next` tag:

```bash
ng add @angular/fire@next
```

or via npm directly:

```bash
npm install @angular/fire@next
```

## Consumer Considerations & Features

### Stable Zoneless & OnPush Support
Angular 22 stabilizes `provideZonelessChangeDetection()`. AngularFire 22 is fully compatible with zoneless applications and default `OnPush` change detection strategies across all modular providers (`@angular/fire/*`) and compatibility modules (`@angular/fire/compat/*`).

### Feature APIs & Migrations
* No supported AngularFire feature API requires code migration between v21 and v22.
* Internal private Angular exports (such as `ɵEmptyOutletComponent` and `ComponentFactoryResolver`) used previously in analytics screen tracking have been replaced with standard Angular 22 component selector reflection (`reflectComponentType`).
* Note: Internal AngularFire symbols prefixed with `ɵ` are private implementation details and not guaranteed by public API contracts.
