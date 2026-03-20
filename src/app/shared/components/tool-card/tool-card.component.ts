import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tool } from '../../../core/models/tool.model';
import { CommonModule } from '@angular/common';


const CATEGORY_ICONS: Record<string, string> = {
  calculators: '🧮', 'image-tools': '🖼️', 'video-tools': '🎬',
  'developer-tools': '💻', 'text-tools': '📝', 'security-tools': '🔒',
  'seo-tools': '📈', 'unit-converters': '⚖️', 'utility-tools': '🔧', 'farmers-tools': '🌾'
};

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [RouterLink,CommonModule],
  template: `
    <a class="tool-card" [routerLink]="['/', tool.categorySlug, tool.slug]" [attr.aria-label]="tool.name">
      <div class="card-icon">{{ icon }}</div>
      <div class="card-body">
        <h3 class="card-title">{{ tool.name }}</h3>
        <p class="card-desc">{{ tool.shortDescription }}</p>
      </div>
      <div class="card-meta">
        <span class="badge">{{ tool.categoryName }}</span>
        <span *ngIf="tool.isPopular" class="badge badge-hot">🔥 Popular</span>
      </div>
      <div class="card-arrow">→</div>
    </a>
  `,
  styles: [`
    .tool-card {
      display: flex; flex-direction: column; gap: 0.5rem;
      background: var(--card-bg, #fff); border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 12px; padding: 1.25rem; text-decoration: none; color: inherit;
      transition: all 0.2s; position: relative; overflow: hidden;
      cursor: pointer;
    }
    .tool-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--primary, #2563eb), var(--accent, #7c3aed)); transform: scaleX(0); transition: transform 0.2s; transform-origin: left; }
    .tool-card:hover { border-color: var(--primary, #2563eb); box-shadow: 0 4px 24px rgba(37,99,235,0.12); transform: translateY(-2px); }
    .tool-card:hover::before { transform: scaleX(1); }
    .card-icon { font-size: 2rem; line-height: 1; }
    .card-title { font-size: 1rem; font-weight: 600; color: var(--text, #111827); margin: 0; }
    .card-desc { font-size: 0.875rem; color: var(--text-muted, #6b7280); line-height: 1.5; margin: 0; }
    .card-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.25rem; }
    .badge { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 99px; background: var(--primary-light, #eff6ff); color: var(--primary, #2563eb); font-weight: 600; }
    .badge-hot { background: #fff7ed; color: #c2410c; }
    .card-arrow { position: absolute; top: 1.25rem; right: 1.25rem; color: var(--text-muted, #9ca3af); font-size: 1.1rem; transition: transform 0.2s; }
    .tool-card:hover .card-arrow { transform: translateX(4px); color: var(--primary, #2563eb); }
  `]
})
export class ToolCardComponent {
  @Input({ required: true }) tool!: Tool;
  get icon(): string { return CATEGORY_ICONS[this.tool.categorySlug] ?? '🔧'; }
}
