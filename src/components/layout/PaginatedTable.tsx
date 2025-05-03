
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginatedTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: string | ((item: T) => React.ReactNode);
    className?: string;
  }[];
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

export function PaginatedTable<T extends Record<string, any>>({
  data,
  columns,
  itemsPerPage = 5,
  currentPage: controlledCurrentPage,
  onPageChange,
  totalItems: controlledTotalItems,
  isLoading = false,
  emptyStateMessage = "Nenhum item encontrado",
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(controlledCurrentPage || 1);
  const isControlled = controlledCurrentPage !== undefined;

  useEffect(() => {
    if (controlledCurrentPage !== undefined) {
      setCurrentPage(controlledCurrentPage);
    }
  }, [controlledCurrentPage]);

  const totalItems = controlledTotalItems || data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (!isControlled) {
      setCurrentPage(page);
    }
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Get current items
  const indexOfLastItem = isControlled ? itemsPerPage : currentPage * itemsPerPage;
  const indexOfFirstItem = isControlled ? 0 : indexOfLastItem - itemsPerPage;
  const currentItems = isControlled ? data : data.slice(indexOfFirstItem, indexOfLastItem);

  // Generate pagination
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if we have less than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // If we're at the beginning, show more pages after
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      // If we're at the end, show more pages before
      if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis1");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis2");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)} 
              />
            </PaginationItem>
          )}
          
          {pages.map((page, index) => (
            page === "ellipsis1" || page === "ellipsis2" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={index}>
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)} 
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {typeof column.accessor === "function"
                        ? column.accessor(item)
                        : item[column.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center mt-4">
          {renderPagination()}
        </div>
      )}
    </div>
  );
}

export default PaginatedTable;
