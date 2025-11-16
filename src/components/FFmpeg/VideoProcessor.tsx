import * as React from 'react';
// Import FFmpeg functions
import { loadFFmpeg, convertToMp4, extractAudio, trimVideo, generateThumbnails, getVideoInfo, transcodeToWebM, extractKeyFrames, mergeVideos } from './ffmpeg-worker';

interface VideoProcessorProps {
  onProcessingStart?: () => void;
  onProcessingComplete?: (result: any) => void;
  onProcessingError?: (error: string) => void;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  message: string;
}

export interface VideoProcessorRef {
  convertToMp4: (file: File) => Promise<Blob | null>;
  extractAudio: (file: File) => Promise<Blob | null>;
  trimVideo: (file: File, startTime: number, duration: number) => Promise<Blob | null>;
  generateThumbnails: (file: File, interval?: number) => Promise<string[] | null>;
  getVideoInfo: (file: File) => Promise<any>;
  transcodeToWebM: (file: File) => Promise<Blob | null>;
  extractKeyFrames: (file: File) => Promise<string[] | null>;
  mergeVideos: (files: File[]) => Promise<Blob | null>;
  isProcessing: boolean;
}

const VideoProcessor = React.forwardRef<VideoProcessorRef, VideoProcessorProps>((props, ref) => {
  const { onProcessingStart, onProcessingComplete, onProcessingError } = props;
  const [processingState, setProcessingState] = React.useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    message: ''
  });

  const updateProcessingState = (isProcessing: boolean, progress: number = 0, message: string = '') => {
    setProcessingState({
      isProcessing,
      progress,
      message
    });
  };

  const processConvertToMp4 = async (file: File): Promise<Blob | null> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Converting to MP4...');
      const result = await convertToMp4(file);
      
      updateProcessingState(false, 100, 'Conversion complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  const processExtractAudio = async (file: File): Promise<Blob | null> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Extracting audio...');
      const result = await extractAudio(file);
      
      updateProcessingState(false, 100, 'Audio extraction complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  const processTrimVideo = async (file: File, startTime: number, duration: number): Promise<Blob | null> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Trimming video...');
      const result = await trimVideo(file, startTime, duration);
      
      updateProcessingState(false, 100, 'Video trimming complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  const processGenerateThumbnails = async (file: File, interval: number = 5): Promise<string[] | null> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Generating thumbnails...');
      const result = await generateThumbnails(file, interval);
      
      updateProcessingState(false, 100, 'Thumbnail generation complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  const processGetVideoInfo = async (file: File): Promise<any> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Analyzing video...');
      const result = await getVideoInfo(file);
      
      updateProcessingState(false, 100, 'Video analysis complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  const processTranscodeToWebM = async (file: File): Promise<Blob | null> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Transcoding to WebM...');
      const result = await transcodeToWebM(file);
      
      updateProcessingState(false, 100, 'Transcoding complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  const processExtractKeyFrames = async (file: File): Promise<string[] | null> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Extracting keyframes...');
      const result = await extractKeyFrames(file);
      
      updateProcessingState(false, 100, 'Keyframe extraction complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  const processMergeVideos = async (files: File[]): Promise<Blob | null> => {
    try {
      updateProcessingState(true, 0, 'Loading FFmpeg...');
      const loaded = await loadFFmpeg();
      
      if (!loaded) {
        throw new Error('Failed to load FFmpeg');
      }
      
      updateProcessingState(true, 30, 'Merging videos...');
      const result = await mergeVideos(files);
      
      updateProcessingState(false, 100, 'Video merging complete!');
      onProcessingComplete?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      updateProcessingState(false, 0, `Error: ${errorMessage}`);
      onProcessingError?.(errorMessage);
      return null;
    }
  };

  // Expose processing methods through ref
  React.useImperativeHandle(ref, () => ({
    convertToMp4: processConvertToMp4,
    extractAudio: processExtractAudio,
    trimVideo: processTrimVideo,
    generateThumbnails: processGenerateThumbnails,
    getVideoInfo: processGetVideoInfo,
    transcodeToWebM: processTranscodeToWebM,
    extractKeyFrames: processExtractKeyFrames,
    mergeVideos: processMergeVideos,
    get isProcessing() {
      return processingState.isProcessing;
    }
  }));

  return (
    <div className="video-processor">
      {processingState.isProcessing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="spinner"></div>
            <div className="progress-text">{processingState.message}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${processingState.progress}%` }}
              ></div>
            </div>
            <div className="progress-percent">{processingState.progress}%</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoProcessor;