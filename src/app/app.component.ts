import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

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
}
