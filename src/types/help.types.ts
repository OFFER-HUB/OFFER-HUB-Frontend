export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SupportResource {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

export interface ContactMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: string;
  href?: string;
}
