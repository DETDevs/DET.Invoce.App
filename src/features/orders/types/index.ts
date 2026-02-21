export interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  name: string;
  subcategories: string[];
}