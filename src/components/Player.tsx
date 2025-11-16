import * as React from 'react';
import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Hls from 'hls.js';
import * as dashjs from 'dashjs';
import PlayButton from './Controls/PlayButton';
import { formatTime } from '../utils/formatTime';
import TimeSlider from './Controls/TimeSlider';
import Volume from './Controls/Volume';
import QualitySelector from './Controls/QualitySelector';
import SpeedSelector from './Controls/SpeedSelector';
import SubtitlesSelector from './Controls/SubtitlesSelector';
import StatsPanel from './Controls/StatsPanel';
import ThumbnailPreview from './Controls/ThumbnailPreview';
import SegmentVisualization from './Controls/SegmentVisualization';
import Playlist from './Controls/Playlist';
import { HlsEngine } from './Engine/HlsEngine';
import { Analytics } from './Engine/Analytics';
import { fetchHlsSegments, fetchDashSegments } from '../utils/fetchSegments';
// Import FFmpeg functions
import { loadFFmpeg, generateThumbnails, getVideoInfo, transcodeToWebM, extractKeyFrames, mergeVideos } from './FFmpeg/ffmpeg-worker';

interface PlayerProps {
  src: string;
  type?: 'hls' | 'dash' | 'auto';
  subtitles?: { id: string; label: string; language: string; src: string }[];
  playlist?: {
    items: {
      id: string;
      title: string;
      url: string;
      type?: 'hls' | 'dash' | 'mp4' | 'webm';
      thumbnail?: string;
      duration?: number;
    }[];
    currentIndex: number;
  };
}

export interface PlayerAPI {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setQuality: (level: number) => void;
  setSpeed: (rate: number) => void;
  getStats: () => any;
  getCodecs: () => { video: string; audio: string };
  getCurrentChunk: () => any;
  getBufferedRanges: () => { start: number; end: number }[];
  captureFrame: () => string | null;
  exportSegment: (start: number, end: number) => Promise<Blob | null>;
  enterPictureInPicture: () => Promise<void>;
  exitPictureInPicture: () => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
  // FFmpeg enhanced methods
  getVideoInfo: () => Promise<any>;
  transcodeToWebM: () => Promise<Blob | null>;
  extractKeyFrames: () => Promise<string[] | null>;
}

const Player = forwardRef<PlayerAPI, PlayerProps>((props, ref) => {
  const { src, type = 'auto', subtitles = [], playlist } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [bufferedRanges, setBufferedRanges] = useState<{ start: number; end: number }[]>([]);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(false);
  const [statsData, setStatsData] = useState({});
  const [viewMode, setViewMode] = useState<'normal' | 'theater' | 'cinema' | 'mini'>('normal');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(false);
  const [thumbnailTime, setThumbnailTime] = useState(0);
  const [segments, setSegments] = useState<any[]>([]);
  const [isAutoQuality, setIsAutoQuality] = useState(true);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(playlist?.currentIndex || 0);
  const hlsRef = useRef<Hls | null>(null);
  const hlsEngineRef = useRef<HlsEngine | null>(null);
  const dashRef = useRef<dashjs.MediaPlayerClass | null>(null);
  const analyticsRef = useRef<Analytics | null>(null);
  const currentSourceRef = useRef<string>(src);

  // Get current source based on playlist or direct src
  const getCurrentSource = () => {
    if (playlist && playlist.items.length > 0) {
      return playlist.items[currentPlaylistIndex].url;
    }
    return src;
  };

  // Get current type based on playlist or direct type
  const getCurrentType = () => {
    if (playlist && playlist.items.length > 0) {
      return playlist.items[currentPlaylistIndex].type || 'auto';
    }
    return type;
  };

  // Expose API methods
  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    },
    
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    
    setQuality: (level: number) => {
      // Implementation depends on the streaming engine
      if (hlsEngineRef.current) {
        hlsEngineRef.current.setCurrentLevel(level);
        setIsAutoQuality(level === -1);
      } else if (hlsRef.current) {
        hlsRef.current.currentLevel = level;
      } else if (dashRef.current) {
        // DASH quality setting would go here
        // dashRef.current.updateSettings({ ... });
      }
    },
    
    setSpeed: (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
      }
    },
    
    getStats: () => {
      // Return current player stats
      const baseStats = {
        currentTime,
        duration,
        volume,
        isMuted,
        isPlaying,
        playbackRate,
        bufferedRanges
      };
      
      // Add HLS-specific stats if available
      if (hlsEngineRef.current) {
        return {
          ...baseStats,
          currentBitrate: hlsEngineRef.current.getCurrentBitrate(),
          droppedFrames: hlsEngineRef.current.getDroppedFrames(),
          autoQuality: hlsEngineRef.current.getAutoQuality()
        };
      }
      
      return baseStats;
    },
    
    getCodecs: () => {
      // Return video and audio codecs
      return {
        video: 'unknown',
        audio: 'unknown'
      };
    },
    
    getCurrentChunk: () => {
      // Return current chunk information
      return {
        time: currentTime,
        // Additional chunk info would be implementation-specific
      };
    },
    
    getBufferedRanges: () => {
      return bufferedRanges;
    },
    
    captureFrame: () => {
      if (!videoRef.current) return null;
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      }
      
      return null;
    },
    
    exportSegment: async (start: number, end: number) => {
      // This would integrate with FFmpeg functionality
      // For now, we'll return null
      return null;
    },
    
    enterPictureInPicture: async () => {
      if (videoRef.current && 'pictureInPictureElement' in document) {
        try {
          await videoRef.current.requestPictureInPicture();
          setIsPictureInPicture(true);
        } catch (error) {
          console.error('Failed to enter Picture-in-Picture mode:', error);
        }
      }
    },
    
    exitPictureInPicture: async () => {
      if (document.pictureInPictureElement && 'exitPictureInPicture' in document) {
        try {
          await document.exitPictureInPicture();
          setIsPictureInPicture(false);
        } catch (error) {
          console.error('Failed to exit Picture-in-Picture mode:', error);
        }
      }
    },
    
    playNext: () => {
      if (playlist && playlist.items.length > 0) {
        const nextIndex = (currentPlaylistIndex + 1) % playlist.items.length;
        setCurrentPlaylistIndex(nextIndex);
      }
    },
    
    playPrevious: () => {
      if (playlist && playlist.items.length > 0) {
        const prevIndex = (currentPlaylistIndex - 1 + playlist.items.length) % playlist.items.length;
        setCurrentPlaylistIndex(prevIndex);
      }
    },
    
    // FFmpeg enhanced methods
    getVideoInfo: async () => {
      // This would integrate with FFmpeg functionality
      // For now, we'll return a mock response
      return {
        format: 'mp4',
        duration: 120,
        bitrate: 2500000,
        video: {
          codec: 'h264',
          width: 1920,
          height: 1080,
          fps: 30
        },
        audio: {
          codec: 'aac',
          channels: 2,
          sampleRate: 44100
        }
      };
    },
    
    transcodeToWebM: async () => {
      // This would integrate with FFmpeg functionality
      // For now, we'll return null
      return null;
    },
    
    extractKeyFrames: async () => {
      // This would integrate with FFmpeg functionality
      // For now, we'll return null
      return null;
    }
  }));

  // Keyboard shortcuts handler
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    switch (e.key) {
      case ' ':
        // Spacebar - Play/Pause
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        // Left arrow - Seek backward 5 seconds
        e.preventDefault();
        handleSeek(Math.max(0, video.currentTime - 5));
        break;
      case 'ArrowRight':
        // Right arrow - Seek forward 5 seconds
        e.preventDefault();
        handleSeek(Math.min(video.duration, video.currentTime + 5));
        break;
      case 'ArrowUp':
        // Up arrow - Volume up
        e.preventDefault();
        handleVolumeChange(Math.min(1, video.volume + 0.1));
        break;
      case 'ArrowDown':
        // Down arrow - Volume down
        e.preventDefault();
        handleVolumeChange(Math.max(0, video.volume - 0.1));
        break;
      case 'm':
      case 'M':
        // M - Toggle mute
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
      case 'F':
        // F - Toggle fullscreen
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'i':
      case 'I':
        // I - Toggle Picture-in-Picture
        e.preventDefault();
        togglePictureInPicture();
        break;
      case 'k':
      case 'K':
        // K - Play/Pause (YouTube-style)
        e.preventDefault();
        togglePlay();
        break;
      case 'j':
      case 'J':
        // J - Seek backward 10 seconds (YouTube-style)
        e.preventDefault();
        handleSeek(Math.max(0, video.currentTime - 10));
        break;
      case 'l':
      case 'L':
        // L - Seek forward 10 seconds (YouTube-style)
        e.preventDefault();
        handleSeek(Math.min(video.duration, video.currentTime + 10));
        break;
      case 'n':
      case 'N':
        // N - Play next item in playlist
        e.preventDefault();
        if (playlist && playlist.items.length > 0) {
          const nextIndex = (currentPlaylistIndex + 1) % playlist.items.length;
          setCurrentPlaylistIndex(nextIndex);
        }
        break;
      case 'p':
      case 'P':
        // P - Play previous item in playlist
        e.preventDefault();
        if (playlist && playlist.items.length > 0) {
          const prevIndex = (currentPlaylistIndex - 1 + playlist.items.length) % playlist.items.length;
          setCurrentPlaylistIndex(prevIndex);
        }
        break;
      default:
        break;
    }
  };

  // Fetch segments for visualization
  const fetchSegments = async (source: string, streamType: string) => {
    try {
      let segmentData: any[] = [];

      if (streamType === 'hls') {
        segmentData = await fetchHlsSegments(source);
      } else if (streamType === 'dash') {
        segmentData = await fetchDashSegments(source);
      }

      setSegments(segmentData);
    } catch (error) {
      console.warn('Segment visualization unavailable:', error);
      setSegments([]);
    }
  };

  // Generate thumbnails using FFmpeg
  const generateVideoThumbnails = async (source: string) => {
    try {
      const mockThumbnails: string[] = [];
      for (let i = 0; i < 5; i++) {
        mockThumbnails.push(`https://picsum.photos/320/180?random=${i}`);
      }
      setThumbnails(mockThumbnails);
    } catch (error) {
      console.warn('Thumbnail generation skipped:', error);
      setThumbnails([]);
    }
  };

  // Initialize player
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleProgress = () => {
      const ranges = [];
      for (let i = 0; i < video.buffered.length; i++) {
        ranges.push({
          start: video.buffered.start(i),
          end: video.buffered.end(i)
        });
      }
      setBufferedRanges(ranges);
    };

    const handleEnterPiP = () => {
      setIsPictureInPicture(true);
    };

    const handleLeavePiP = () => {
      setIsPictureInPicture(false);
    };

    const handleEnded = () => {
      // Auto-play next item in playlist
      if (playlist && playlist.items.length > 0) {
        const nextIndex = (currentPlaylistIndex + 1) % playlist.items.length;
        setCurrentPlaylistIndex(nextIndex);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ended', handleEnded);
    
    // Picture-in-Picture events
    if ('pictureInPictureEnabled' in document) {
      video.addEventListener('enterpictureinpicture', handleEnterPiP);
      video.addEventListener('leavepictureinpicture', handleLeavePiP);
    }

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    // Initialize analytics
    analyticsRef.current = new Analytics();
    analyticsRef.current.init(video);

    // Auto-detect stream type if not specified
    let detectedType = getCurrentType();
    const currentSrc = getCurrentSource();
    currentSourceRef.current = currentSrc;
    
    if (detectedType === 'auto') {
      if (currentSrc.endsWith('.m3u8')) {
        detectedType = 'hls';
      } else if (currentSrc.endsWith('.mpd')) {
        detectedType = 'dash';
      }
    }

    // Fetch segments for visualization
    fetchSegments(currentSrc, detectedType);
    
    // Generate thumbnails
    generateVideoThumbnails(currentSrc);

    // Initialize appropriate engine
    if (detectedType === 'hls') {
      if (Hls.isSupported()) {
        hlsEngineRef.current = new HlsEngine();
        hlsEngineRef.current.loadSource(currentSrc, video);
      } else {
        // Fallback to native HLS support (Safari)
        video.src = currentSrc;
      }
    } else if (detectedType === 'dash') {
      dashRef.current = dashjs.MediaPlayer().create();
      dashRef.current.initialize(video, currentSrc, false);
    } else {
      // Native HTML5 video for MP4, WebM, etc.
      video.src = currentSrc;
    }

    // Add subtitle tracks
    subtitles.forEach((subtitle) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = subtitle.label;
      track.srclang = subtitle.language;
      track.src = subtitle.src;
      track.id = subtitle.id;
      video.appendChild(track);
    });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ended', handleEnded);
      
      if ('pictureInPictureEnabled' in document) {
        video.removeEventListener('enterpictureinpicture', handleEnterPiP);
        video.removeEventListener('leavepictureinpicture', handleLeavePiP);
      }
      
      // Remove keyboard event listener
      document.removeEventListener('keydown', handleKeyDown);
      
      // Destroy analytics
      if (analyticsRef.current) {
        analyticsRef.current.destroy();
      }
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      if (hlsEngineRef.current) {
        hlsEngineRef.current.destroy();
      }
      
      if (dashRef.current) {
        dashRef.current.destroy();
      }
    };
  }, [src, type, subtitles, playlist, currentPlaylistIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (vol: number) => {
    if (videoRef.current) {
      videoRef.current.volume = vol;
      if (vol > 0) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleSubtitleChange = (trackId: string | null) => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].id === trackId ? 'showing' : 'hidden';
      }
      setActiveSubtitle(trackId);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const togglePictureInPicture = () => {
    if (!videoRef.current) return;
    
    if (isPictureInPicture) {
      if (document.exitPictureInPicture) {
        document.exitPictureInPicture();
      }
    } else {
      if (videoRef.current.requestPictureInPicture) {
        videoRef.current.requestPictureInPicture();
      }
    }
  };

  const toggleTheaterMode = () => {
    setViewMode(viewMode === 'theater' ? 'normal' : 'theater');
  };

  const toggleCinemaMode = () => {
    setViewMode(viewMode === 'cinema' ? 'normal' : 'cinema');
  };

  const toggleMiniPlayer = () => {
    setViewMode(viewMode === 'mini' ? 'normal' : 'mini');
  };

  const handleTimeSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const time = position * duration;
    
    setThumbnailTime(time);
    setIsThumbnailVisible(true);
  };

  const handleTimeSliderMouseLeave = () => {
    setIsThumbnailVisible(false);
  };

  const handleSegmentClick = (segment: any) => {
    handleSeek(segment.start);
  };

  const handleQualityChange = (level: number) => {
    if (hlsEngineRef.current) {
      hlsEngineRef.current.setCurrentLevel(level);
      setIsAutoQuality(level === -1);
    } else if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  const toggleAutoQuality = () => {
    const newAutoQuality = !isAutoQuality;
    setIsAutoQuality(newAutoQuality);
    
    if (hlsEngineRef.current) {
      hlsEngineRef.current.setAutoQuality(newAutoQuality);
    } else if (hlsRef.current) {
      hlsRef.current.nextLevel = newAutoQuality ? -1 : hlsRef.current.currentLevel;
    }
  };

  const handlePlayItem = (index: number) => {
    setCurrentPlaylistIndex(index);
    setIsPlaylistVisible(false);
  };

  // Quality options (simplified for now)
  const qualityOptions = [
    { id: -1, label: 'Auto' },
    { id: 0, label: '240p' },
    { id: 1, label: '360p' },
    { id: 2, label: '480p' },
    { id: 3, label: '720p' },
    { id: 4, label: '1080p' }
  ];

  // Determine player class based on view mode
  const getPlayerClass = () => {
    let classes = 'video-player';
    if (isFullscreen) classes += ' fullscreen';
    if (viewMode === 'theater') classes += ' theater-mode';
    if (viewMode === 'cinema') classes += ' cinema-mode';
    if (viewMode === 'mini') classes += ' mini-player';
    return classes;
  };

  // Update stats data periodically
  useEffect(() => {
    const updateStats = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Get base stats
        const baseStats = {
          currentTime,
          duration,
          volume,
          isMuted,
          isPlaying,
          playbackRate,
          bufferedRanges
        };
        
        // Add video element stats
        const videoElementStats = {
          width: video.videoWidth,
          height: video.videoHeight,
          readyState: video.readyState,
          networkState: video.networkState
        };
        
        // Add buffering stats
        let totalBuffered = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          totalBuffered += video.buffered.end(i) - video.buffered.start(i);
        }
        
        const bufferingStats = {
          totalBuffered
        };
        
        // Add playback stats
        const playbackStats = {
          playbackRate: video.playbackRate,
          volume: video.volume,
          muted: video.muted
        };
        
        // Add analytics metrics if available
        let analyticsMetrics = {};
        if (analyticsRef.current) {
          analyticsMetrics = analyticsRef.current.getMetrics();
        }
        
        // Combine all stats
        const allStats = {
          ...baseStats,
          videoElementStats,
          bufferingStats,
          playbackStats,
          analyticsMetrics
        };
        
        setStatsData(allStats);
      }
    };
    
    // Update stats every second
    const interval = setInterval(updateStats, 1000);
    
    // Initial update
    updateStats();
    
    return () => {
      clearInterval(interval);
    };
  }, [currentTime, duration, volume, isMuted, isPlaying, playbackRate, bufferedRanges]);

  return (
    <div className={getPlayerClass()}>
      <video 
        ref={videoRef} 
        className="video-element"
        playsInline
        src={getCurrentSource()}
        onLoadStart={() => console.log('Video load started')}
        onLoadedData={() => console.log('Video data loaded')}
        onError={(e) => console.log('Video error:', e)}
      />
      
      <div className="player-controls visible">
        <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
        
        <TimeSlider 
          currentTime={currentTime}
          duration={duration}
          bufferedRanges={bufferedRanges}
          onSeek={handleSeek}
          onMouseMove={handleTimeSliderMouseMove}
          onMouseLeave={handleTimeSliderMouseLeave}
        />
        
        <Volume 
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
        
        <QualitySelector 
          options={qualityOptions}
          currentValue={isAutoQuality ? -1 : 0}
          onChange={handleQualityChange}
        />
        
        <button 
          className={`auto-quality-button ${isAutoQuality ? 'active' : ''}`}
          onClick={toggleAutoQuality}
        >
          ABR
        </button>
        
        <SpeedSelector 
          currentValue={playbackRate}
          onChange={handlePlaybackRateChange}
        />
        
        {subtitles.length > 0 && (
          <SubtitlesSelector 
            tracks={subtitles}
            activeTrackId={activeSubtitle}
            onChange={handleSubtitleChange}
          />
        )}
        
        <button className="stats-button" onClick={() => setIsStatsVisible(true)}>
          Stats
        </button>
        
        {playlist && playlist.items.length > 0 && (
          <button className="playlist-button" onClick={() => setIsPlaylistVisible(true)}>
            Playlist
          </button>
        )}
        
        <button className="pip-button" onClick={togglePictureInPicture}>
          {isPictureInPicture ? 'Exit PiP' : 'PiP'}
        </button>
        
        <button className="view-mode-button" onClick={toggleTheaterMode}>
          {viewMode === 'theater' ? 'Normal' : 'Theater'}
        </button>
        
        <button className="view-mode-button" onClick={toggleCinemaMode}>
          {viewMode === 'cinema' ? 'Normal' : 'Cinema'}
        </button>
        
        <button className="view-mode-button" onClick={toggleMiniPlayer}>
          {viewMode === 'mini' ? 'Normal' : 'Mini'}
        </button>
        
        <button className="fullscreen-button" onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
      
      <SegmentVisualization
        segments={segments}
        duration={duration}
        currentTime={currentTime}
        bufferedRanges={bufferedRanges}
        onSegmentClick={handleSegmentClick}
      />
      
      <ThumbnailPreview
        thumbnails={thumbnails}
        currentTime={thumbnailTime}
        duration={duration}
        isVisible={isThumbnailVisible}
        onMouseMove={handleTimeSliderMouseMove}
        onMouseLeave={handleTimeSliderMouseLeave}
      />
      
      <StatsPanel 
        stats={statsData}
        isVisible={isStatsVisible}
        onClose={() => setIsStatsVisible(false)}
      />
      
      {playlist && (
        <Playlist
          items={playlist.items}
          currentIndex={currentPlaylistIndex}
          onPlayItem={handlePlayItem}
          isVisible={isPlaylistVisible}
          onClose={() => setIsPlaylistVisible(false)}
        />
      )}
    </div>
  );
});

export default Player;
