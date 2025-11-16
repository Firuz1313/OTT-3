import { loadFFmpeg, convertToMp4, extractAudio } from './ffmpeg-worker';

export interface ConvertOptions {
  outputFormat: 'mp4' | 'webm' | 'avi' | 'mov';
  videoCodec?: 'h264' | 'h265' | 'vp9';
  audioCodec?: 'aac' | 'mp3' | 'opus';
  quality?: 'low' | 'medium' | 'high';
}

export const convertVideo = async (
  videoBlob: Blob,
  options: ConvertOptions
): Promise<Blob | null> => {
  // Load FFmpeg if not already loaded
  const isLoaded = await loadFFmpeg();
  if (!isLoaded) {
    throw new Error('Failed to load FFmpeg');
  }

  // Create a temporary file from the blob
  const file = new File([videoBlob], 'input-video', { type: videoBlob.type });
  
  // Set output filename based on format
  const outputFilename = `converted.${options.outputFormat}`;
  
  // Convert the video
  switch (options.outputFormat) {
    case 'mp4':
      return await convertToMp4(file, outputFilename);
    default:
      // For other formats, we would need additional conversion logic
      return await convertToMp4(file, outputFilename);
  }
};

export const convertToAudio = async (
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