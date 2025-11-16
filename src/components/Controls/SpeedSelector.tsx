import * as React from 'react';

interface SpeedSelectorProps {
  currentValue: number;
  onChange: (value: number) => void;
}

const SpeedSelector: React.FC<SpeedSelectorProps> = ({ 
  currentValue, 
  onChange 
}) => {
  const speedOptions = [
    { value: 0.25, label: '0.25×' },
    { value: 0.5, label: '0.5×' },
    { value: 0.75, label: '0.75×' },
    { value: 1, label: '1×' },
    { value: 1.25, label: '1.25×' },
    { value: 1.5, label: '1.5×' },
    { value: 1.75, label: '1.75×' },
    { value: 2, label: '2×' },
    { value: 3, label: '3×' }
  ];

  return (
    <div className="speed-selector">
      <label htmlFor="speed-select">Speed:</label>
      <select 
        id="speed-select"
        value={currentValue} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
      >
        {speedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SpeedSelector;