/**
 * generateShareCard.js
 * Generates an upgraded, detailed shareable image card for a Devlok concept.
 * Supports Instagram square (1080x1080) and Twitter landscape (1200x630).
 */

const FONTS = {
  headingSmall: '600 34px "Cinzel Decorative", serif',
  body: '400 28px "Cormorant Garamond", serif',
  snippet: 'italic 400 24px "Cormorant Garamond", serif',
  label: '500 22px "Cormorant Garamond", serif',
  category: '700 18px "Cinzel Decorative", serif',
};

const COLORS = {
  bg: '#04020f', // Devlok --void
  gold: '#d4973a', // Devlok --amber
  goldDim: 'rgba(212,151,58,0.4)',
  goldFaint: 'rgba(212,151,58,0.12)',
  text: '#e8d5a3', // Devlok --text
  textDim: '#7a6840', // Devlok --text-dim
  border: 'rgba(212,151,58,0.22)',
  accent: 'rgba(212,151,58,0.85)'
};

/**
 * Wraps text to fit within maxWidth, returns array of lines.
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Draws a subtle cosmic starfield
 */
function drawStars(ctx, w, h, count = 180) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 1.5;
    const alpha = 0.1 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,213,163,${alpha})`;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws premium mythological corner ornaments
 */
function drawCorners(ctx, pad, w, h) {
  const M = pad - 24; // Margin of the inner box
  const L = 35; // Length of the ornamental ticks
  
  // Inner box
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(M, M, w - 2*M, h - 2*M);
  
  // Outer subtle frame
  ctx.strokeStyle = COLORS.goldFaint;
  ctx.strokeRect(M - 10, M - 10, w - 2*(M - 10), h - 2*(M - 10));

  // Gold thick corners
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  // Top-left
  ctx.moveTo(M + L, M); ctx.lineTo(M, M); ctx.lineTo(M, M + L);
  // Top-right
  ctx.moveTo(w - M - L, M); ctx.lineTo(w - M, M); ctx.lineTo(w - M, M + L);
  // Bottom-left
  ctx.moveTo(M + L, h - M); ctx.lineTo(M, h - M); ctx.lineTo(M, h - M - L);
  // Bottom-right
  ctx.moveTo(w - M - L, h - M); ctx.lineTo(w - M, h - M); ctx.lineTo(w - M, h - M - L);
  
  ctx.stroke();
}

/**
 * Main generate function.
 */
export async function generateShareCard(concept, format = 'square') {
  const W = format === 'square' ? 1080 : 1200;
  const H = format === 'square' ? 1080 : 630;
  const PAD = format === 'square' ? 76 : 64;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // --- Background with Radial Glow ---
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // A vertical gradient to give depth
  const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
  bgGradient.addColorStop(0, 'rgba(8,5,32,0.6)');
  bgGradient.addColorStop(1, 'rgba(4,2,15,1)');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
  glow.addColorStop(0, 'rgba(212,151,58,0.08)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Stars & Borders
  drawStars(ctx, W, H);
  drawCorners(ctx, PAD, W, H);

  // --- Pre-calculate Text Heights for Centering ---
  ctx.font = FONTS.headingSmall;
  const titleLines = wrapText(ctx, concept.title, W - 2 * PAD).slice(0, 3);
  
  ctx.font = FONTS.body;
  const maxHookLines = format === 'square' ? 4 : 3;
  const hookLines = wrapText(ctx, `"${concept.hook}"`, W - 2 * PAD).slice(0, maxHookLines);
  
  ctx.font = FONTS.snippet;
  // Create an engaging cliffhanger out of the first sentence of the essay
  const cliffhanger = concept.essay.split('.')[0];
  let snippetLines = wrapText(ctx, cliffhanger, W - 2 * PAD);
  if (snippetLines.length > 2) {
    snippetLines = snippetLines.slice(0, 2);
    // Replace the last word with an ellipsis so it doesn't get abruptly cut off
    snippetLines[1] = snippetLines[1].replace(/\s+\S*$/, '') + "...";
  } else {
    snippetLines[snippetLines.length - 1] += "...";
  }

  const chars = concept.relatedCharacters.slice(0, 3);

  // Calculate layout spacing
  let contentHeight = 44 + // Category height
    (titleLines.length * 44) + 12 + // Title
    (hookLines.length * 40) + 24 + // Hook
    (snippetLines.length * 32) + 40 + // Snippet and divider
    28 + // "KEY FIGURES INVOLVED" heading
    (chars.length * 34); // Characters

  const availableHeight = (H - PAD - 80) - PAD; 
  const yOffset = Math.max(0, (availableHeight - contentHeight) / 2);
  let y = PAD + 32 + yOffset;

  // --- Draw Category Lockup ---
  ctx.font = FONTS.category;
  ctx.fillStyle = COLORS.gold;
  ctx.textAlign = 'left';
  ctx.fillText(`✦ ${concept.category} ✦`, PAD, y);
  y += 18;

  // Tiny top accent line
  ctx.strokeStyle = COLORS.goldDim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 40;

  // --- Draw Title ---
  ctx.font = FONTS.headingSmall;
  ctx.fillStyle = COLORS.text;
  for (const line of titleLines) {
    ctx.fillText(line, PAD, y);
    y += 44;
  }
  y += 12;

  // --- Draw Hook ---
  ctx.font = FONTS.body;
  ctx.fillStyle = COLORS.text; 
  ctx.globalAlpha = 0.9;
  for (const line of hookLines) {
    ctx.fillText(line, PAD, y);
    y += 40;
  }
  ctx.globalAlpha = 1.0;
  y += 16;

  // --- Draw Engaging Essay Snippet ---
  ctx.font = FONTS.snippet;
  ctx.fillStyle = COLORS.textDim;
  ctx.globalAlpha = 0.75;
  for (const line of snippetLines) {
    ctx.fillText(line, PAD, y);
    y += 32;
  }
  ctx.globalAlpha = 1.0;
  y += 24;

  // --- Draw Divider ---
  ctx.strokeStyle = COLORS.goldDim;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W / 2 + 50, y);
  ctx.stroke();
  y += 32;

  // --- Draw Related Characters Section ---
  ctx.font = '700 15px "Cinzel Decorative", serif';
  ctx.fillStyle = COLORS.goldDim;
  ctx.fillText('KEY FIGURES INVOLVED:', PAD, y);
  y += 28;

  chars.forEach((c) => {
    const typeLabel = c.type.charAt(0).toUpperCase() + c.type.slice(1);
    
    ctx.font = FONTS.label;
    ctx.fillStyle = COLORS.gold;
    const nameWidth = ctx.measureText(`✦ ${c.label} `).width;
    ctx.fillText(`✦ ${c.label} `, PAD, y);
    
    ctx.font = 'italic 400 18px "Cormorant Garamond", serif';
    ctx.fillStyle = COLORS.textDim;
    const typeWidth = ctx.measureText(`(${typeLabel})  `).width;
    ctx.fillText(`(${typeLabel})  `, PAD + nameWidth, y);
    
    ctx.font = FONTS.label;
    ctx.fillStyle = COLORS.goldDim;
    ctx.fillText(`${c.sanskrit}`, PAD + nameWidth + typeWidth, y);
    
    y += 34;
  });

  // --- Footer Anticipation Tagline ---
  const brandY = H - PAD + 8;
  ctx.font = FONTS.category;
  ctx.fillStyle = COLORS.accent;
  ctx.textAlign = 'center';
  ctx.fillText('DEVLOK', W / 2, brandY - 14);

  // CTA Text
  ctx.font = FONTS.label;
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText('Read the full story at devlok.app/today', W / 2, brandY + 16);

  // Footer accent line
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, brandY + 36);
  ctx.lineTo(W - PAD, brandY + 36);
  ctx.stroke();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Downloads the card as PNG or triggers native share sheet.
 */
export async function shareOrDownload(concept, format = 'square') {
  const blob = await generateShareCard(concept, format);
  const fileName = `devlok-daily-${concept.id}-${format}.png`;

  // Try native Web Share API (mobile)
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: concept.title,
          text: `${concept.hook}\n\nRead the full story at devlok.app/today`,
        });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
  }

  // Fallback: download PNG
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
