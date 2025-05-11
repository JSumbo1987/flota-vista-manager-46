import { useState } from "react";
import { Button } from "@/components/ui/button";

const Pagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }: {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        &lt;
      </Button>

      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <Button
            key={idx}
            variant={page === currentPage ? "default" : "outline"}
            className="w-8 h-8"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-sm text-muted-foreground">...</span>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        &gt;
      </Button>
    </div>
  );
};

export default Pagination;