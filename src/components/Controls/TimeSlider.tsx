import * as React from 'react';
import { formatTime } from '../../utils/formatTime';

interface TimeSliderProps {
  currentTime: number;
  duration: number;
  bufferedRanges?: { start: number; end: number }[];
  onSeek: (time: number) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ 
  currentTime, 
  duration, 
  bufferedRanges = [], 
  onSeek,
  onMouseMove,
  onMouseLeave
}) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  const getBufferedPercentages = (): { start: number; end: number }[] => {
    if (!bufferedRanges || bufferedRanges.length === 0) return [];
    
    return bufferedRanges.map(range => ({
      start: (range.start / duration) * 100,
      end: (range.end / duration) * 100
    }));
  };

  const bufferedPercentages = getBufferedPercentages();
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="time-slider-container">
      <span className="current-time">{formatTime(currentTime)}</span>
      
      <div className="time-slider-wrapper">
        <div className="time-slider-track">
          {bufferedPercentages.map((range, index) => (
            <div
              key={index}
              className="buffered-range"
              style={{
                left: `${range.start}%`,
                width: `${range.end - range.start}%`
              }}
            />
          ))}
          
          <div 
            className="progress-indicator"
            style={{ width: `${progressPercentage}%` }}
          />
          
          <input
            type="range"
            className="time-slider"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
          />
          
          <div 
            className="time-slider-overlay"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          />
        </div>
      </div>
      
      <span className="duration-time">{formatTime(duration)}</span>
    </div>
  );
};

export default TimeSlider;
