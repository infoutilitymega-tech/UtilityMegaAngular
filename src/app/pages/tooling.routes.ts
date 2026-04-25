import { Routes } from '@angular/router';

export const TOOLING_ROUTES: Routes = [
  {
    path: ':category/:tool',
    loadComponent: () => import('./tool/tool.component').then((m) => m.ToolComponent),
  },
  {
    path: ':category',
    loadComponent: () => import('./category/category.component').then((m) => m.CategoryComponent),
  },
];
