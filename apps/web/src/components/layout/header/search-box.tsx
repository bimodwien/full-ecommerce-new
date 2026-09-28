import React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import CategoryMenu from './category-menu';
import { HeaderSearch } from './use-header-search';

function CategoryTrigger({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 whitespace-nowrap rounded-l-full px-4 py-2 text-sm text-ink hover:bg-hairline-soft"
      aria-haspopup="listbox"
      aria-expanded="false"
    >
      <span className="font-medium truncate max-w-45">{label}</span>
      <ChevronDown size={16} className="text-mute" />
    </button>
  );
}

// Desktop search: category dropdown + debounced name input.
export default function SearchBox({ search }: { search: HeaderSearch }) {
  const trigger = <CategoryTrigger label={search.selectedCategoryLabel} />;
  return (
    <div className="hidden w-full max-w-3xl flex-1 items-center lg:flex">
      <div className="flex w-full items-stretch rounded-3xl bg-soft-cloud has-[input:focus]:bg-canvas has-[input:focus]:border-2 has-[input:focus]:border-ink has-[input:focus]:ring-4 has-[input:focus]:ring-soft-cloud transition-colors">
        <CategoryMenu
          search={search}
          trigger={trigger}
          contentClassName="max-h-80 w-64 overflow-auto rounded-none border-hairline"
        />
        <span className="my-2 h-6 w-px bg-hairline" />
        <input
          type="text"
          placeholder="Search for items..."
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder-mute outline-none"
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
        />
        <button
          type="button"
          className="px-4 text-ink hover:text-mute"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
