import * as React from 'react';

interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onClick }) => {
  return (
    <button 
      className="play-button" 
      onClick={onClick}
      aria-label={isPlaying ? "Pause" : "Play"}
      title={isPlaying ? "Pause (K)" : "Play (K)"}
    >
      {isPlaying ? (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
};

export default PlayButton;
