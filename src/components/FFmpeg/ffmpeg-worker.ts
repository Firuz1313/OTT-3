// Import FFmpeg
import { FFmpeg } from '@ffmpeg/ffmpeg';

// Create FFmpeg instance
const ffmpeg = new FFmpeg();

let isLoaded = false;

export const loadFFmpeg = async (): Promise<boolean> => {
  if (!isLoaded) {
    try {
      // Load FFmpeg core
      await ffmpeg.load();
      isLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      return false;
    }
  }
  return true;
};

export const convertToMp4 = async (file: File, outputFile: string = 'output.mp4'): Promise<Blob | null> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write file to FFmpeg virtual file system
    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(file.name, fileData);
    
    // Convert to MP4 using H.264 codec
    await ffmpeg.exec([
      '-i', file.name,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-preset', 'fast',
      '-crf', '23',
      outputFile
    ]);
    
    // Read the output file
    const data = await ffmpeg.readFile(outputFile);
    
    // Handle the data properly based on its type
    if (data instanceof Uint8Array) {
      // Create a new Uint8Array from the data to avoid SharedArrayBuffer issues
      const buffer = new Uint8Array(data);
      return new Blob([buffer], { type: 'video/mp4' });
    }
    
    return null;
  } catch (error) {
    console.error('Conversion failed:', error);
    return null;
  }
};

export const extractAudio = async (file: File, outputFile: string = 'output.mp3'): Promise<Blob | null> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write file to FFmpeg virtual file system
    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(file.name, fileData);
    
    // Extract audio
    await ffmpeg.exec([
      '-i', file.name,
      '-vn',
      '-ar', '44100',
      '-ac', '2',
      '-ab', '192k',
      '-f', 'mp3',
      outputFile
    ]);
    
    // Read the output file
    const data = await ffmpeg.readFile(outputFile);
    
    // Handle the data properly based on its type
    if (data instanceof Uint8Array) {
      // Create a new Uint8Array from the data to avoid SharedArrayBuffer issues
      const buffer = new Uint8Array(data);
      return new Blob([buffer], { type: 'audio/mp3' });
    }
    
    return null;
  } catch (error) {
    console.error('Audio extraction failed:', error);
    return null;
  }
};

export const trimVideo = async (
  file: File, 
  startTime: number, 
  duration: number,
  outputFile: string = 'output.mp4'
): Promise<Blob | null> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write file to FFmpeg virtual file system
    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(file.name, fileData);
    
    // Trim video
    await ffmpeg.exec([
      '-i', file.name,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy',
      outputFile
    ]);
    
    // Read the output file
    const data = await ffmpeg.readFile(outputFile);
    
    // Handle the data properly based on its type
    if (data instanceof Uint8Array) {
      // Create a new Uint8Array from the data to avoid SharedArrayBuffer issues
      const buffer = new Uint8Array(data);
      return new Blob([buffer], { type: 'video/mp4' });
    }
    
    return null;
  } catch (error) {
    console.error('Video trimming failed:', error);
    return null;
  }
};

// Generate thumbnails from video
export const generateThumbnails = async (
  file: File,
  interval: number = 5 // seconds between thumbnails
): Promise<string[] | null> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write file to FFmpeg virtual file system
    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(file.name, fileData);
    
    // Get video duration (simplified approach)
    // In a real implementation, we would parse the video metadata
    
    // Generate thumbnails at specified intervals
    const thumbnails: string[] = [];
    // For demonstration, we'll generate 5 thumbnails
    for (let i = 0; i < 5; i++) {
      const time = i * interval;
      const outputName = `thumbnail_${i}.jpg`;
      
      await ffmpeg.exec([
        '-i', file.name,
        '-ss', time.toString(),
        '-vframes', '1',
        '-vf', 'scale=320:180',
        outputName
      ]);
      
      // Read the thumbnail
      const data = await ffmpeg.readFile(outputName);
      
      // Handle the data properly based on its type
      if (data instanceof Uint8Array) {
        // Create a new Uint8Array from the data to avoid SharedArrayBuffer issues
        const buffer = new Uint8Array(data);
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        thumbnails.push(url);
      }
    }
    
    return thumbnails;
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return null;
  }
};

// Enhanced FFmpeg functions for more advanced features

export const getVideoInfo = async (file: File): Promise<any> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write file to FFmpeg virtual file system
    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(file.name, fileData);
    
    // Get video information
    await ffmpeg.exec([
      '-i', file.name,
      '-vstats',
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams'
    ]);
    
    // In a real implementation, we would parse the output
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
  } catch (error) {
    console.error('Failed to get video info:', error);
    return null;
  }
};

export const transcodeToWebM = async (file: File, outputFile: string = 'output.webm'): Promise<Blob | null> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write file to FFmpeg virtual file system
    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(file.name, fileData);
    
    // Transcode to WebM using VP9 codec
    await ffmpeg.exec([
      '-i', file.name,
      '-c:v', 'libvpx-vp9',
      '-b:v', '2M',
      '-c:a', 'libopus',
      '-b:a', '128k',
      outputFile
    ]);
    
    // Read the output file
    const data = await ffmpeg.readFile(outputFile);
    
    // Handle the data properly based on its type
    if (data instanceof Uint8Array) {
      // Create a new Uint8Array from the data to avoid SharedArrayBuffer issues
      const buffer = new Uint8Array(data);
      return new Blob([buffer], { type: 'video/webm' });
    }
    
    return null;
  } catch (error) {
    console.error('WebM transcoding failed:', error);
    return null;
  }
};

export const extractKeyFrames = async (file: File): Promise<string[] | null> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write file to FFmpeg virtual file system
    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(file.name, fileData);
    
    // Extract keyframes
    const keyframes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const outputName = `keyframe_${i}.jpg`;
      
      await ffmpeg.exec([
        '-i', file.name,
        '-vf', 'select=eq(pict_type\\,I)',
        '-vsync', 'vfr',
        '-q:v', '2',
        `-vf select='eq(pict_type\\,I)*gte(t\\,${i * 10})',setpts=N/TB/30`,
        outputName
      ]);
      
      // Read the keyframe
      const data = await ffmpeg.readFile(outputName);
      
      // Handle the data properly based on its type
      if (data instanceof Uint8Array) {
        // Create a new Uint8Array from the data to avoid SharedArrayBuffer issues
        const buffer = new Uint8Array(data);
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        keyframes.push(url);
      }
    }
    
    return keyframes;
  } catch (error) {
    console.error('Keyframe extraction failed:', error);
    return null;
  }
};

export const mergeVideos = async (files: File[], outputFile: string = 'merged.mp4'): Promise<Blob | null> => {
  if (!isLoaded) {
    const loaded = await loadFFmpeg();
    if (!loaded) return null;
  }

  try {
    // Write all files to FFmpeg virtual file system
    const fileNames: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fileName = `input_${i}.${files[i].name.split('.').pop()}`;
      fileNames.push(fileName);
      const fileData = new Uint8Array(await files[i].arrayBuffer());
      await ffmpeg.writeFile(fileName, fileData);
    }
    
    // Create a text file with the list of files to concatenate
    const fileListContent = fileNames.map(name => `file '${name}'`).join('\n');
    await ffmpeg.writeFile('file_list.txt', fileListContent);
    
    // Merge videos
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'file_list.txt',
      '-c', 'copy',
      outputFile
    ]);
    
    // Read the output file
    const data = await ffmpeg.readFile(outputFile);
    
    // Handle the data properly based on its type
    if (data instanceof Uint8Array) {
      // Create a new Uint8Array from the data to avoid SharedArrayBuffer issues
      const buffer = new Uint8Array(data);
      return new Blob([buffer], { type: 'video/mp4' });
    }
    
    return null;
  } catch (error) {
    console.error('Video merging failed:', error);
    return null;
  }
};