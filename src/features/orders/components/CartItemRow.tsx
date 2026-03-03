import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/features/orders/types/index";
import { getCurrencySymbol } from "@/shared/utils/currency";

export const CartItemRow = ({
  item,
  onUpdateQuantity,
  onRemove,
  hidePrice,
}: {
  item: CartItem;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  hidePrice?: boolean;
}) => {
  const [imgError, setImgError] = useState(false);
  const initial = item.name?.charAt(0)?.toUpperCase() || "P";

  return (
    <div className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-xl group">
      {!imgError && item.image ? (
        <img
          src={item.image}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover border border-gray-100"
          alt={item.name}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg border border-[#E8BC6E]/30 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #FDF6E3 0%, #F5E6C8 100%)",
          }}
        >
          <span className="text-lg font-black text-[#593D31]">{initial}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#2D2D2D] text-sm truncate">
          {item.name}
        </h4>
        {!hidePrice && (
          <p className="text-[#E8BC6E] font-bold text-xs">
            {getCurrencySymbol()} {(item.price * item.quantity).toFixed(2)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.id, -1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
        >
          <Minus size={12} />
        </button>
        <span className="text-sm font-bold w-4 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
        >
          <Plus size={12} />
        </button>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
