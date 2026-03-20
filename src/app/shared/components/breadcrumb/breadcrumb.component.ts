import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from '../../../core/models/tool.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink,CommonModule],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li *ngFor="let item of items; let i = index; let last = last"
            class="breadcrumb-item"
            itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a *ngIf="!last" [routerLink]="item.url" itemprop="item">
            <span itemprop="name">{{ item.label }}</span>
          </a>
          <span *ngIf="last" itemprop="name" aria-current="page">{{ item.label }}</span>
          <span *ngIf="!last" class="sep" aria-hidden="true">›</span>
          <meta itemprop="position" [attr.content]="i + 1" />
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb { padding: 0.75rem 0; }
    .breadcrumb-list { list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem; padding: 0; margin: 0; }
    .breadcrumb-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.85rem; }
    .breadcrumb-item a { color: var(--primary, #2563eb); text-decoration: none; }
    .breadcrumb-item a:hover { text-decoration: underline; }
    .breadcrumb-item span[aria-current] { color: var(--text-muted, #6b7280); }
    .sep { color: var(--text-muted, #9ca3af); }
  `]
})
export class BreadcrumbComponent {
  @Input({ required: true }) items!: BreadcrumbItem[];
}
