import Hls from 'hls.js';

export class HlsEngine {
  private hls: Hls | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isAutoQuality: boolean = true;

  constructor() {
    if (Hls.isSupported()) {
      this.hls = new Hls();
      // Enable adaptive bitrate streaming
      this.hls.config.abrEwmaFastLive = 3.0;
      this.hls.config.abrEwmaSlowLive = 9.0;
      this.hls.config.abrEwmaFastVoD = 3.0;
      this.hls.config.abrEwmaSlowVoD = 9.0;
      this.hls.config.abrEwmaDefaultEstimate = 500000;
    }
  }

  loadSource(url: string, videoElement: HTMLVideoElement): void {
    if (this.hls) {
      this.videoElement = videoElement;
      // If URL is HTTP and page is HTTPS, convert to HTTPS
      const proxiedUrl = this.getProxiedUrl(url);
      this.hls.loadSource(proxiedUrl);
      this.hls.attachMedia(videoElement);
    } else {
      // Fallback to native HLS support (Safari)
      const proxiedUrl = this.getProxiedUrl(url);
      videoElement.src = proxiedUrl;
    }
  }

  private getProxiedUrl(url: string): string {
    // If page is HTTPS but URL is HTTP, convert to HTTPS or use proxy
    if (window.location.protocol === 'https:' && url.startsWith('http://')) {
      // Try converting to HTTPS first
      const httpsUrl = url.replace('http://', 'https://');
      return httpsUrl;
    }
    return url;
  }

  destroy(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.videoElement = null;
  }

  getHlsInstance(): Hls | null {
    return this.hls;
  }

  // Get quality levels
  getLevels(): any[] {
    if (this.hls) {
      return this.hls.levels;
    }
    return [];
  }

  // Set quality level
  setCurrentLevel(level: number): void {
    if (this.hls) {
      this.hls.currentLevel = level;
      this.isAutoQuality = level === -1;
    }
  }

  // Get current quality level
  getCurrentLevel(): number {
    if (this.hls) {
      return this.hls.currentLevel;
    }
    return -1;
  }

  // Enable/disable auto quality
  setAutoQuality(enabled: boolean): void {
    if (this.hls) {
      this.isAutoQuality = enabled;
      if (enabled) {
        this.hls.nextLevel = -1; // Auto quality
      }
    }
  }

  // Get auto quality status
  getAutoQuality(): boolean {
    return this.isAutoQuality;
  }

  // Get current bitrate estimate
  getCurrentBitrate(): number {
    if (this.hls && this.hls.bandwidthEstimate) {
      return this.hls.bandwidthEstimate;
    }
    return 0;
  }

  // Get dropped frames count
  getDroppedFrames(): number {
    if (this.videoElement) {
      // @ts-ignore - webkitDroppedFrameCount is not in the standard API
      return this.videoElement.webkitDroppedFrameCount || 0;
    }
    return 0;
  }
}
