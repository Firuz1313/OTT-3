import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

interface SpeedSelectorProps {
  currentValue: number;
  onChange: (value: number) => void;
}

const SpeedSelector: React.FC<SpeedSelectorProps> = ({ 
  currentValue, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const speedOptions = [
    { value: 0.25, label: '0.25×' },
    { value: 0.5, label: '0.5×' },
    { value: 0.75, label: '0.75×' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25×' },
    { value: 1.5, label: '1.5×' },
    { value: 1.75, label: '1.75×' },
    { value: 2, label: '2×' },
    { value: 3, label: '3×' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = speedOptions.find(opt => Math.abs(opt.value - currentValue) < 0.01);
  const displayLabel = currentOption?.label || `${currentValue}×`;

  return (
    <div className="speed-selector" ref={menuRef}>
      <button
        className="selector-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Playback speed"
      >
        {displayLabel}
      </button>
      <div className={`selector-menu ${isOpen ? 'active' : ''}`}>
        {speedOptions.map((option) => (
          <div
            key={option.value}
            className={`selector-menu-item ${Math.abs(option.value - currentValue) < 0.01 ? 'active' : ''}`}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            <span className="selector-menu-item-checkmark">
              {Math.abs(option.value - currentValue) < 0.01 ? '✓' : ''}
            </span>
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeedSelector;
