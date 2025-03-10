import { UpcitemdbApiResponse } from "./upcitemdb-api.response";

export interface UpcitemdbLookupResponse extends UpcitemdbApiResponse {
  ean: string;
  title: string;
  upc: string;
  gtin: string;
  asin: string;
  description: string;
  brand: string;
  model: string;
  dimension: string;
  weight: string;
  category: string;
  currency: string;
  lowest_recorded_price: number;
  highest_recorded_price: number;
  images: string[];
  offers: {
    merchant: string;
    domain: string;
    title: string;
    currency: string;
    list_price: number;
    price: number;
    shipping: string;
    condition: string;
    availability: string;
    link: string;
    updated_t: number;
  }[];
}
