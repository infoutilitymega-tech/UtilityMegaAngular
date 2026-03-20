import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Tool, Category, BreadcrumbItem } from '../models/tool.model';

const BASE_URL = 'https://utilitymega.com';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private router = inject(Router);

  private get currentUrl() { return `${BASE_URL}${this.router.url}`; }

  setHomeMeta() {
    this.apply({
      title: 'UtilityMega - 100+ Free Online Tools | No Login Required',
      description: 'Free online tools for everyone: SIP calculator, EMI calculator, image compressor, JSON formatter, password generator, QR code maker, and 100+ more. No login needed.',
      keywords: 'free online tools, calculators, image tools, developer tools, SEO tools, unit converters, text tools, security tools',
      canonical: BASE_URL,
    });
    this.setOG({ title: 'UtilityMega - 100+ Free Online Tools', description: 'Free online tools — calculators, image tools, developer utilities, SEO analyzers and more.', url: BASE_URL });
    this.setTwitter({ title: 'UtilityMega - 100+ Free Online Tools', description: '100+ free tools. No login, no ads, no limits.' });
    this.injectJsonLd('website-schema', {
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'UtilityMega', url: BASE_URL,
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/search?q={search_term_string}` }, 'query-input': 'required name=search_term_string' }
    });
  }

  setCategoryMeta(cat: Category) {
    const url = `${BASE_URL}/${cat.slug}`;
    this.apply({ title: cat.seoTitle, description: cat.metaDescription, keywords: `${cat.name} tools, free ${cat.name.toLowerCase()}, online ${cat.name.toLowerCase()} tools`, canonical: url });
    this.setOG({ title: cat.seoTitle, description: cat.metaDescription, url });
    this.setBreadcrumb([{ label: 'Home', url: BASE_URL }, { label: cat.name, url }]);
  }

  setToolMeta(tool: Tool) {
    const url = `${BASE_URL}/${tool.categorySlug}/${tool.slug}`;
    this.apply({ title: tool.seoTitle, description: tool.metaDescription, keywords: tool.keywords.join(', '), canonical: url });
    this.setOG({ title: tool.seoTitle, description: tool.metaDescription, url });
    this.setTwitter({ title: tool.seoTitle, description: tool.metaDescription });
    this.setBreadcrumb([
      { label: 'Home', url: BASE_URL },
      { label: tool.categoryName, url: `${BASE_URL}/${tool.categorySlug}` },
      { label: tool.name, url }
    ]);
    this.injectJsonLd('webapp-schema', {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: tool.name, description: tool.metaDescription,
      url, applicationCategory: 'UtilityApplication', operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    });
    this.injectJsonLd('faq-schema', {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: tool.faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
    });
  }

  setSearchMeta() {
    this.apply({
      title: 'Search Free Online Tools - UtilityMega',
      description: 'Search 100+ free online tools on UtilityMega. Find calculators, image tools, developer utilities, SEO analyzers, and more instantly.',
      keywords: 'search online tools, find free tools, utility tools search',
      canonical: `${BASE_URL}/search`,
    });
  }

  private apply(opts: { title: string; description: string; keywords: string; canonical: string }) {
    this.title.setTitle(opts.title);
    this.meta.updateTag({ name: 'description', content: opts.description });
    this.meta.updateTag({ name: 'keywords', content: opts.keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.setCanonical(opts.canonical);
  }

  private setOG(o: { title: string; description: string; url: string }) {
    this.meta.updateTag({ property: 'og:title', content: o.title });
    this.meta.updateTag({ property: 'og:description', content: o.description });
    this.meta.updateTag({ property: 'og:url', content: o.url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'UtilityMega' });
    this.meta.updateTag({ property: 'og:image', content: `${BASE_URL}/assets/og-image.png` });
  }

  private setTwitter(o: { title: string; description: string }) {
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: o.title });
    this.meta.updateTag({ name: 'twitter:description', content: o.description });
    this.meta.updateTag({ name: 'twitter:image', content: `${BASE_URL}/assets/og-image.png` });
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!link) { link = this.doc.createElement('link'); link.setAttribute('rel', 'canonical'); this.doc.head.appendChild(link); }
    link.setAttribute('href', url);
  }

  private setBreadcrumb(items: BreadcrumbItem[]) {
    this.injectJsonLd('breadcrumb-schema', {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: it.url }))
    });
  }

  private injectJsonLd(id: string, schema: object) {
    let s = this.doc.getElementById(id) as HTMLScriptElement;
    if (!s) { s = this.doc.createElement('script'); s.id = id; s.type = 'application/ld+json'; this.doc.head.appendChild(s); }
    s.textContent = JSON.stringify(schema);
  }
}
