export interface LandingStat {
  num: string;
  label: string;
}

export interface LandingFloatBadge {
  title: string;
  subtitle: string;
}

export interface LandingCredential {
  label: string;
  value: string;
  sub: string;
}

export interface LandingServiceItem {
  num: string;
  name: string;
  desc: string;
}

export interface LandingBookingInfo {
  title: string;
  subtitle: string;
}

export interface LandingConfig {
  hero: {
    badge: string;
    titleLine1: string;
    titleHighlight: string;
    titleLine3: string;
    subtitle: string;
    stats: LandingStat[];
    ctaPrimary: string;
    ctaSecondary: string;
  };
  profileCard: {
    crp: string;
    tags: string[];
    ratingText: string;
  };
  floatBadges: LandingFloatBadge[];
  about: {
    chip: string;
    title: string;
    titleHighlight: string;
    titleSuffix: string;
    paragraphs: string[];
    pills: string[];
  };
  credentials: LandingCredential[];
  services: {
    chip: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    items: LandingServiceItem[];
  };
  testimonials: {
    chip: string;
    title: string;
  };
  booking: {
    chip: string;
    title: string;
    subtitle: string;
    info: LandingBookingInfo[];
  };
  nav: {
    linkSobre: string;
    linkEspecialidades: string;
    linkDepoimentos: string;
    ctaText: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
  activeSections?: {
    hero?: boolean;
    about?: boolean;
    specialties?: boolean;
    testimonials?: boolean;
    booking?: boolean;
    stats?: boolean;
    faq?: boolean;
    location?: boolean;
    cta?: boolean;
    social?: boolean;
    footer?: boolean;
  };
}

export interface PublicLandingData {
  name: string;
  specialty: string;
  slug: string;
  avatar: string | null;
  config: LandingConfig;
  reviews: {
    id: string;
    authorName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  defaultPrice: number;
  defaultDuration: number;
}
