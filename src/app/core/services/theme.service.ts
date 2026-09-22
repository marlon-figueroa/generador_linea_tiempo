import { Injectable, signal } from '@angular/core';

export type ThemeName = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeName>('dark');

  constructor() {
    const stored = localStorage.getItem('ie-theme');
    const preferred =
      stored === 'light' || stored === 'dark'
        ? stored
        : matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    this.apply(preferred);
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  apply(theme: ThemeName): void {
    this.theme.set(theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.documentElement.setAttribute('data-ie-theme', theme);
    localStorage.setItem('ie-theme', theme);
  }
}
