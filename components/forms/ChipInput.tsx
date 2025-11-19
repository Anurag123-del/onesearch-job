'use client';

import React, { useState, KeyboardEvent } from 'react';

type Chip = {
  id: string;
  text: string;
};

type ChipInputProps = {
  value: Chip[];
  onChange: (chips: Chip[]) => void;
  placeholder: string;
};

const ChipInput: React.FC<ChipInputProps> = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === ',' || event.key === 'Enter') && inputValue.trim() !== '') {
      event.preventDefault();
      const newChip: Chip = { id: inputValue.trim(), text: inputValue.trim() };
      if (!value.find(chip => chip.text === newChip.text)) {
        onChange([...value, newChip]);
      }
      setInputValue('');
    } else if (event.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, value.length - 1));
    }
  };

  const removeChip = (chipToRemove: Chip) => {
    onChange(value.filter(chip => chip.id !== chipToRemove.id));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-2 border rounded">
        {value.map(chip => (
          <div key={chip.id} className="flex items-center bg-blue-500 text-white rounded-full px-3 py-1">
            <span>{chip.text}</span>
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="ml-2 text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow p-1 bg-transparent focus:outline-none"
        />
      </div>
    </div>
  );
};

export default ChipInput;
