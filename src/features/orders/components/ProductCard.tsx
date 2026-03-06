import React, { useState } from "react";
import { Package } from "lucide-react";
import type { Product } from "@/features/orders/types/index";
import { getCurrencySymbol } from "@/shared/utils/currency";

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
  const initial = product.name?.charAt(0)?.toUpperCase() || "P";

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#E8BC6E] hover:shadow-md transition-all group overflow-hidden min-w-0"
    >
      <div className="relative h-28 sm:h-40 lg:h-44 overflow-hidden bg-gray-100">
        {!imgError && product.image ? (
          <img
            src={product.image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #FDF6E3 0%, #F5E6C8 50%, #EDD9B3 100%)",
            }}
          >
            <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/80 mb-0.5">
              <span className="text-base sm:text-2xl font-black text-[#593D31]">
                {initial}
              </span>
            </div>
            <Package size={11} className="text-[#C4A574] opacity-60" />
          </div>
        )}
      </div>
      <div className="px-1.5 py-1 sm:p-3">
        <h4 className="font-semibold text-[#2D2D2D] text-[11px] sm:text-sm leading-tight line-clamp-2">
          {product.name}
        </h4>
        {!hidePrice && (
          <span className="text-[#E8BC6E] font-bold text-[11px] sm:text-sm mt-0.5 block">
            {getCurrencySymbol()} {product.price}
          </span>
        )}
      </div>
    </div>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
