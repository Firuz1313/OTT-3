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

  const volumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  return (
    <div className="volume-control">
      <button 
        className="mute-button" 
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {volumeIcon()}
      </button>
      
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
  );
};

export default Volume;