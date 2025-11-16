export interface SegmentInfo {
  url: string;
  start: number;
  end: number;
  duration: number;
  size: number;
  bitrate: number;
}

export const fetchHlsSegments = (manifestUrl: string): Promise<SegmentInfo[]> => {
  return (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const isExternal = manifestUrl.startsWith('http');
      const proxyUrl = isExternal ? `/proxy/${encodeURIComponent(manifestUrl)}` : manifestUrl;

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL' },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
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
              size: 0,
              bitrate: 0
            });

            currentStart += duration;
          }
        }
      }

      return segments;
    } catch {
      return [];
    }
  })();
};

export const fetchDashSegments = (manifestUrl: string): Promise<SegmentInfo[]> => {
  return (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const isExternal = manifestUrl.startsWith('http');
      const proxyUrl = isExternal ? `/proxy/${encodeURIComponent(manifestUrl)}` : manifestUrl;

      const response = await fetch(proxyUrl, {
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return [];
      }

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
    } catch {
      return [];
    }
  })();
};

export const getSegmentColor = (bitrate: number): string => {
  // Color coding based on bitrate
  if (bitrate < 1000000) return '#4CAF50'; // Green for low bitrate
  if (bitrate < 3000000) return '#FFEB3B'; // Yellow for medium bitrate
  if (bitrate < 5000000) return '#FF9800'; // Orange for high bitrate
  return '#F44336'; // Red for very high bitrate
};
