import React from "react";
import type { Product } from "../types/index";

interface ProductCardProps {
  product: Product;
  onClick: (p: Product) => void;
}

const ProductCardComponent = ({
  product,
  onClick,
}: ProductCardProps) => (
  <div
    onClick={() => onClick(product)}
    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:border-[#E8BC6E] transition-all"
  >
    <img
      src={product.image}
      className="h-24 sm:h-32 w-full object-cover rounded-xl mb-3"
      alt={product.name}
    />
    <h4 className="font-bold text-[#2D2D2D] text-sm">{product.name}</h4>
    <span className="text-[#E8BC6E] font-bold text-sm">C$ {product.price}</span>
  </div>
);

export const ProductCard = React.memo(ProductCardComponent);
