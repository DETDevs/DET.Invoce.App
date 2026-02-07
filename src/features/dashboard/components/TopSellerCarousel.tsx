import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { TopSellerCard, type TopProduct } from "./TopSellerCard";

const topProducts: TopProduct[] = [
  {
    name: "Red Velvet",
    category: "Pasteles",
    sold: 45,
    stock: 60,
    emoji: "🍰",
  },
  {
    name: "Croissant de Almendras",
    category: "Repostería",
    sold: 32,
    stock: 50,
    emoji: "🥐",
  },
  {
    name: "Café Latte",
    category: "Bebidas",
    sold: 60,
    stock: 100,
    emoji: "☕️",
  },
];

export const TopSellerCarousel = () => {
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

  return (
    <div className="relative group">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {topProducts.map((product, index) => (
            <div key={index} className="flex-shrink-0 flex-grow-0 basis-full min-w-0">
              <TopSellerCard product={product} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {topProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex ? 'bg-[#593D31]' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};