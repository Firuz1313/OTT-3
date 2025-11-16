export class CodecDetector {
  // Detect container format from URL or file extension
  static detectContainer(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {
      case 'm3u8':
        return 'hls';
      case 'mpd':
        return 'dash';
      case 'mp4':
        return 'mp4';
      case 'webm':
        return 'webm';
      case 'mkv':
        return 'matroska';
      case 'mov':
        return 'quicktime';
      case 'ts':
        return 'mpegts';
      default:
        return 'unknown';
    }
  }

  // Detect if browser can play a specific codec
  static canPlayCodec(codec: string): boolean {
    const video = document.createElement('video');
    
    // Try different codec strings
    const codecStrings = [
      `video/mp4; codecs="${codec}"`,
      `video/webm; codecs="${codec}"`,
      `video/ogg; codecs="${codec}"`
    ];
    
    for (const codecString of codecStrings) {
      try {
        if (video.canPlayType(codecString) !== '') {
          return true;
        }
      } catch (e) {
        // Continue to next codec string
      }
    }
    
    return false;
  }

  // Get supported video codecs
  static getSupportedVideoCodecs(): string[] {
    const codecs = [
      'avc1.42E01E', // H.264
      'avc1.4D401E', // H.264
      'avc1.64001E', // H.264
      'hev1.1.6.L93.B0', // H.265/HEVC
      'vp9', // VP9
      'vp8', // VP8
      'av01.0.04M.08' // AV1
    ];
    
    return codecs.filter(codec => this.canPlayCodec(codec));
  }

  // Get supported audio codecs
  static getSupportedAudioCodecs(): string[] {
    const codecs = [
      'mp4a.40.2', // AAC
      'mp4a.40.5', // AAC
      'mp3',
      'opus',
      'vorbis',
      'flac'
    ];
    
    return codecs.filter(codec => this.canPlayCodec(codec));
  }

  // Detect stream type from URL
  static detectStreamType(url: string): 'hls' | 'dash' | 'progressive' {
    if (url.includes('.m3u8')) {
      return 'hls';
    } else if (url.includes('.mpd')) {
      return 'dash';
    } else {
      return 'progressive';
    }
  }
}