import * as React from 'react';

interface VolumeProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

const Volume: React.FC<VolumeProps> = ({ 
  volume, 
  isMuted, 
  onVolumeChange,
  onToggleMute
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C23.16 14.74 24 13.56 24 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      );
    }
    if (volume < 0.3) {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M7 9v6h4l5 5V4l-5 5H7z" />
        </svg>
      );
    }
    if (volume < 0.7) {
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M7 9v6h4l5 5V4l-5 5H7z" />
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M7 9v6h4l5 5V4l-5 5H7z" />
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19.5 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C23.16 14.74 24 13.56 24 12s-.84-2.74-2.03-3.84l-1.51 1.51c.34.82.54 1.7.54 2.64z" />
      </svg>
    );
  };

  return (
    <div className="volume-control">
      <button 
        className="mute-button" 
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        title={isMuted ? "Unmute (M)" : "Mute (M)"}
      >
        {getVolumeIcon()}
      </button>
      
      <div className="volume-slider-container">
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          aria-label="Volume control"
        />
        <span className="volume-percentage">
          {Math.round(isMuted ? 0 : volume * 100)}%
        </span>
      </div>
    </div>
  );
};

export default Volume;
