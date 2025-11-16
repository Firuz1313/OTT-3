import * as React from 'react';

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
  return (
    <div className="quality-selector">
      <label htmlFor="quality-select">Quality:</label>
      <select 
        id="quality-select"
        value={currentValue} 
        onChange={(e) => onChange(parseInt(e.target.value))}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
            {option.bitrate && ` (${Math.round(option.bitrate / 1000)} kbps)`}
            {option.width && option.height && ` (${option.width}×${option.height})`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default QualitySelector;