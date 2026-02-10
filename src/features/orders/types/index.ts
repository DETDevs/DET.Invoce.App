export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'Pasteles y Postres' | 'Panadería y Repostería' | 'Bebidas';
  subcategory: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  name: 'Pasteles y Postres' | 'Panadería y Repostería' | 'Bebidas';
  subcategories: string[];
}