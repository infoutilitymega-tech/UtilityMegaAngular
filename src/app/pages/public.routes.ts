import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
    title: 'UtilityMega — 100+ Free Online Tools',
    data: { preload: true },
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
    title: 'About Us — UtilityMega',
    data: { preload: true },
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact Us — UtilityMega',
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
    title: 'Privacy Policy — UtilityMega',
  },
  {
    path: 'terms-of-use',
    loadComponent: () => import('./terms-of-use/terms-of-use.component').then((m) => m.TermsOfUseComponent),
    title: 'Terms of Use — UtilityMega',
  },
  {
    path: 'sitemap',
    loadComponent: () => import('./sitemap/sitemap.component').then((m) => m.SitemapComponent),
    title: 'Sitemap — UtilityMega',
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search.component').then((m) => m.SearchComponent),
    title: 'Search Tools — UtilityMega',
    data: { preload: true },
  },
];
