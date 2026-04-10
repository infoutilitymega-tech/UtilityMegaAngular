import { Injectable, Inject, PLATFORM_ID, TransferState, makeStateKey, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Category, Tool } from '../models/tool.model';

interface MetaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
}

const JSONLD_KEY = makeStateKey<any>('jsonld');
const FAQ_SCHEMA_KEY = makeStateKey<any>('faqSchema');

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private transferState = inject(TransferState);
  
  @Inject(PLATFORM_ID) private platformId: any;

  private readonly defaultImage = 'https://utilitymega.com/assets/og-default.png';

  /** Generic meta updater — works on both server and browser */
  updateMeta(opts: MetaOptions): void {
    
    this.title.setTitle(opts.title);
    const image = opts.image ?? this.defaultImage;

    // Standard SEO
    this.meta.updateTag({ name: 'description', content: opts.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: opts.title });
    this.meta.updateTag({ property: 'og:description', content: opts.description });
    this.meta.updateTag({ property: 'og:url', content: opts.url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'UtilityMega' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: opts.title });
    this.meta.updateTag({ name: 'twitter:description', content: opts.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // Canonical (handles both server and browser)
    this.setCanonical(opts.url);
  }

  setHomeMeta(): void {
    this.updateMeta({
      title: 'UtilityMega — 100+ Free Online Tools | No Login Required',
      description: 'Free online tools for everyone: SIP calculator, EMI calculator, image compressor, JSON formatter, password generator, unit converters and more. 100% free, instant, private.',
      url: 'https://utilitymega.com'
    });
  }

  setCategoryMeta(cat: Category): void {
    this.updateMeta({
      title: cat.seoTitle,
      description: cat.metaDescription,
      url: cat.canonicalUrl
    });
  }

  setToolMeta(tool: Tool): void {
    
    this.updateMeta({
      title: tool.seoTitle,
      description: tool.metaDescription,
      url: tool.canonicalUrl
    });

    // Store schemas in TransferState for client hydration (SSR)
    if (isPlatformServer(this.platformId)) {
      console.log('Storing schemas in TransferState on server');
      this.transferState.set(JSONLD_KEY, tool.jsonLd);
      if (tool.faqSchema) {
        this.transferState.set(FAQ_SCHEMA_KEY, tool.faqSchema);
      }
    }

    // On browser, inject JSON-LD directly
    if (isPlatformBrowser(this.platformId)) {
      console.log('Injecting JSON-LD directly on browser');
      this.injectJsonLd(tool.jsonLd, 'json-ld');
      if (tool.faqSchema) {
        this.injectJsonLd(tool.faqSchema, 'faq-schema');
      }
    }
  }

  // Call this in AppComponent after bootstrap to hydrate schemas from server
  hydrateSchemas(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Hydrating schemas from TransferState');
      
      const jsonld = this.transferState.get<any>(JSONLD_KEY, null);
      const faqSchema = this.transferState.get<any>(FAQ_SCHEMA_KEY, null);
      
      if (jsonld) {
        this.injectJsonLd(jsonld, 'json-ld');
        this.transferState.remove(JSONLD_KEY);
      }
      if (faqSchema) {
        this.injectJsonLd(faqSchema, 'faq-schema');
        this.transferState.remove(FAQ_SCHEMA_KEY);
      }
    }
  }

  private setCanonical(url: string): void {
    // On server, we can't access document, but Angular handles meta tags
    if (isPlatformBrowser(this.platformId)) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    } else {
      // On server, just update meta tag (Angular handles it)
      this.meta.updateTag({ rel: 'canonical', href: url });
    }
  }

  private injectJsonLd(data: object, id: string = 'json-ld'): void {
    // Only inject on browser
    if (!isPlatformBrowser(this.platformId)) return;
    
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  setSearchMeta(query?: string): void {
    const baseTitle = 'Search Tools | UtilityMega';
    const baseDesc = 'Search from 100+ free online tools like calculators, converters, generators, and more. Fast, private, and no login required.';

    const title = query
      ? `${query} - Search Tools | UtilityMega`
      : baseTitle;

    const description = query
      ? `Find "${query}" and related tools on UtilityMega. Explore 100+ free online utilities with instant results.`
      : baseDesc;

    const url = query
      ? `https://utilitymega.com/search?q=${encodeURIComponent(query)}`
      : 'https://utilitymega.com/search';

    this.updateMeta({ title, description, url });
  }
}