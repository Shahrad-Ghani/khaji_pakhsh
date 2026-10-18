<# Install the user-owned IRAN Family WOFF2 fonts locally from their original assets.zip.
   No font binaries are redistributed with this project.
   Usage: powershell -ExecutionPolicy Bypass -File scripts/install_fonts.ps1 -AssetsZip "C:\path\assets.zip"
#>
param([string]$AssetsZip = "")
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not $AssetsZip) {
  $possible = @((Join-Path $root 'assets.zip'), (Join-Path (Split-Path $root -Parent) 'assets.zip'), (Join-Path (Get-Location).Path 'assets.zip'))
  foreach ($path in $possible) { if (Test-Path $path) { $AssetsZip = $path; break } }
}
if (-not $AssetsZip -or -not (Test-Path $AssetsZip)) { throw 'assets.zip not found. Place it next to the project folder or provide -AssetsZip C:\path\assets.zip' }
try { Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction Stop }
catch { Add-Type -AssemblyName System.IO.Compression -ErrorAction Stop }
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $AssetsZip).Path)
$destination = Join-Path $root 'public/fonts'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
try {
  foreach ($name in @('IRAN.woff2','IRAN_SemiBold.woff2','IRANBold.woff2','IRANBlack.woff2')) {
    $matches = @($zip.Entries | Where-Object { $_.FullName.Replace('\','/').EndsWith('/03 webfonts/woff2/' + $name) })
    if ($matches.Count -ne 1) { throw "Font missing or ambiguous in assets.zip: $name" }
    $target = Join-Path $destination $name
    $inputStream = $matches[0].Open()
    $outStream = [System.IO.File]::Create($target)
    try { $inputStream.CopyTo($outStream) } finally { $outStream.Dispose(); $inputStream.Dispose() }
    Write-Host "Installed $name"
  }
} finally { $zip.Dispose() }
Write-Host 'Done. Original fonts are now available locally. Check the font license before commercial publication.'
