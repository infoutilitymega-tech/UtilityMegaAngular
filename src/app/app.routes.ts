import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'UtilityMega — 100+ Free Online Tools'
  },

  // Static pages
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About Us — UtilityMega'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us — UtilityMega'
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy — UtilityMega'
  },
  {
    path: 'terms-of-use',
    loadComponent: () => import('./pages/terms-of-use/terms-of-use.component').then(m => m.TermsOfUseComponent),
    title: 'Terms of Use — UtilityMega'
  },
  {
    path: 'sitemap',
    loadComponent: () => import('./pages/sitemap/sitemap.component').then(m => m.SitemapComponent),
    title: 'Sitemap — UtilityMega'
  },

  // Category page
  {
    path: ':category',
    loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent)
  },

  // Tool page
  {
    path: ':category/:tool',
    loadComponent: () => import('./pages/tool/tool.component').then(m => m.ToolComponent)
  },

  // 404 fallback
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found — UtilityMega'
  }
];
