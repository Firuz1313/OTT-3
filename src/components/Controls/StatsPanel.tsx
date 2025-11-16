import * as React from 'react';
import { formatBitrate } from '../../utils/measureBitrate';

interface StatsData {
  videoCodec?: string;
  audioCodec?: string;
  container?: string;
  currentBitrate?: number;
  inputBitrate?: number;
  frameRate?: number;
  bufferHealth?: number;
  resolution?: string;
  droppedFrames?: number;
  segmentTimeLeft?: number;
  currentSegment?: string;
  segmentPath?: string;
  networkSpeed?: number;
  // Analytics metrics
  analyticsMetrics?: {
    totalPlayTime?: number;
    totalBufferingTime?: number;
    totalSeekingCount?: number;
    totalVolumeChanges?: number;
    totalPlaybackRateChanges?: number;
    totalErrors?: number;
    eventCount?: number;
  };
  // Additional stats
  videoElementStats?: {
    width: number;
    height: number;
    readyState: number;
    networkState: number;
  };
  bufferingStats?: {
    totalBuffered: number;
    currentBufferStart?: number;
    currentBufferEnd?: number;
  };
  qualityStats?: {
    currentLevel: number;
    levelsCount: number;
  };
  playbackStats?: {
    playbackRate: number;
    volume: number;
    muted: boolean;
  };
}

interface StatsPanelProps {
  stats: StatsData;
  isVisible: boolean;
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="stats-panel-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={(e) => e.stopPropagation()}>
        <div className="stats-panel-header">
          <h3>Statistics for Nerds</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="stats-content">
          <div className="stats-grid">
            <StatItem label="Video Codec" value={stats.videoCodec || 'N/A'} />
            <StatItem label="Audio Codec" value={stats.audioCodec || 'N/A'} />
            <StatItem label="Container" value={stats.container || 'N/A'} />
            <StatItem label="Current Bitrate" value={stats.currentBitrate ? formatBitrate(stats.currentBitrate) : 'N/A'} />
            <StatItem label="Input Bitrate" value={stats.inputBitrate ? formatBitrate(stats.inputBitrate) : 'N/A'} />
            <StatItem label="Frame Rate" value={stats.frameRate ? `${stats.frameRate} FPS` : 'N/A'} />
            <StatItem label="Buffer Health" value={stats.bufferHealth ? `${stats.bufferHealth} ms` : 'N/A'} />
            <StatItem label="Resolution" value={stats.resolution || 'N/A'} />
            <StatItem label="Dropped Frames" value={stats.droppedFrames?.toString() || 'N/A'} />
            <StatItem label="Segment Time Left" value={stats.segmentTimeLeft ? `${stats.segmentTimeLeft.toFixed(2)}s` : 'N/A'} />
            <StatItem label="Current Segment" value={stats.currentSegment || 'N/A'} />
            <StatItem label="Segment Path" value={stats.segmentPath || 'N/A'} />
            <StatItem label="Network Speed" value={stats.networkSpeed ? formatBitrate(stats.networkSpeed) : 'N/A'} />
            
            {/* Analytics metrics */}
            {stats.analyticsMetrics && (
              <>
                <StatItem label="Total Play Time" value={stats.analyticsMetrics.totalPlayTime ? `${(stats.analyticsMetrics.totalPlayTime / 1000).toFixed(2)}s` : 'N/A'} />
                <StatItem label="Total Buffering Time" value={stats.analyticsMetrics.totalBufferingTime ? `${(stats.analyticsMetrics.totalBufferingTime / 1000).toFixed(2)}s` : 'N/A'} />
                <StatItem label="Total Seeks" value={stats.analyticsMetrics.totalSeekingCount?.toString() || 'N/A'} />
                <StatItem label="Volume Changes" value={stats.analyticsMetrics.totalVolumeChanges?.toString() || 'N/A'} />
                <StatItem label="Playback Rate Changes" value={stats.analyticsMetrics.totalPlaybackRateChanges?.toString() || 'N/A'} />
                <StatItem label="Errors" value={stats.analyticsMetrics.totalErrors?.toString() || 'N/A'} />
                <StatItem label="Events Tracked" value={stats.analyticsMetrics.eventCount?.toString() || 'N/A'} />
              </>
            )}
            
            {/* Additional stats */}
            {stats.videoElementStats && (
              <>
                <StatItem label="Video Width" value={`${stats.videoElementStats.width}px`} />
                <StatItem label="Video Height" value={`${stats.videoElementStats.height}px`} />
                <StatItem label="Ready State" value={getReadyStateText(stats.videoElementStats.readyState)} />
                <StatItem label="Network State" value={getNetworkStateText(stats.videoElementStats.networkState)} />
              </>
            )}
            
            {stats.bufferingStats && (
              <>
                <StatItem label="Total Buffered" value={`${stats.bufferingStats.totalBuffered.toFixed(2)}s`} />
                {stats.bufferingStats.currentBufferStart !== undefined && (
                  <StatItem label="Current Buffer Start" value={`${stats.bufferingStats.currentBufferStart.toFixed(2)}s`} />
                )}
                {stats.bufferingStats.currentBufferEnd !== undefined && (
                  <StatItem label="Current Buffer End" value={`${stats.bufferingStats.currentBufferEnd.toFixed(2)}s`} />
                )}
              </>
            )}
            
            {stats.qualityStats && (
              <>
                <StatItem label="Current Level" value={stats.qualityStats.currentLevel.toString()} />
                <StatItem label="Levels Count" value={stats.qualityStats.levelsCount.toString()} />
              </>
            )}
            
            {stats.playbackStats && (
              <>
                <StatItem label="Playback Rate" value={`${stats.playbackStats.playbackRate}x`} />
                <StatItem label="Volume" value={`${Math.round(stats.playbackStats.volume * 100)}%`} />
                <StatItem label="Muted" value={stats.playbackStats.muted ? 'Yes' : 'No'} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <div className="stat-item">
    <span className="stat-label">{label}:</span>
    <span className="stat-value">{value}</span>
  </div>
);

// Helper functions for readable state values
const getReadyStateText = (state: number): string => {
  switch (state) {
    case 0: return 'HAVE_NOTHING';
    case 1: return 'HAVE_METADATA';
    case 2: return 'HAVE_CURRENT_DATA';
    case 3: return 'HAVE_FUTURE_DATA';
    case 4: return 'HAVE_ENOUGH_DATA';
    default: return 'UNKNOWN';
  }
};

const getNetworkStateText = (state: number): string => {
  switch (state) {
    case 0: return 'NETWORK_EMPTY';
    case 1: return 'NETWORK_IDLE';
    case 2: return 'NETWORK_LOADING';
    case 3: return 'NETWORK_NO_SOURCE';
    default: return 'UNKNOWN';
  }
};

export default StatsPanel;