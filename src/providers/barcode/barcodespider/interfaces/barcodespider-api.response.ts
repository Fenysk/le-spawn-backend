export interface BarcodespiderApiResponse {
  item_response: ItemResponse;
  item_attributes: ItemAttributes;
  Stores: Store[];
}

export interface ItemResponse {
  code: number;
  status: string;
  message: string;
}

export interface ItemAttributes {
  title: string;
  upc: string;
  ean: string;
  parent_category: string;
  category: string;
  brand: string;
  model: string;
  mpn: string;
  manufacturer: string;
  publisher: string;
  asin: string;
  color: string;
  size: string;
  weight: string;
  image: string;
  is_adult: string;
  description: string;
  lowest_price: string;
  highest_price: string;
}

export interface Store {
  store_name: string;
  title: string;
  image: string;
  price: string;
  currency: string;
  link: string;
  updated: string;
}
