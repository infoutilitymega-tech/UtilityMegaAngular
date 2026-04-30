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
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <app-header (sidebarToggle)="sidebarOpen.set(!sidebarOpen())" />
    <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />
    <main id="main-content" class="main-content" tabindex="-1"><router-outlet /></main>
    <app-footer />
  `,
  styles: [`
    .skip-link {
      position: absolute;
      left: -9999px;
      top: 0;
      z-index: 1200;
      background: #111827;
      color: #ffffff;
      padding: .75rem 1rem;
      border-radius: 0 0 .5rem 0;
      font-weight: 600;
    }

    .skip-link:focus {
      left: 0;
      outline: 2px solid #60a5fa;
      outline-offset: 2px;
    }
  `],
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
