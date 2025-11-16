import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

interface QualityOption {
  id: number;
  label: string;
  bitrate?: number;
  width?: number;
  height?: number;
}

interface QualitySelectorProps {
  options: QualityOption[];
  currentValue: number;
  onChange: (value: number) => void;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({ 
  options, 
  currentValue, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = options.find(opt => opt.id === currentValue);
  const displayLabel = currentOption?.label || 'Quality';

  return (
    <div className="quality-selector" ref={menuRef}>
      <button
        className="selector-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Quality settings"
      >
        {displayLabel}
      </button>
      <div className={`selector-menu ${isOpen ? 'active' : ''}`}>
        {options.map((option) => (
          <div
            key={option.id}
            className={`selector-menu-item ${option.id === currentValue ? 'active' : ''}`}
            onClick={() => {
              onChange(option.id);
              setIsOpen(false);
            }}
          >
            <span className="selector-menu-item-checkmark">
              {option.id === currentValue ? '✓' : ''}
            </span>
            <span>
              {option.label}
              {option.bitrate && ` (${Math.round(option.bitrate / 1000)} kbps)`}
              {option.width && option.height && ` (${option.width}×${option.height})`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualitySelector;
