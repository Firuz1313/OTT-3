import * as React from 'react';

interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  type?: 'hls' | 'dash' | 'mp4' | 'webm';
  thumbnail?: string;
  duration?: number;
}

interface PlaylistProps {
  items: PlaylistItem[];
  currentIndex: number;
  onPlayItem: (index: number) => void;
  isVisible: boolean;
  onClose: () => void;
}

const Playlist: React.FC<PlaylistProps> = ({ 
  items, 
  currentIndex, 
  onPlayItem, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="playlist-overlay" onClick={onClose}>
      <div className="playlist-panel" onClick={(e) => e.stopPropagation()}>
        <div className="playlist-header">
          <h3>Playlist</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="playlist-items">
          {items.map((item, index) => (
            <div 
              key={item.id}
              className={`playlist-item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onPlayItem(index)}
            >
              {item.thumbnail && (
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="playlist-item-thumbnail"
                />
              )}
              <div className="playlist-item-info">
                <div className="playlist-item-title">{item.title}</div>
                {item.duration && (
                  <div className="playlist-item-duration">
                    {formatTime(item.duration)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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

export default Playlist;