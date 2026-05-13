/**
 * Import blog articles from Excel to Supabase
 * 
 * Usage: node scripts/import-blog-articles.mjs
 * 
 * Requirements: SUPABASE_URL and SUPABASE_SERVICE_KEY env variables
 */

import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import WebSocket from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  realtime: { transport: WebSocket },
});

const BUCKET = 'blog-images';
const EXCEL_PATH = path.resolve(__dirname, '../uploads/Blog_Posts_Updated_Links.xlsx');

// Download image from URL and return Buffer
function downloadImage(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location, retries).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        if (retries > 0) {
          setTimeout(() => downloadImage(url, retries - 1).then(resolve).catch(reject), 1000);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', (err) => {
        if (retries > 0) {
          setTimeout(() => downloadImage(url, retries - 1).then(resolve).catch(reject), 1000);
        } else reject(err);
      });
    });
    request.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => downloadImage(url, retries - 1).then(resolve).catch(reject), 1000);
      } else reject(err);
    });
    request.on('timeout', () => {
      request.destroy();
      if (retries > 0) {
        setTimeout(() => downloadImage(url, retries - 1).then(resolve).catch(reject), 1000);
      } else reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

// Get content type from URL extension
function getContentType(url) {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'avif': 'image/avif',
  };
  return types[ext] || 'image/jpeg';
}

// Upload image to Supabase Storage and return public URL
async function uploadImage(imageUrl, articleHandle, prefix) {
  if (!imageUrl || imageUrl.trim() === '') return null;

  try {
    const buffer = await downloadImage(imageUrl.trim());
    const ext = imageUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex').slice(0, 8);
    // Use a sanitized folder name - replace non-ASCII chars with hash
    const safeHandle = /^[\x20-\x7E]+$/.test(articleHandle) 
      ? articleHandle 
      : crypto.createHash('md5').update(articleHandle).digest('hex').slice(0, 16);
    const filePath = `${safeHandle}/${prefix}_${hash}.${ext}`;
    const contentType = getContentType(imageUrl);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`  ⚠️ Upload failed for ${imageUrl}: ${error.message}`);
      return imageUrl; // Fallback to original URL
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn(`  ⚠️ Failed to process image ${imageUrl}: ${err.message}`);
    return imageUrl; // Fallback to original URL
  }
}

// Parse image list string (comma-separated or JSON array)
function parseImageList(value) {
  if (!value) return [];
  if (typeof value === 'string') {
    // Try JSON parse first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    // Split by comma or newline
    return value.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// Parse tags string
function parseTags(value) {
  if (!value) return [];
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// Try to parse JSON content field
function parseJsonContent(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value; // Return as-is if not valid JSON
  }
}

async function main() {
  console.log('📖 Reading Excel file...');
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  console.log(`📊 Found ${rows.length} articles`);

  let success = 0;
  let failed = 0;

  const LIMIT = parseInt(process.env.IMPORT_LIMIT || '0') || rows.length;
  const SKIP = parseInt(process.env.IMPORT_SKIP || '0');
  console.log(`Processing articles ${SKIP + 1} to ${Math.min(SKIP + LIMIT, rows.length)} of ${rows.length}...`);
  
  for (let i = SKIP; i < Math.min(rows.length, SKIP + LIMIT); i++) {
    const row = rows[i];
    const handle = row['Handle'];
    if (!handle) {
      console.log(`  ⏭️ Skipping row ${i + 1}: no handle`);
      continue;
    }

    console.log(`\n[${i + 1}/${rows.length}] Processing: ${handle}`);

    // Upload cover image and all section images in parallel
    const imagePromises = [];
    
    // Cover image
    imagePromises.push(uploadImage(row['Image Src'], handle, 'cover'));
    
    // Section images
    const sectionImageIndexes = {};
    for (let s = 1; s <= 5; s++) {
      const imgListRaw = row[`Metafield: custom.img-list_${s} [list.file_reference]`] || '';
      const imageUrls = parseImageList(imgListRaw);
      sectionImageIndexes[s] = { start: imagePromises.length, count: imageUrls.length };
      for (let j = 0; j < imageUrls.length; j++) {
        imagePromises.push(uploadImage(imageUrls[j], handle, `section${s}_img${j}`));
      }
    }
    
    const imageResults = await Promise.all(imagePromises);
    
    const coverImageUrl = imageResults[0];
    const sectionImages = {};
    for (let s = 1; s <= 5; s++) {
      const { start, count } = sectionImageIndexes[s];
      const urls = imageResults.slice(start, start + count).filter(Boolean);
      sectionImages[s] = urls.length > 0 ? urls : null;
    }

    // Build article record
    // Note: sub-head_1 uses hyphen, sub_head_2-5 use underscore (Shopify naming)
    const article = {
      handle,
      title: row['Title'] || '',
      author: row['Metafield: custom.author [single_line_text_field]'] || row['Author'] || '',
      seo_title: row['Metafield: title_tag [string]'] || '',
      seo_description: row['Metafield: description_tag [string]'] || '',
      blog_handle: row['Blog: Handle'] || '',
      blog_title: row['Blog: Title'] || '',
      tags: parseTags(row['Tags']),
      published_at: row['Published At'] ? new Date(row['Published At']).toISOString() : null,
      cover_image_url: coverImageUrl,
      cover_image_alt: row['Image Alt Text'] || '',
      intro: parseJsonContent(row['Metafield: custom.intro [rich_text_field]'] || null),
      section_1_title: row['Metafield: custom.sub-head_1 [single_line_text_field]'] || null,
      section_1_content: parseJsonContent(row['Metafield: custom.content_1 [rich_text_field]'] || null),
      section_1_images: sectionImages[1],
      section_2_title: row['Metafield: custom.sub_head_2 [single_line_text_field]'] || null,
      section_2_content: parseJsonContent(row['Metafield: custom.content_2 [rich_text_field]'] || null),
      section_2_images: sectionImages[2],
      section_3_title: row['Metafield: custom.sub_head_3 [single_line_text_field]'] || null,
      section_3_content: parseJsonContent(row['Metafield: custom.content_3 [rich_text_field]'] || null),
      section_3_images: sectionImages[3],
      section_4_title: row['Metafield: custom.sub_head_4 [single_line_text_field]'] || null,
      section_4_content: parseJsonContent(row['Metafield: custom.content_4 [rich_text_field]'] || null),
      section_4_images: sectionImages[4],
      section_5_title: row['Metafield: custom.sub_head_5 [single_line_text_field]'] || null,
      section_5_content: parseJsonContent(row['Metafield: custom.content_5 [rich_text_field]'] || null),
      section_5_images: sectionImages[5],
    };

    // Upsert into database
    const { error } = await supabase
      .from('blog_articles')
      .upsert(article, { onConflict: 'handle' });

    if (error) {
      console.error(`  ❌ Failed to insert ${handle}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✅ Imported: ${article.title}`);
      success++;
    }
  }

  console.log(`\n\n========== DONE ==========`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${rows.length}`);
}

main().catch(console.error);
