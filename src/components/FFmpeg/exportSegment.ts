import { loadFFmpeg, trimVideo, extractAudio } from './ffmpeg-worker';

export interface SegmentExportOptions {
  startTime: number;
  endTime: number;
  format?: 'mp4' | 'webm' | 'avi';
  quality?: 'low' | 'medium' | 'high';
}

export const exportVideoSegment = async (
  videoBlob: Blob,
  options: SegmentExportOptions
): Promise<Blob | null> => {
  // Load FFmpeg if not already loaded
  const isLoaded = await loadFFmpeg();
  if (!isLoaded) {
    throw new Error('Failed to load FFmpeg');
  }

  // Create a temporary file from the blob
  const file = new File([videoBlob], 'input-video', { type: videoBlob.type });
  
  // Calculate duration
  const duration = options.endTime - options.startTime;
  
  // Set output filename based on format
  const outputFilename = `segment.${options.format || 'mp4'}`;
  
  // Trim the video segment
  const result = await trimVideo(file, options.startTime, duration, outputFilename);
  
  return result;
};

export const exportAudioTrack = async (
  videoBlob: Blob,
  outputFormat: 'mp3' | 'wav' | 'aac' = 'mp3'
): Promise<Blob | null> => {
  // Load FFmpeg if not already loaded
  const isLoaded = await loadFFmpeg();
  if (!isLoaded) {
    throw new Error('Failed to load FFmpeg');
  }

  // Create a temporary file from the blob
  const file = new File([videoBlob], 'input-video', { type: videoBlob.type });
  
  // Set output filename based on format
  const outputFilename = `audio.${outputFormat}`;
  
  // Extract audio
  return await extractAudio(file, outputFilename);
};