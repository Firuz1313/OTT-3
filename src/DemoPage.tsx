import * as React from 'react';
import './styles/demoPage.css';
import Player from './components/Player';
import VideoProcessorDemo from './components/FFmpeg/VideoProcessorDemo';

const DemoPage: React.FC = () => {
  const playerRef = React.useRef<any>(null);
  const defaultVideoUrl = 'http://ant-tv.ddns.net/vod/hls/lun4/KINOTK/Ona.skazala.mojet.bit.2025.WEB-DL.1080p/master.m3u8';
  const [customUrl, setCustomUrl] = React.useState(defaultVideoUrl);
  const [currentUrl, setCurrentUrl] = React.useState(defaultVideoUrl);
  const [autoPlay, setAutoPlay] = React.useState(true);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    
    if (urlParam) {
      const decodedUrl = decodeURIComponent(urlParam);
      setCurrentUrl(decodedUrl);
      setCustomUrl(decodedUrl);
      setAutoPlay(true);
    }
  }, []);

  const samplePlaylist = {
    items: [
      {
        id: '1',
        title: 'Она сказала может быть (2025)',
        url: 'http://ant-tv.ddns.net/vod/hls/lun4/KINOTK/Ona.skazala.mojet.bit.2025.WEB-DL.1080p/master.m3u8',
        type: 'hls' as const,
        thumbnail: 'https://example.com/thumb1.jpg',
        duration: 0
      },
      {
        id: '2',
        title: 'Sample Video 2',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'mp4' as const,
        thumbnail: 'https://example.com/thumb2.jpg',
        duration: 596
      }
    ],
    currentIndex: 0
  };

  const sampleSubtitles: { id: string; label: string; language: string; src: string }[] = [];

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
  };

  const handleLoadUrl = () => {
    if (customUrl.trim()) {
      setCurrentUrl(customUrl.trim());
      setAutoPlay(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadUrl();
    }
  };

  return (
    <div className="demo-page">
      <h1>Professional OTT Video Player Demo</h1>
      <div style={{ color: 'red', fontSize: '20px', textAlign: 'center', margin: '20px 0' }}>
        Debug: DemoPage is rendering
      </div>
      
      <div className="player-section">
        <h2>Video Player</h2>
        <div className="url-input-container">
          <input
            type="text"
            value={customUrl}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter video URL (HLS, DASH, MP4, WebM, etc.)"
            className="url-input"
          />
          <button onClick={handleLoadUrl} className="load-url-button">
            Load Video
          </button>
        </div>
        <div className="player-container" style={{ height: '450px' }}>
          <Player 
            ref={playerRef}
            src={currentUrl}
            playlist={samplePlaylist}
            subtitles={sampleSubtitles}
            autoplay={autoPlay}
            key={currentUrl}
          />
        </div>
      </div>
      
      <div className="processor-section">
        <h2>Video Processing</h2>
        <VideoProcessorDemo />
      </div>
    </div>
  );
};

export default DemoPage;
