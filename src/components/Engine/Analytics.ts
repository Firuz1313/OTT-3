export class Analytics {
  private videoElement: HTMLVideoElement | null = null;
  private sessionId: string;
  private events: any[] = [];
  private isTracking = false;
  private metrics: any = {
    totalPlayTime: 0,
    totalPausedTime: 0,
    totalBufferingTime: 0,
    totalSeekingCount: 0,
    totalVolumeChanges: 0,
    totalPlaybackRateChanges: 0,
    totalErrors: 0,
    lastPlayTime: 0,
    lastPauseTime: 0,
    bufferingStartTime: 0
  };

  constructor() {
    // Generate a unique session ID
    this.sessionId = this.generateSessionId();
  }

  init(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.startTracking();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private startTracking() {
    if (!this.videoElement || this.isTracking) return;
    
    this.isTracking = true;
    
    // Track play events
    this.videoElement.addEventListener('play', () => {
      this.metrics.lastPlayTime = Date.now();
      this.trackEvent('play', {
        currentTime: this.videoElement?.currentTime
      });
    });
    
    // Track pause events
    this.videoElement.addEventListener('pause', () => {
      this.metrics.lastPauseTime = Date.now();
      if (this.metrics.lastPlayTime > 0) {
        this.metrics.totalPlayTime += (this.metrics.lastPauseTime - this.metrics.lastPlayTime);
      }
      this.trackEvent('pause', {
        currentTime: this.videoElement?.currentTime
      });
    });
    
    // Track seeking events
    this.videoElement.addEventListener('seeking', () => {
      this.metrics.totalSeekingCount++;
      this.trackEvent('seeking', {
        currentTime: this.videoElement?.currentTime
      });
    });
    
    // Track seeked events
    this.videoElement.addEventListener('seeked', () => {
      this.trackEvent('seeked', {
        currentTime: this.videoElement?.currentTime
      });
    });
    
    // Track volume changes
    this.videoElement.addEventListener('volumechange', () => {
      this.metrics.totalVolumeChanges++;
      this.trackEvent('volumechange', {
        volume: this.videoElement?.volume,
        muted: this.videoElement?.muted
      });
    });
    
    // Track playback rate changes
    this.videoElement.addEventListener('ratechange', () => {
      this.metrics.totalPlaybackRateChanges++;
      this.trackEvent('ratechange', {
        playbackRate: this.videoElement?.playbackRate
      });
    });
    
    // Track fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      this.trackEvent('fullscreenchange', {
        isFullscreen: !!document.fullscreenElement
      });
    });
    
    // Track errors
    this.videoElement.addEventListener('error', (e) => {
      this.metrics.totalErrors++;
      this.trackEvent('error', {
        error: (e.target as HTMLVideoElement).error
      });
    });
    
    // Track ended
    this.videoElement.addEventListener('ended', () => {
      this.trackEvent('ended', {
        duration: this.videoElement?.duration
      });
    });
    
    // Track time updates every 10 seconds
    let lastTrackedTime = 0;
    this.videoElement.addEventListener('timeupdate', () => {
      if (this.videoElement && 
          Math.floor(this.videoElement.currentTime) % 10 === 0 && 
          Math.floor(this.videoElement.currentTime) !== lastTrackedTime) {
        lastTrackedTime = Math.floor(this.videoElement.currentTime);
        this.trackEvent('timeupdate', {
          currentTime: this.videoElement.currentTime,
          duration: this.videoElement.duration
        });
      }
    });
    
    // Track waiting (buffering) events
    this.videoElement.addEventListener('waiting', () => {
      this.metrics.bufferingStartTime = Date.now();
      this.trackEvent('waiting', {
        currentTime: this.videoElement?.currentTime
      });
    });
    
    // Track playing (after buffering) events
    this.videoElement.addEventListener('playing', () => {
      if (this.metrics.bufferingStartTime > 0) {
        this.metrics.totalBufferingTime += (Date.now() - this.metrics.bufferingStartTime);
        this.metrics.bufferingStartTime = 0;
      }
      this.trackEvent('playing', {
        currentTime: this.videoElement?.currentTime
      });
    });
    
    // Track load start
    this.videoElement.addEventListener('loadstart', () => {
      this.trackEvent('loadstart', {
        currentTime: this.videoElement?.currentTime
      });
    });
    
    // Track loaded metadata
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.trackEvent('loadedmetadata', {
        duration: this.videoElement?.duration,
        videoWidth: this.videoElement?.videoWidth,
        videoHeight: this.videoElement?.videoHeight
      });
    });
  }

  private trackEvent(eventName: string, data: any = {}) {
    const event = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      eventName,
      data: {
        ...data,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };
    
    this.events.push(event);
    
    // In a real implementation, you would send this to your analytics service
    // For now, we'll just log it to the console
    console.log('Analytics Event:', event);
    
    // Optional: Send to analytics service
    // this.sendToAnalyticsService(event);
  }

  private sendToAnalyticsService(event: any) {
    // This is where you would send the event to your analytics service
    // For example:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(event)
    // });
  }

  // Get all tracked events
  getEvents(): any[] {
    return [...this.events];
  }

  // Get session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Get detailed metrics
  getMetrics(): any {
    return {
      ...this.metrics,
      sessionId: this.sessionId,
      eventCount: this.events.length
    };
  }

  // Reset analytics
  reset() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.metrics = {
      totalPlayTime: 0,
      totalPausedTime: 0,
      totalBufferingTime: 0,
      totalSeekingCount: 0,
      totalVolumeChanges: 0,
      totalPlaybackRateChanges: 0,
      totalErrors: 0,
      lastPlayTime: 0,
      lastPauseTime: 0,
      bufferingStartTime: 0
    };
  }

  // Stop tracking
  destroy() {
    this.isTracking = false;
    this.events = [];
    this.metrics = {
      totalPlayTime: 0,
      totalPausedTime: 0,
      totalBufferingTime: 0,
      totalSeekingCount: 0,
      totalVolumeChanges: 0,
      totalPlaybackRateChanges: 0,
      totalErrors: 0,
      lastPlayTime: 0,
      lastPauseTime: 0,
      bufferingStartTime: 0
    };
  }
}