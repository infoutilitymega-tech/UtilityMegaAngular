export interface FAQ {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  label: string;
  url: string;
}

export interface Breadcrumb {
  name: string;
  url: string;
}

export interface OpenGraph {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url': string;
  'og:site_name': string;
}

export interface TwitterCard {
  'twitter:card': string;
  'twitter:title': string;
  'twitter:description': string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  shortDescription: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  canonicalUrl: string;
  keywords: string[];
  content: string;
  faq: FAQ[];
  relatedTools: string[];
  isPopular: boolean;
  isFeatured: boolean;
  breadcrumbs: Breadcrumb[];
  openGraph: OpenGraph;
  twitterCard: TwitterCard;
  jsonLd: Record<string, unknown>;
  faqSchema?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  shortDescription: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  canonicalUrl: string;
  keywords: string[];
  toolCount: number;
  openGraph: OpenGraph;
  twitterCard: TwitterCard;
  jsonLd: Record<string, unknown>;
}

export interface ToolsData {
  categories: Category[];
  tools: Tool[];
}