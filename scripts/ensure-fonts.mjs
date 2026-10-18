/**
 * Installs user-owned IRAN Family WOFF2 fonts on this machine from original
 * assets.zip, before Next.js runs. No font binaries are bundled with the demo.
 * Uses only Node built-ins; compatible with Windows and macOS/Linux.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public', 'fonts');
const names = ['IRAN.woff2', 'IRAN_SemiBold.woff2', 'IRANBold.woff2', 'IRANBlack.woff2'];
if (names.every(name => fs.existsSync(path.join(dir,name)))) {
  console.log('[fonts] IRAN Family installed locally.');
  process.exit(0);
}
const sources = [
  process.env.KHAJI_ASSETS_ZIP,
  path.join(root, 'assets.zip'),
  path.join(root, '..', 'assets.zip'),
  path.join(process.cwd(), 'assets.zip'),
  path.join(os.homedir(), 'Downloads', 'assets.zip')
].filter(Boolean);
const originalZip = sources.find(file => fs.existsSync(file) && fs.statSync(file).isFile());
if (!originalZip) {
  console.error('[fonts] Missing user-owned assets.zip. Put it beside the khaji-nextjs folder, or set KHAJI_ASSETS_ZIP to its full path.');
  process.exit(1);
}
const b=fs.readFileSync(originalZip);
// End-of-central-directory (ZIP32) lookup.
let eocd=-1;
for (let i=b.length-22; i>=Math.max(0,b.length-65557); i--) {
  if (b.readUInt32LE(i)===0x06054b50) {eocd=i;break;}
}
if(eocd<0)throw Error('Not a supported ZIP archive: '+originalZip);
let pos=b.readUInt32LE(eocd+16);
const nEntries=b.readUInt16LE(eocd+10);
let extracted=0;
fs.mkdirSync(dir,{recursive:true});
for(let i=0;i<nEntries;i++) {
  if(b.readUInt32LE(pos)!==0x02014b50)throw Error('Invalid central directory entry');
  const method=b.readUInt16LE(pos+10);
  const compressedSize=b.readUInt32LE(pos+20);
  const plainSize=b.readUInt32LE(pos+24);
  const pathLen=b.readUInt16LE(pos+28);
  const extraLen=b.readUInt16LE(pos+30);
  const commentLen=b.readUInt16LE(pos+32);
  const localOffset=b.readUInt32LE(pos+42);
  const entryPath=b.toString('utf8',pos+46,pos+46+pathLen).replaceAll('\\','/');
  const name=names.find(n=>entryPath.endsWith('/03 webfonts/woff2/'+n));
  if(name) {
    if(b.readUInt32LE(localOffset)!==0x04034b50)throw Error('Invalid ZIP local entry');
    const nameLen=b.readUInt16LE(localOffset+26);
    const localExtra=b.readUInt16LE(localOffset+28);
    const start=localOffset+30+nameLen+localExtra;
    const data=b.subarray(start,start+compressedSize);
    const bytes=method===8?inflateRawSync(data):method===0?data:null;
    if(!bytes||bytes.length!==plainSize)throw Error('Unsupported or corrupt font entry: '+name);
    fs.writeFileSync(path.join(dir,name),bytes);
    console.log('[fonts] Installed '+name+' from your assets.zip');
    extracted++;
  }
  pos+=46+pathLen+extraLen+commentLen;
}
if(!names.every(name=>fs.existsSync(path.join(dir,name)))){
  console.error('[fonts] The original assets.zip does not include all 4 required WOFF2 files.');
  process.exit(1);
}
console.log('[fonts] Ready ('+extracted+' fonts copied).');
