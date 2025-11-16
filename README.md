# Professional OTT Video Player

A feature-rich video player built with React, TypeScript, HLS.js, DASH.js, and FFmpeg.wasm. This player provides YouTube-level functionality with support for adaptive streaming, multiple codecs, and advanced features.

## Features

### Streaming Protocols
- ✅ HLS (.m3u8, TS/MP4-Chunks)
- ✅ DASH (.mpd)
- ✅ Auto-detection of format by URL
- ✅ Manual engine selection (HLS/DASH)

### Container Formats
- ✅ MPEG-TS
- ✅ fMP4
- ✅ MP4
- ✅ MKV
- ✅ MOV
- ✅ WEBM

### Video Codecs
- ✅ H.264 / AVC
- ✅ H.265 / HEVC
- ✅ VP9
- ✅ AV1
- ✅ MPEG-2
- ✅ Theora (via FFmpeg.wasm)

### Audio Codecs
- ✅ AAC
- ✅ MP3
- ✅ Opus
- ✅ Vorbis
- ✅ AC3
- ✅ E-AC3
- ✅ PCM
- ✅ DTS (via FFmpeg.wasm decoding)

### UI Features (YouTube-level)
- ✅ Large Play/Pause button
- ✅ Transparent overlay UI
- ✅ Fullscreen mode
- ✅ Theater Mode
- ✅ Cinema Mode (darkened background)
- ✅ UI auto-hide on inactivity
- ✅ Mini Player (picture-in-picture)

### Controls
- ✅ Volume control + mouse wheel
- ✅ Time slider with buffering visualization
- ✅ Segment timeline display
- ✅ Thumbnail preview
- ✅ Playback speed control (0.25× to 3×)
- ✅ Manual quality selection
- ✅ Automatic quality adaptation (ABR)
- ✅ Audio track selection
- ✅ Subtitle/caption selection

### Quality & Bitrate Control
- ✅ Display all streams: 360p to 4K
- ✅ Bitrate display: "720p (2.5 Mbps)"
- ✅ Manual fragment bitrate selection
- ✅ Automatic quality adaptation (ABR)
- ✅ Real-time bitrate metrics

### Statistics for Nerds
- ✅ Video codec
- ✅ Audio codec
- ✅ Container format
- ✅ Current bitrate
- ✅ Input bitrate
- ✅ Frame rate (FPS)
- ✅ Buffer health (ms)
- ✅ Resolution
- ✅ Dropped frames
- ✅ Segment time remaining
- ✅ Current segment info
- ✅ Segment path (URL)
- ✅ Network speed

### Chunk & Segment Visualization
- ✅ Loaded segments display
- ✅ TS/MP4 fragment sizes
- ✅ Bitrate color coding
- ✅ RAM cache visualization

### FFmpeg.wasm Integration
- ✅ Format conversion
- ✅ Video segment extraction
- ✅ Thumbnail generation
- ✅ Audio export
- ✅ Rare codec decoding

### Subtitles/Captions
- ✅ .vtt, .srt, .ass support
- ✅ WEBVTT embedded
- ✅ Multiple tracks
- ✅ UI controls for selection
- ✅ Size adjustment
- ✅ Color and background customization

### Player API
- ✅ play()
- ✅ pause()
- ✅ seek(time)
- ✅ setQuality(level)
- ✅ setSpeed(rate)
- ✅ getStats()
- ✅ getCodecs()
- ✅ getCurrentChunk()
- ✅ getBufferedRanges()
- ✅ captureFrame() (screenshot)
- ✅ exportSegment(start, end)

## Project Structure

```
/src
  /components
    Player.tsx
    /Controls
      PlayButton.tsx
      TimeSlider.tsx
      Volume.tsx
      QualitySelector.tsx
      SpeedSelector.tsx
      SubtitlesSelector.tsx
      StatsPanel.tsx
    /Engine
      HlsEngine.ts
      DashEngine.ts
      CodecDetector.ts
    /FFmpeg
      ffmpeg-worker.ts
      exportSegment.ts
      convert.ts
  /utils
    fetchSegments.ts
    measureBitrate.ts
    parseManifest.ts
    formatTime.ts
  /styles
    player.css
```

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

## Build

```bash
npm run build
```

## Usage

```jsx
import Player from './components/Player';

<Player 
  src="https://example.com/video.m3u8"
  type="hls"
  subtitles={[
    {
      id: 'en',
      label: 'English',
      language: 'en',
      src: 'https://example.com/subtitles-en.vtt'
    }
  ]}
/>
```

## API Usage

```jsx
import React, { useRef } from 'react';
import Player from './components/Player';

const App = () => {
  const playerRef = useRef(null);

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  };

  return (
    <Player ref={playerRef} src="https://example.com/video.m3u8" />
  );
};
```