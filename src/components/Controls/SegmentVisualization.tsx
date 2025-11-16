import * as React from 'react';
import { getSegmentColor } from '../../utils/fetchSegments';

interface Segment {
  url: string;
  start: number;
  end: number;
  duration: number;
  size: number;
  bitrate: number;
}

interface SegmentVisualizationProps {
  segments: Segment[];
  duration: number;
  currentTime: number;
  bufferedRanges: { start: number; end: number }[];
  onSegmentClick?: (segment: Segment) => void;
}

const SegmentVisualization: React.FC<SegmentVisualizationProps> = ({ 
  segments, 
  duration, 
  currentTime,
  bufferedRanges,
  onSegmentClick 
}) => {
  if (segments.length === 0 || duration <= 0) return null;

  // Calculate the width of each segment as a percentage
  const segmentElements = segments.map((segment, index) => {
    const width = (segment.duration / duration) * 100;
    const left = (segment.start / duration) * 100;
    const color = getSegmentColor(segment.bitrate);
    const isCurrent = currentTime >= segment.start && currentTime <= segment.end;
    
    // Check if this segment is buffered
    const isBuffered = bufferedRanges.some(range => 
      segment.start >= range.start && segment.end <= range.end
    );
    
    return (
      <div
        key={index}
        className={`segment ${isCurrent ? 'current' : ''} ${isBuffered ? 'buffered' : ''}`}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          backgroundColor: color,
        }}
        onClick={() => onSegmentClick?.(segment)}
        title={`Segment ${index + 1}: ${Math.round(segment.bitrate / 1000)}k bps, ${segment.size} bytes, ${segment.duration.toFixed(2)}s`}
      >
        <div className="segment-info">
          {Math.round(segment.bitrate / 1000)}k
        </div>
      </div>
    );
  });

  return (
    <div className="segment-visualization">
      <div className="segments-container">
        {segmentElements}
      </div>
      <div className="segment-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
          <span>Low bitrate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FFEB3B' }}></div>
          <span>Medium bitrate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
          <span>High bitrate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
          <span>Very high bitrate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
          <span>Current segment</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#9C27B0' }}></div>
          <span>Buffered</span>
        </div>
      </div>
    </div>
  );
};

export default SegmentVisualization;