import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <div class="container">
        <div class="nf-icon">🔍</div>
        <h1>404 — Page Not Found</h1>
        <p>The page or tool you're looking for doesn't exist or may have moved.</p>
        <div class="nf-actions">
          <a routerLink="/" class="btn-primary">← Back to Home</a>
          <a routerLink="/calculators" class="btn-secondary">Browse Calculators</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found { min-height: 60vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 2rem; }
    .container { max-width: 500px; }
    .nf-icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; }
    p { color: var(--text-muted, #6b7280); margin-bottom: 2rem; }
    .nf-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary { background: var(--primary, #2563eb); color: white; padding: 0.75rem 1.5rem; border-radius: 10px; text-decoration: none; font-weight: 600; }
    .btn-secondary { background: var(--primary-light, #eff6ff); color: var(--primary, #2563eb); padding: 0.75rem 1.5rem; border-radius: 10px; text-decoration: none; font-weight: 600; }
  `]
})
export class NotFoundComponent {}
