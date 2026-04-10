import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AnalyticsService } from './core/services/analytics.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SidebarComponent],
  template: `
    <app-header (sidebarToggle)="sidebarOpen.set(!sidebarOpen())" />
    <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />
    <main class="main-content"><router-outlet /></main>
    <app-footer />
  `,
})
export class AppComponent {
  sidebarOpen = signal(false);
 constructor(private analytics: AnalyticsService, private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: any) {}

     ngOnInit() {
    // Hydrate schemas on client after SSR
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.seo.hydrateSchemas();
      }, 0);
    }
  }
}
