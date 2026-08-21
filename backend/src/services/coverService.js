const sharp = require('sharp');

/**
 * Generate a synthetic KDP-compliant cover (2560px height, 1600px width)
 * No external API key required — uses Sharp and SVG
 */
async function generateCover(title, author, genre) {
    const width = 1600;
    const height = 2560;

    // Color palette based on genre
    let bgColor, accentColor;
    const g = genre.toLowerCase();
    if (g.includes('romance')) { bgColor = '#2c1a1a'; accentColor = '#e8b4b8'; }
    else if (g.includes('thriller') || g.includes('mystery')) { bgColor = '#1a1a2e'; accentColor = '#c0392b'; }
    else if (g.includes('fantasy') || g.includes('sci-fi')) { bgColor = '#0f172a'; accentColor = '#fbbf24'; }
    else if (g.includes('self-help') || g.includes('business')) { bgColor = '#1e293b'; accentColor = '#4ade80'; }
    else { bgColor = '#0a0a0a'; accentColor = '#60a5fa'; }

    function escapeXml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgColor}" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>
        <style>
          .title { font-family: 'Georgia', serif; font-size: 80px; fill: ${accentColor}; text-anchor: middle; font-weight: bold; }
          .author { font-family: 'Georgia', serif; font-size: 44px; fill: #cccccc; text-anchor: middle; }
          .genre { font-family: 'Arial', sans-serif; font-size: 30px; fill: #999999; text-anchor: middle; }
        </style>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      <line x1="${width*0.15}" y1="${height*0.42}" x2="${width*0.85}" y2="${height*0.42}" stroke="${accentColor}" stroke-width="4" opacity="0.6" />
      <text x="${width/2}" y="${height*0.35}" class="title">${escapeXml(title.substring(0, 28))}</text>
      <text x="${width/2}" y="${height*0.48}" class="genre">${escapeXml(genre)}</text>
      <text x="${width/2}" y="${height*0.85}" class="author">${escapeXml(author)}</text>
      <text x="${width/2}" y="${height*0.95}" font-family="Arial" font-size="18" fill="#666666" text-anchor="middle">Kindle Edition</text>
    </svg>
    `;

    try {
        return await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
    } catch (error) {
        console.error('Cover fallback:', error);
        return await sharp({
            create: { width: 1600, height: 2560, channels: 3, background: { r: 20, g: 20, b: 40 } }
        }).jpeg().toBuffer();
    }
}

module.exports = { generateCover };
