import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HeaderSearch } from './use-header-search';

type Props = {
  search: HeaderSearch;
  trigger: React.ReactNode;
  contentClassName: string;
};

// Category picker used by both the search box and "Browse All Categories".
export default function CategoryMenu({
  search,
  trigger,
  contentClassName,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={contentClassName}>
        <DropdownMenuItem onClick={() => search.selectCategory(null)}>
          All Categories
        </DropdownMenuItem>
        {search.categories.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => search.selectCategory(c.id)}
          >
            {c.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
