import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

type Props = {
  title: string;
  products: Product[];
  onAdd: (product: Product) => void;
};

export const ProductCarousel = ({ title, products, onAdd }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="w-full mb-8">
      <h3 className="text-lg font-bold text-[#2D2D2D] mb-4 px-1">{title}</h3>

      <div className="relative group">
        <button
          onClick={scrollPrev}
          disabled={!canPrev}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-md text-[#593D31] border border-gray-100 hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft size={20} />
        </button>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4 pb-4 px-1 touch-pan-y">
            {products.map((product) => (
              <div
                key={`${product.id}-${product.name}`}
                className="flex-shrink-0 w-[160px] snap-start"
              >
                <div
                  onClick={() => onAdd(product)}
                  className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm cursor-pointer hover:border-[#E8BC6E] hover:shadow-md transition-all group/card h-full flex flex-col"
                >
                  <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-gray-50 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      draggable={false}
                    />
                    <div className="absolute bottom-1 right-1 bg-white/90 p-1.5 rounded-lg shadow-sm text-[#593D31] opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <Plus size={14} />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-[#2D2D2D] text-sm truncate mb-1">
                      {product.name}
                    </h4>
                    <p className="font-bold text-[#E8BC6E] text-sm">
                      C$ {product.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollNext}
          disabled={!canNext}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-md text-[#593D31] border border-gray-100 hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
