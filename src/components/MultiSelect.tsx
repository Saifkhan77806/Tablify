import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { SelectOption } from '../types';

interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`min-h-[44px] w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors duration-200 ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map(option => (
                  <span
                    key={option.value}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(option.value);
                      }}
                      className="ml-1 p-0.5 hover:bg-blue-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-gray-500 text-center">No options found</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer transition-colors duration-150 ${
                    value.includes(option.value)
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleOption(option.value)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span>{option.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;