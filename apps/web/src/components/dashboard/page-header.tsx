'use client';
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const PageHeader = ({
  title,
  description,
  buttonText,
  onButtonClick,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-800">{title}</h1>
        {description && (
          <p className="text-zinc-700 text-sm sm:text-base">{description}</p>
        )}
      </div>
      {buttonText && (
        <Button
          size="sm"
          onClick={onButtonClick}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
