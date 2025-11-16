export interface SegmentInfo {
  url: string;
  start: number;
  end: number;
  duration: number;
  size: number;
  bitrate: number;
}

export const fetchHlsSegments = async (manifestUrl: string): Promise<SegmentInfo[]> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(manifestUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL' },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
      return [];
    }

    const manifest = await response.text();
    
    // Parse M3U8 manifest
    const lines = manifest.split('\n');
    const segments: SegmentInfo[] = [];
    let currentStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for segment duration
      if (line.startsWith('#EXTINF:')) {
        const duration = parseFloat(line.substring(8));
        const url = lines[i + 1]?.trim();
        
        if (url && !url.startsWith('#')) {
          segments.push({
            url: url,
            start: currentStart,
            end: currentStart + duration,
            duration: duration,
            size: 0, // Will be fetched later
            bitrate: 0 // Will be calculated later
          });
          
          currentStart += duration;
        }
      }
    }
    
    return segments;
  } catch (error: any) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('HLS manifest fetch timed out');
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('CORS or network error fetching HLS manifest');
    } else {
      console.warn('Failed to fetch HLS segments:', error?.message || error);
    }
    return [];
  }
};

export const fetchDashSegments = async (manifestUrl: string): Promise<SegmentInfo[]> => {
  try {
    const response = await fetch(manifestUrl);
    const manifest = await response.text();
    
    // Parse MPD manifest (simplified)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(manifest, 'text/xml');
    
    const segments: SegmentInfo[] = [];
    const segmentTemplates = xmlDoc.getElementsByTagName('SegmentTemplate');
    
    // This is a simplified implementation
    // In a real implementation, we would need to parse the MPD structure properly
    for (let i = 0; i < segmentTemplates.length; i++) {
      const template = segmentTemplates[i];
      const timescale = parseInt(template.getAttribute('timescale') || '1', 10);
      const duration = parseInt(template.getAttribute('duration') || '0', 10);
      
      if (duration > 0 && timescale > 0) {
        const segmentDuration = duration / timescale;
        segments.push({
          url: `segment-${i}.m4s`,
          start: i * segmentDuration,
          end: (i + 1) * segmentDuration,
          duration: segmentDuration,
          size: 0,
          bitrate: 0
        });
      }
    }
    
    return segments;
  } catch (error) {
    console.error('Failed to fetch DASH segments:', error);
    return [];
  }
};

export const getSegmentColor = (bitrate: number): string => {
  // Color coding based on bitrate
  if (bitrate < 1000000) return '#4CAF50'; // Green for low bitrate
  if (bitrate < 3000000) return '#FFEB3B'; // Yellow for medium bitrate
  if (bitrate < 5000000) return '#FF9800'; // Orange for high bitrate
  return '#F44336'; // Red for very high bitrate
};
