import * as dashjs from 'dashjs';

export class DashEngine {
  private dash: dashjs.MediaPlayerClass | null = null;
  private videoElement: HTMLVideoElement | null = null;

  constructor() {
    this.dash = dashjs.MediaPlayer().create();
  }

  loadSource(url: string, videoElement: HTMLVideoElement): void {
    if (this.dash) {
      this.videoElement = videoElement;
      this.dash.initialize(videoElement, url, false);
    }
  }

  destroy(): void {
    if (this.dash) {
      this.dash.destroy();
      this.dash = null;
    }
    this.videoElement = null;
  }

  getDashInstance(): dashjs.MediaPlayerClass | null {
    return this.dash;
  }
}