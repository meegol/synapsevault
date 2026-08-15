import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';

/**
 * Extract YouTube Video ID from standard, shortened, or embed URLs
 * @param {string} url 
 * @returns {string|null}
 */
export function extractYouTubeVideoId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Format seconds into standard MM:SS or HH:MM:SS format
 * @param {number} seconds 
 * @returns {string}
 */
export function formatTimestamp(seconds) {
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Fetch video metadata (title, author, thumbnail) and timestamped transcript
 * @param {string} videoUrl 
 * @returns {Promise<Object>}
 */
export async function extractYouTubeData(videoUrl) {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL provided.');
  }

  // 1. Fetch Video Metadata via oEmbed
  let title = `YouTube Video (${videoId})`;
  let author = 'Unknown Creator';
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const oembedRes = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { timeout: 5000 }
    );
    if (oembedRes.data) {
      title = oembedRes.data.title || title;
      author = oembedRes.data.author_name || author;
      thumbnailUrl = oembedRes.data.thumbnail_url || thumbnailUrl;
    }
  } catch (err) {
    console.warn(`oEmbed fetch warning for ${videoId}:`, err.message);
  }

  // 2. Fetch Captions / Transcript
  let transcriptItems = [];
  let fullTranscriptText = '';

  try {
    transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (transcriptError) {
    console.warn(`Primary transcript fetch error for ${videoId}:`, transcriptError.message);
    
    // Attempt fallback or language variation
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    } catch (e) {
      console.warn('Fallback transcript error:', e.message);
    }
  }

  if (transcriptItems && transcriptItems.length > 0) {
    fullTranscriptText = transcriptItems.map(item => item.text).join(' ');
  } else {
    // If no automated captions found, provide informative message
    fullTranscriptText = `[No automatic transcripts available for this video. Analysis will be based on video title: "${title}" by ${author}]`;
  }

  // 3. Cluster transcript into coherent timestamped chapters/blocks (e.g. every ~30-60 seconds or logical pauses)
  const chapters = [];
  let currentChapter = {
    start: 0,
    timestamp: '00:00',
    text: ''
  };

  if (transcriptItems && transcriptItems.length > 0) {
    for (let i = 0; i < transcriptItems.length; i++) {
      const item = transcriptItems[i];
      const itemSec = Math.floor(item.offset / 1000 || item.offset || 0);

      if (currentChapter.text.length === 0) {
        currentChapter.start = itemSec;
        currentChapter.timestamp = formatTimestamp(itemSec);
      }

      currentChapter.text += (currentChapter.text ? ' ' : '') + item.text;

      // Group into roughly 45-60s sections or punctuation stops
      if (itemSec - currentChapter.start >= 45 || i === transcriptItems.length - 1) {
        chapters.push({ ...currentChapter });
        currentChapter = {
          start: itemSec,
          timestamp: formatTimestamp(itemSec),
          text: ''
        };
      }
    }
  }

  const durationSeconds = transcriptItems.length > 0 
    ? Math.floor((transcriptItems[transcriptItems.length - 1].offset + transcriptItems[transcriptItems.length - 1].duration) / 1000)
    : 0;

  return {
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    title,
    author,
    thumbnailUrl,
    durationSeconds,
    durationFormatted: formatTimestamp(durationSeconds),
    transcriptItems,
    chapters,
    rawText: fullTranscriptText,
    wordCount: fullTranscriptText.split(/\s+/).filter(Boolean).length
  };
}
