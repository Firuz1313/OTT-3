import * as React from 'react';
import '../../styles/videoProcessorDemo.css';
import VideoProcessor, { VideoProcessorRef } from './VideoProcessor';

interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const VideoProcessorDemo: React.FC = () => {
  const videoProcessorRef = React.useRef<VideoProcessorRef>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [processedFiles, setProcessedFiles] = React.useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingMessage, setProcessingMessage] = React.useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleProcessFile = async (operation: string) => {
    if (!selectedFile || !videoProcessorRef.current) return;

    setIsProcessing(true);
    setProcessingMessage(`Processing: ${operation}...`);

    try {
      let result: any = null;

      switch (operation) {
        case 'convertToMp4':
          result = await videoProcessorRef.current.convertToMp4(selectedFile);
          break;
        case 'extractAudio':
          result = await videoProcessorRef.current.extractAudio(selectedFile);
          break;
        case 'getVideoInfo':
          result = await videoProcessorRef.current.getVideoInfo(selectedFile);
          break;
        case 'transcodeToWebM':
          result = await videoProcessorRef.current.transcodeToWebM(selectedFile);
          break;
        case 'generateThumbnails':
          result = await videoProcessorRef.current.generateThumbnails(selectedFile);
          break;
        default:
          throw new Error('Unknown operation');
      }

      if (result) {
        if (operation === 'getVideoInfo') {
          alert(`Video Info:
Format: ${result.format}
Duration: ${result.duration}s
Video Codec: ${result.video.codec}
Resolution: ${result.video.width}x${result.video.height}`);
        } else if (operation === 'generateThumbnails' && Array.isArray(result)) {
          // Handle thumbnails
          const newFiles = result.map((url, index) => ({
            id: `thumb-${Date.now()}-${index}`,
            name: `thumbnail-${index}.jpg`,
            type: 'image/jpeg',
            size: 0,
            url
          }));
          setProcessedFiles(prev => [...newFiles, ...prev]);
        } else if (result instanceof Blob) {
          // Handle blob result
          const url = URL.createObjectURL(result);
          const newFile: ProcessedFile = {
            id: `processed-${Date.now()}`,
            name: `processed-${operation}.${getFileExtension(result.type)}`,
            type: result.type,
            size: result.size,
            url
          };
          setProcessedFiles(prev => [newFile, ...prev]);
        }
      }

      setProcessingMessage('Processing complete!');
    } catch (error: any) {
      setProcessingMessage(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileExtension = (mimeType: string): string => {
    const extensions: Record<string, string> = {
      'video/mp4': 'mp4',
      'audio/mp3': 'mp3',
      'video/webm': 'webm',
      'image/jpeg': 'jpg'
    };
    return extensions[mimeType] || 'file';
  };

  const handleDownload = (file: ProcessedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const handleClear = () => {
    setProcessedFiles([]);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="video-processor-demo">
      <h2>Video Processing Demo</h2>
      
      <div className="processor-controls">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*,audio/*"
          disabled={isProcessing}
        />
        
        {selectedFile && (
          <div className="file-info">
            <p>Selected file: {selectedFile.name}</p>
            <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
        
        <div className="processing-buttons">
          <button 
            onClick={() => handleProcessFile('convertToMp4')} 
            disabled={!selectedFile || isProcessing}
          >
            Convert to MP4
          </button>
          <button 
            onClick={() => handleProcessFile('extractAudio')} 
            disabled={!selectedFile || isProcessing}
          >
            Extract Audio
          </button>
          <button 
            onClick={() => handleProcessFile('transcodeToWebM')} 
            disabled={!selectedFile || isProcessing}
          >
            Transcode to WebM
          </button>
          <button 
            onClick={() => handleProcessFile('getVideoInfo')} 
            disabled={!selectedFile || isProcessing}
          >
            Get Video Info
          </button>
          <button 
            onClick={() => handleProcessFile('generateThumbnails')} 
            disabled={!selectedFile || isProcessing}
          >
            Generate Thumbnails
          </button>
        </div>
        
        <button 
          onClick={handleClear}
          disabled={isProcessing}
        >
          Clear All
        </button>
      </div>
      
      {isProcessing && (
        <div className="processing-status">
          <p>{processingMessage}</p>
        </div>
      )}
      
      {processedFiles.length > 0 && (
        <div className="processed-files">
          <h3>Processed Files</h3>
          <div className="files-grid">
            {processedFiles.map(file => (
              <div key={file.id} className="file-card">
                {file.type.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="file-thumbnail" />
                ) : (
                  <div className="file-icon">
                    <span>{file.type.split('/')[1].toUpperCase()}</span>
                  </div>
                )}
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                  <button onClick={() => handleDownload(file)}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Hidden VideoProcessor component */}
      <VideoProcessor ref={videoProcessorRef} />
    </div>
  );
};

export default VideoProcessorDemo;