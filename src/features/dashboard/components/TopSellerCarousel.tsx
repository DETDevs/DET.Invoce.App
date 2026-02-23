import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { TopSellerCard, type TopProduct } from "./TopSellerCard";
import type { TTopProductByCategory } from "@/api/dashboard/types";

interface TopSellerCarouselProps {
  topProducts: TTopProductByCategory[];
  loading?: boolean;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Pasteles: "🍰",
  Repostería: "🥐",
  Bebidas: "☕️",
  Panes: "🍞",
  Postres: "🧁",
};

export const TopSellerCarousel = ({
  topProducts,
  loading,
}: TopSellerCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const mapped: TopProduct[] = topProducts.map((p) => ({
    name: p.productName,
    category: p.categoryName,
    sold: p.totalSold,
    stock: 100,
    emoji: CATEGORY_EMOJIS[p.categoryName] || "📦",
  }));

  if (loading) {
    return (
      <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#E8BC6E] border-r-transparent"></div>
      </div>
    );
  }

  if (mapped.length === 0) {
    return (
      <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-400 text-sm">Sin datos de ventas hoy</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {mapped.map((product, index) => (
            <div key={index} className="shrink-0 grow-0 basis-full min-w-0">
              <TopSellerCard product={product} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {mapped.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex
                ? "bg-[#593D31]"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
