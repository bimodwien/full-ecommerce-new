'use client';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-zinc-200 gap-4 ${className}`}
    >
      <div className="text-sm text-zinc-700 order-2 sm:order-1">
        Result {startItem}-{endItem} of {totalItems}
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-xs sm:text-sm"
        >
          Previous
        </Button>

        {getVisiblePages().map((page, index) =>
          page === '...' ? (
            <span key={index} className="text-zinc-400 px-2">
              ...
            </span>
          ) : (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`text-xs sm:text-sm ${currentPage === page ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-xs sm:text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
