"""Copy user-owned IRAN WOFF2 fonts from their original assets.zip.

No proprietary font binaries are distributed with this demo source.
Usage: python scripts/install_fonts.py [path/to/assets.zip]
"""
from pathlib import Path
from zipfile import ZipFile
import sys
root=Path(__file__).resolve().parents[1]
zip_path=Path(sys.argv[1]).expanduser() if len(sys.argv)>1 else None
if zip_path is None:
 for candidate in (root/'assets.zip',root.parent/'assets.zip',Path.cwd()/'assets.zip'):
  if candidate.exists():
   zip_path=candidate;break
if zip_path is None or not zip_path.is_file():
 raise SystemExit('assets.zip not found. Run: python scripts/install_fonts.py /path/to/assets.zip')
font_names=['IRAN.woff2','IRAN_SemiBold.woff2','IRANBold.woff2','IRANBlack.woff2']
out=root/'public'/'fonts'
out.mkdir(parents=True,exist_ok=True)
with ZipFile(zip_path) as bundle:
 for name in font_names:
  candidates=[p for p in bundle.namelist() if p.endswith('/03 webfonts/woff2/'+name)]
  if len(candidates)!=1:raise SystemExit('Font missing or ambiguous: '+name)
  (out/name).write_bytes(bundle.read(candidates[0]))
  print('Installed:',name)
print('Font installation complete. Check the license before commercial publication.')
