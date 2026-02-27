import React, { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Product } from "@/features/orders/types/index";

interface ProductCardProps {
  product: Product;
  onClick: (p: Product) => void;
  hidePrice?: boolean;
}

const ProductCardComponent = ({
  product,
  onClick,
  hidePrice,
}: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#E8BC6E] hover:shadow-md transition-all group overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {!imgError && product.image ? (
          <img
            src={product.image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <ImageOff size={28} />
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-bold text-[#2D2D2D] text-sm leading-tight line-clamp-2">
          {product.name}
        </h4>
        {!hidePrice && (
          <span className="text-[#E8BC6E] font-bold text-sm mt-1 block">
            C$ {product.price}
          </span>
        )}
      </div>
    </div>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
