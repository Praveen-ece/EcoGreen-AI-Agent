export type CarbonFootprint = "LOW" | "MEDIUM" | "HIGH";

export interface WebsiteAvailability {
  website: string;
  price: string;
  availability: string;
  link: string;
  seller: string;
  estimatedDelivery: string;
}

export interface Alternative {
  productName: string;
  estimatedCarbonFootprint: CarbonFootprint;
  material: string;
  manufacturingCountry: string;
  estimatedShippingImpact: string;
  packagingType: string;
  recyclability: string;
  durability: string;
  averagePrice: string;
  customerRating: string;
  availability: string;
  websiteAvailability: WebsiteAvailability[];
  reasonForRecommendation: string;
}

export interface ProductAnalysis {
  productAnalysis: {
    product: string;
    category: string;
    material: string;
    estimatedCarbonFootprint: CarbonFootprint;
    sustainabilityScore: number;
    environmentalConcerns: string[];
  };
  alternatives: Alternative[];
  bestChoice: {
    productName: string;
    explanation: string;
  };
  greenShoppingTips: string[];
  dataDisclaimer: string;
}
