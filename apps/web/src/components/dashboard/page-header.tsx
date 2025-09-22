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
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 text-sm sm:text-base">{description}</p>
        )}
      </div>
      {buttonText && (
        <Button
          size="sm"
          onClick={onButtonClick}
          className="w-full sm:w-auto text-white hover:opacity-90"
          style={{ backgroundColor: '#15AD39' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
