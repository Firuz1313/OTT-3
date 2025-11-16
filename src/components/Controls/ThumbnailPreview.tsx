import * as React from 'react';

interface ThumbnailPreviewProps {
  thumbnails: string[];
  currentTime: number;
  duration: number;
  isVisible: boolean;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ 
  thumbnails, 
  currentTime, 
  duration, 
  isVisible,
  onMouseMove,
  onMouseLeave
}) => {
  if (!isVisible || thumbnails.length === 0) return null;

  // Calculate which thumbnail to show based on current time
  const thumbnailIndex = Math.min(
    Math.floor((currentTime / duration) * thumbnails.length),
    thumbnails.length - 1
  );

  const thumbnailUrl = thumbnails[thumbnailIndex];

  return (
    <div 
      className="thumbnail-preview"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <img 
        src={thumbnailUrl} 
        alt={`Preview at ${currentTime.toFixed(1)}s`}
        className="thumbnail-image"
      />
      <div className="thumbnail-time">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

// Simple time formatting function
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default ThumbnailPreview;