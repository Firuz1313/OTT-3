import * as React from 'react';

interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onClick }) => {
  return (
    <button className="play-button" onClick={onClick}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
  );
};

export default PlayButton;