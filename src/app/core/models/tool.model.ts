export interface FAQ {
  question: string;
  answer: string;
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
  keywords: string[];
  content: string;
  faq: FAQ[];
  relatedTools: string[];
  isPopular: boolean;
  isFeatured: boolean;
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
  toolCount: number;
}

export interface ToolsData {
  categories: Category[];
  tools: Tool[];
}

export interface BreadcrumbItem {
  label: string;
  url: string;
}
