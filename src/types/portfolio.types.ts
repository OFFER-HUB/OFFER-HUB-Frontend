export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  link?: string;
  order: number;
  createdAt: string;
}

export interface PortfolioFormData {
  title: string;
  description: string;
  images: string[];
  link: string;
}

export interface PortfolioFormErrors {
  title?: string;
  description?: string;
  images?: string;
  link?: string;
}
