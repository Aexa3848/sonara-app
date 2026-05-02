'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const mm = require('music-metadata');

const SUPPORTED = new Set(['.mp3', '.flac', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.opus', '.wma']);

const coverCache = new Map();

async function* walk(dir) {
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED.has(ext)) yield full;
    }
  }
}

function trackId(filePath) {
  return crypto.createHash('sha1').update(filePath).digest('hex').slice(0, 16);
}

async function readTrack(filePath) {
  const stat = await fsp.stat(filePath);
  let metadata;
  try {
    metadata = await mm.parseFile(filePath, { duration: true, skipCovers: false });
  } catch (err) {
    metadata = { common: {}, format: {} };
  }
  const id = trackId(filePath);
  const common = metadata.common || {};
  const format = metadata.format || {};
  let cover = null;
  const picture = Array.isArray(common.picture) ? common.picture[0] : null;
  if (picture && picture.data) {
    coverCache.set(id, { data: Buffer.from(picture.data), format: picture.format || 'image/jpeg' });
    cover = `sonara-cover://${id}`;
  }
  return {
    id,
    path: filePath,
    title: (common.title || path.basename(filePath, path.extname(filePath))).toString(),
    artist: (common.artist || (common.artists && common.artists.join(', ')) || 'Неизвестный исполнитель').toString(),
    album: (common.album || '').toString(),
    albumArtist: (common.albumartist || common.artist || '').toString(),
    genre: Array.isArray(common.genre) ? common.genre.join(', ') : (common.genre || ''),
    year: common.year || null,
    track: common.track && common.track.no ? common.track.no : null,
    duration: format.duration ? Math.round(format.duration) : 0,
    bitrate: format.bitrate || 0,
    sampleRate: format.sampleRate || 0,
    fileSize: stat.size,
    mtime: stat.mtimeMs,
    cover,
    addedAt: Date.now(),
  };
}

async function scanFolders(folders, onProgress) {
  const out = [];
  const seen = new Set();
  let processed = 0;

  const allFiles = [];
  for (const folder of folders) {
    if (!folder || !fs.existsSync(folder)) continue;
    for await (const file of walk(folder)) {
      if (!seen.has(file)) {
        seen.add(file);
        allFiles.push(file);
      }
    }
  }

  const total = allFiles.length;
  for (const file of allFiles) {
    try {
      const track = await readTrack(file);
      out.push(track);
    } catch (err) {
      // skip broken files
    }
    processed += 1;
    if (typeof onProgress === 'function' && (processed % 5 === 0 || processed === total)) {
      onProgress({ processed, total, current: file });
    }
  }
  if (typeof onProgress === 'function') onProgress({ processed: total, total, current: null, done: true });
  return out;
}

async function readCover(id) {
  return coverCache.get(id) || null;
}

module.exports = { scanFolders, readCover, SUPPORTED };
