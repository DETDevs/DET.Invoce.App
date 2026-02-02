import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
      <span className="text-sm text-gray-500 font-medium">
        Mostrando{" "}
        <span className="text-[#593D31] font-bold">
          {totalItems > 0 ? startItem : 0}
        </span>{" "}
        a <span className="text-[#593D31] font-bold">{endItem}</span> de
        <span className="text-[#593D31] font-bold">{totalItems}</span> productos
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
              currentPage === page
                ? "bg-[#E8BC6E] text-white shadow-md"
                : "text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
