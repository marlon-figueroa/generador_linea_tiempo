import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { APP_MENU, NavItem } from '../../core/data/menu.data';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly menu = APP_MENU;
  readonly openGroups = signal<Record<string, boolean>>({
    equiv: true,
    series: true,
    eval: true,
    tools: true,
  });
  readonly sidebarOpen = signal(false);
  readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl.set((event as NavigationEnd).urlAfterRedirects);
      this.sidebarOpen.set(false);
    });
  }

  toggleGroup(id: string): void {
    this.openGroups.update((state) => ({ ...state, [id]: !state[id] }));
  }

  isOpen(item: NavItem): boolean {
    return !!this.openGroups()[item.id];
  }

  isChildActive(item: NavItem): boolean {
    return (item.children ?? []).some((child) => child.route && this.currentUrl().startsWith(child.route));
  }
}
