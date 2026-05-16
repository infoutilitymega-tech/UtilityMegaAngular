import { Routes } from '@angular/router';

export const TOOLING_ROUTES: Routes = [
  {
    path: ':category/:tool/blog/:blogSlug',
    loadComponent: () => import('./blog-details/blog-details.component').then((m) => m.BlogDetailsComponent),
  },
  {
    path: ':category/:tool',
    loadComponent: () => import('./tool/tool.component').then((m) => m.ToolComponent),
  },
  {
    path: ':category',
    loadComponent: () => import('./category/category.component').then((m) => m.CategoryComponent),
  },
];
