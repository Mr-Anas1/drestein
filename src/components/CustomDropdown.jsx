"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ value, onChange, options, label, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="relative min-w-[280px]" ref={dropdownRef}>
      {label && (
        <label className="block text-white font-audiowide text-xs mb-2 text-center">
          {label}
        </label>
      )}
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background-soft border-2 border-border text-white px-4 py-3 rounded-xl font-space text-sm focus:outline-none focus:border-secondary hover:border-secondary transition-all duration-300 cursor-pointer flex items-center justify-between group"
      >
        <span className="flex-1 text-left">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.short && (
                <span className="text-primary font-audiowide">{selectedOption.short}</span>
              )}
              <span>{selectedOption.name}</span>
            </span>
          ) : (
            <span className="text-muted-text">{placeholder}</span>
          )}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-xl shadow-2xl shadow-primary/20 max-h-[400px] overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left font-space text-sm transition-all duration-200 flex items-center gap-2 ${
                value === option.id
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border-l-4 border-primary'
                  : 'text-muted-text hover:bg-background-soft hover:text-white'
              }`}
            >
              {option.short && (
                <span className={`font-audiowide text-xs ${
                  value === option.id ? 'text-primary' : 'text-secondary'
                }`}>
                  {option.short}
                </span>
              )}
              <span className="flex-1">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
