import * as React from 'react';

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
  return (
    <div className="subtitles-selector">
      <label htmlFor="subtitles-select">Subtitles:</label>
      <select 
        id="subtitles-select"
        value={activeTrackId || ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Off</option>
        {tracks.map((track) => (
          <option key={track.id} value={track.id}>
            {track.label} {track.language && `(${track.language})`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubtitlesSelector;