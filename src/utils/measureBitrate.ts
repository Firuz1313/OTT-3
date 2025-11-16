export const measureBitrate = (
  bytes: number,
  duration: number
): number => {
  if (duration <= 0) return 0;
  // Bitrate in bits per second
  return Math.round((bytes * 8) / duration);
};

export const formatBitrate = (bitrate: number): string => {
  if (bitrate < 1000) return `${bitrate} bps`;
  if (bitrate < 1000000) return `${(bitrate / 1000).toFixed(1)} kbps`;
  return `${(bitrate / 1000000).toFixed(1)} Mbps`;
};

export const getNetworkSpeed = async (
  url: string,
  timeout: number = 5000
): Promise<number> => {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // in seconds
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const bytes = parseInt(contentLength, 10);
      // Return speed in bits per second
      return Math.round((bytes * 8) / duration);
    }
    
    return 0;
  } catch (error) {
    console.warn('Failed to measure network speed:', error);
    return 0;
  }
};

export const getBufferHealth = (
  buffered: TimeRanges,
  currentTime: number
): number => {
  if (!buffered || buffered.length === 0) return 0;
  
  // Find the buffered range that contains the current time
  for (let i = 0; i < buffered.length; i++) {
    const start = buffered.start(i);
    const end = buffered.end(i);
    
    if (currentTime >= start && currentTime <= end) {
      // Return buffer ahead in milliseconds
      return Math.round((end - currentTime) * 1000);
    }
  }
  
  return 0;
};