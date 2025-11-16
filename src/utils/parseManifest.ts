export interface StreamInfo {
  url: string;
  bandwidth: number;
  resolution?: string;
  codecs?: string;
  frameRate?: number;
}

export const parseHlsManifest = async (manifestUrl: string): Promise<StreamInfo[]> => {
  try {
    const response = await fetch(manifestUrl);
    const manifest = await response.text();
    
    // Parse M3U8 manifest
    const lines = manifest.split('\n');
    const streams: StreamInfo[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for stream variants
      if (line.startsWith('#EXT-X-STREAM-INF:')) {
        const attributes: Record<string, string> = {};
        
        // Parse attributes
        const attrString = line.substring(18); // Remove '#EXT-X-STREAM-INF:'
        const attrPairs = attrString.split(',');
        
        for (const pair of attrPairs) {
          const [key, value] = pair.split('=');
          if (key && value) {
            attributes[key.trim()] = value.replace(/"/g, '').trim();
          }
        }
        
        // Get the URL from the next line
        const url = lines[i + 1]?.trim();
        
        if (url && !url.startsWith('#')) {
          streams.push({
            url: url,
            bandwidth: parseInt(attributes['BANDWIDTH'] || '0', 10),
            resolution: attributes['RESOLUTION'],
            codecs: attributes['CODECS'],
            frameRate: attributes['FRAME-RATE'] ? parseFloat(attributes['FRAME-RATE']) : undefined
          });
        }
      }
    }
    
    return streams;
  } catch (error) {
    console.error('Failed to parse HLS manifest:', error);
    return [];
  }
};

export const parseDashManifest = async (manifestUrl: string): Promise<StreamInfo[]> => {
  try {
    const response = await fetch(manifestUrl);
    const manifest = await response.text();
    
    // Parse MPD manifest
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(manifest, 'text/xml');
    
    const streams: StreamInfo[] = [];
    const representations = xmlDoc.getElementsByTagName('Representation');
    
    for (let i = 0; i < representations.length; i++) {
      const rep = representations[i];
      const baseURL = rep.closest('AdaptationSet')?.getElementsByTagName('BaseURL')[0]?.textContent || '';
      
      streams.push({
        url: baseURL,
        bandwidth: parseInt(rep.getAttribute('bandwidth') || '0', 10),
        resolution: `${rep.getAttribute('width')}x${rep.getAttribute('height')}`,
        codecs: rep.getAttribute('codecs') || undefined,
        frameRate: rep.getAttribute('frameRate') ? parseFloat(rep.getAttribute('frameRate') || '0') : undefined
      });
    }
    
    return streams;
  } catch (error) {
    console.error('Failed to parse DASH manifest:', error);
    return [];
  }
};

export const detectStreamType = (url: string): 'hls' | 'dash' | 'progressive' => {
  if (url.includes('.m3u8')) {
    return 'hls';
  } else if (url.includes('.mpd')) {
    return 'dash';
  } else {
    return 'progressive';
  }
};