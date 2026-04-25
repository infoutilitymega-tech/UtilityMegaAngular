import { Injectable, PLATFORM_ID, TransferState, makeStateKey, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Category, Tool } from '../models/tool.model';

interface MetaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
}

const JSONLD_KEY = makeStateKey<unknown>('jsonld');
const FAQ_SCHEMA_KEY = makeStateKey<unknown>('faqSchema');

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly transferState = inject(TransferState);

  private readonly platformId = inject(PLATFORM_ID);

  private readonly defaultImage = 'https://www.utilitymega.com/assets/og-default.png';

  updateMeta(opts: MetaOptions): void {
    this.title.setTitle(opts.title);
    const image = opts.image ?? this.defaultImage;

    this.meta.updateTag({ name: 'description', content: opts.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: opts.title });
    this.meta.updateTag({ property: 'og:description', content: opts.description });
    this.meta.updateTag({ property: 'og:url', content: opts.url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'UtilityMega' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: opts.title });
    this.meta.updateTag({ name: 'twitter:description', content: opts.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(opts.url);
  }

  setHomeMeta(): void {
    this.updateMeta({
      title: 'UtilityMega — 100+ Free Online Tools | No Login Required',
      description:
        'Free online tools for everyone: SIP calculator, EMI calculator, image compressor, JSON formatter, password generator, unit converters and more. 100% free, instant, private.',
      url: 'https://www.utilitymega.com',
    });

    this.injectJsonLd(
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'UtilityMega',
        url: 'https://www.utilitymega.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.utilitymega.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      'website-schema'
    );
  }

  setCategoryMeta(cat: Category): void {
    this.updateMeta({
      title: cat.seoTitle,
      description: cat.metaDescription,
      url: cat.canonicalUrl,
    });
  }

  setToolMeta(tool: Tool): void {
    this.updateMeta({
      title: tool.seoTitle,
      description: tool.metaDescription,
      url: tool.canonicalUrl,
    });

    if (isPlatformServer(this.platformId)) {
      this.transferState.set(JSONLD_KEY, tool.jsonLd);
      if (tool.faqSchema) {
        this.transferState.set(FAQ_SCHEMA_KEY, tool.faqSchema);
      }
    }

    if (isPlatformBrowser(this.platformId)) {
      this.injectJsonLd(tool.jsonLd, 'json-ld');
      if (tool.faqSchema) {
        this.injectJsonLd(tool.faqSchema, 'faq-schema');
      }
    }
  }

  hydrateSchemas(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const jsonld = this.transferState.get<unknown>(JSONLD_KEY, null);
    const faqSchema = this.transferState.get<unknown>(FAQ_SCHEMA_KEY, null);

    if (jsonld) {
      this.injectJsonLd(jsonld as object, 'json-ld');
      this.transferState.remove(JSONLD_KEY);
    }

    if (faqSchema) {
      this.injectJsonLd(faqSchema as object, 'faq-schema');
      this.transferState.remove(FAQ_SCHEMA_KEY);
    }
  }

  setSearchMeta(query?: string): void {
    const baseTitle = 'Search Tools | UtilityMega';
    const baseDesc =
      'Search from 100+ free online tools like calculators, converters, generators, and more. Fast, private, and no login required.';

    const title = query ? `${query} - Search Tools | UtilityMega` : baseTitle;
    const description = query
      ? `Find "${query}" and related tools on UtilityMega. Explore 100+ free online utilities with instant results.`
      : baseDesc;

    const url = query
      ? `https://www.utilitymega.com/search?q=${encodeURIComponent(query)}`
      : 'https://www.utilitymega.com/search';

    this.updateMeta({ title, description, url });
  }

  private setCanonical(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private injectJsonLd(data: object, id = 'json-ld'): void {
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
}
