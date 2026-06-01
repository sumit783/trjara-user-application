'use client';

import React from 'react';

interface VariantSelectorProps {
  optionsMap: Record<string, Set<string>>;
  selectedOptions: Record<string, string>;
  onSelectOption: (key: string, value: string) => void;
}

export function VariantSelector({
  optionsMap,
  selectedOptions,
  onSelectOption,
}: VariantSelectorProps) {
  if (Object.keys(optionsMap).length === 0) return null;

  return (
    <div className="space-y-4 pt-2">
      {Object.entries(optionsMap).map(([key, values]) => (
        <div key={key}>
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-2">
            Select {key}:
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(values).map((v) => (
              <button
                key={v}
                onClick={() => onSelectOption(key, v)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                  selectedOptions[key] === v
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-border bg-white text-foreground hover:border-gray-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
