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

  setHomeMeta() {
    this.apply({
      title: 'UtilityMega - 100+ Free Online Tools | No Login Required',
      description: 'Free online tools for everyone: SIP calculator, EMI calculator, image compressor, JSON formatter, password generator, QR code maker, and 100+ more. No login needed.',
      keywords: 'free online tools, calculators, image tools, developer tools, SEO tools, unit converters, text tools, security tools',
      canonical: BASE_URL,
    });
    this.setOGFromObj({ 'og:title': 'UtilityMega - 100+ Free Online Tools', 'og:description': 'Free online tools — calculators, image tools, developer utilities, SEO analyzers and more.', 'og:type': 'website', 'og:url': BASE_URL, 'og:site_name': 'UtilityMega' });
    this.setTwFromObj({ 'twitter:card': 'summary_large_image', 'twitter:title': 'UtilityMega - 100+ Free Online Tools', 'twitter:description': '100+ free tools. No login, no ads, no limits.' });
    this.injectJsonLd('website-schema', {
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'UtilityMega', url: BASE_URL,
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/search?q={search_term_string}` }, 'query-input': 'required name=search_term_string' }
    });
  }

  setCategoryMeta(cat: Category) {
    const t = cat as any;
    const url = t.canonicalUrl ?? `${BASE_URL}/${cat.slug}`;
    this.apply({
      title: cat.seoTitle,
      description: cat.metaDescription,
      keywords: (t.keywords ?? []).join(', ') || `${cat.name} free online tools`,
      canonical: url,
    });
    t.openGraph ? this.setOGFromObj(t.openGraph) : this.setOGFromObj({ 'og:title': cat.seoTitle, 'og:description': cat.metaDescription, 'og:type': 'website', 'og:url': url, 'og:site_name': 'UtilityMega' });
    t.twitterCard && this.setTwFromObj(t.twitterCard);
    t.jsonLd && this.injectJsonLd('category-schema', t.jsonLd);
    this.injectJsonLd('breadcrumb-schema', {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: cat.name, item: url },
      ]
    });
  }

  setToolMeta(tool: Tool) {
    const t = tool as any;
    const url = t.canonicalUrl ?? `${BASE_URL}/${tool.categorySlug}/${tool.slug}`;
    this.apply({ title: tool.seoTitle, description: tool.metaDescription, keywords: tool.keywords.join(', '), canonical: url });
    // Open Graph
    t.openGraph ? this.setOGFromObj(t.openGraph) : this.setOGFromObj({ 'og:title': tool.seoTitle, 'og:description': tool.metaDescription, 'og:type': 'website', 'og:url': url, 'og:site_name': 'UtilityMega' });
    // Twitter Card
    t.twitterCard ? this.setTwFromObj(t.twitterCard) : this.setTwFromObj({ 'twitter:card': 'summary_large_image', 'twitter:title': tool.seoTitle, 'twitter:description': tool.metaDescription });
    // WebApplication JSON-LD (includes embedded breadcrumb from tools.json)
    this.injectJsonLd('webapp-schema', t.jsonLd ?? {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: tool.name, description: tool.metaDescription,
      url, applicationCategory: 'UtilityApplication', operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
    });
    // Standalone BreadcrumbList JSON-LD
    if (t.breadcrumbs?.length) {
      this.injectJsonLd('breadcrumb-schema', {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: t.breadcrumbs.map((b: any, i: number) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: b.url }))
      });
    }
    // FAQPage JSON-LD
    const faqData = t.faqSchema ?? (tool.faq?.length ? {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: tool.faq.slice(0, 5).map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
    } : null);
    faqData && this.injectJsonLd('faq-schema', faqData);
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

  private setOGFromObj(og: Record<string, string>) {
    Object.entries(og).forEach(([prop, content]) => this.meta.updateTag({ property: prop, content }));
    if (!og['og:image']) this.meta.updateTag({ property: 'og:image', content: `${BASE_URL}/assets/og-image.png` });
  }

  private setTwFromObj(tw: Record<string, string>) {
    Object.entries(tw).forEach(([name, content]) => this.meta.updateTag({ name, content }));
    if (!tw['twitter:image']) this.meta.updateTag({ name: 'twitter:image', content: `${BASE_URL}/assets/og-image.png` });
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!link) { link = this.doc.createElement('link'); link.setAttribute('rel', 'canonical'); this.doc.head.appendChild(link); }
    link.setAttribute('href', url);
  }

  private injectJsonLd(id: string, schema: object) {
    let s = this.doc.getElementById(id) as HTMLScriptElement;
    if (!s) { s = this.doc.createElement('script'); s.id = id; s.type = 'application/ld+json'; this.doc.head.appendChild(s); }
    s.textContent = JSON.stringify(schema);
  }
}
