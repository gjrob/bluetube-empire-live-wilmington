// scripts/upload-vod.mjs
const MAX = Number(process.env.VOD_MAX_BYTES || 0);
const size = fs.statSync(filePath).size;
if (MAX && size > MAX) {
  console.error(`Skip: ${filePath} is ${(size/1e6).toFixed(0)} MB > limit ${(MAX/1e6).toFixed(0)} MB`);
  process.exit(2);
}
