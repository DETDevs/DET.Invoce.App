import { Card } from "@/shared/ui/Card";
import { Package } from "lucide-react";

export type TopProduct = {
  name: string;
  category: string;
  sold: number;
  stock: number;
  emoji: string;
};

export const TopSellerCard = ({ product }: { product: TopProduct }) => {
  const soldPercentage = product.stock > 0 ? (product.sold / product.stock) * 100 : 0;

  return (
    <Card className="flex flex-col justify-center relative overflow-hidden group h-full p-6">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Package size={100} className="text-[#E8BC6E]" />
      </div>
      <h3 className="text-lg font-medium text-[#2D2D2D] mb-6 z-10">
        Top 1: {product.category}
      </h3>
      <div className="flex items-center space-x-5 z-10">
        <div className="w-20 h-20 bg-[#F3EFE0] rounded-2xl flex items-center justify-center shadow-inner">
          <span className="text-3xl">{product.emoji}</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-[#593D31] block">{product.name}</span>
          <span className="text-sm text-gray-500">{product.sold} unidades vendidas</span>
        </div>
      </div>
      <div className="mt-6 z-10">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-[#E8BC6E] h-2 rounded-full" style={{ width: `${soldPercentage}%` }}></div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">{soldPercentage.toFixed(0)}% del stock vendido</p>
      </div>
    </Card>
  );
};