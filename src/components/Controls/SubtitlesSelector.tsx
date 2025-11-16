import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  src?: string;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
}

interface SubtitlesSelectorProps {
  tracks: SubtitleTrack[];
  activeTrackId: string | null;
  onChange: (trackId: string | null) => void;
}

const SubtitlesSelector: React.FC<SubtitlesSelectorProps> = ({ 
  tracks, 
  activeTrackId, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = activeTrackId 
    ? tracks.find(track => track.id === activeTrackId)
    : null;
  const displayLabel = currentOption ? 'Captions' : 'Captions';

  return (
    <div className="subtitles-selector" ref={menuRef}>
      <button
        className="selector-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Captions and subtitles"
      >
        {displayLabel}
      </button>
      <div className={`selector-menu ${isOpen ? 'active' : ''}`}>
        <div
          className={`selector-menu-item ${!activeTrackId ? 'active' : ''}`}
          onClick={() => {
            onChange(null);
            setIsOpen(false);
          }}
        >
          <span className="selector-menu-item-checkmark">
            {!activeTrackId ? '✓' : ''}
          </span>
          <span>Off</span>
        </div>
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`selector-menu-item ${track.id === activeTrackId ? 'active' : ''}`}
            onClick={() => {
              onChange(track.id);
              setIsOpen(false);
            }}
          >
            <span className="selector-menu-item-checkmark">
              {track.id === activeTrackId ? '✓' : ''}
            </span>
            <span>
              {track.label} {track.language && `(${track.language})`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtitlesSelector;
