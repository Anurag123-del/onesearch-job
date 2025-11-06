'use client';

import { useState } from 'react';

interface TagInputProps {
  value: { id: string; text: string }[];
  onChange: (value: { id: string; text: string }[]) => void;
  placeholder: string;
}

export default function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      event.preventDefault();
      onChange([...value, { id: inputValue, text: inputValue }]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <div key={index} className="bg-gray-200 text-gray-800 text-sm font-medium px-2.5 py-1.5 rounded flex items-center">
            {tag.text}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}
