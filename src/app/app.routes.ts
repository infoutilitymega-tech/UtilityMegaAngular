import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent) },
  { path: ':category', loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent) },
  { path: ':category/:tool', loadComponent: () => import('./pages/tool/tool.component').then(m => m.ToolComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
