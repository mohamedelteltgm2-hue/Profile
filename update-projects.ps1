<#
  update-projects.ps1
  ───────────────────────────────────────────────────────────────────────
  Run this script any time you add, remove, or rename files inside
  images\Projects\<FolderName>\ to keep the website in sync.

  • The script scans every sub-folder and lists all image / video files.
  • It preserves whatever title / description / tags / icon you already
    have in data\projects.json for each project.
  • New folders get sensible default values you can edit afterwards.
  ───────────────────────────────────────────────────────────────────────
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Resolve paths relative to the script's own location
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectsDir = Join-Path $root 'images\Projects'
$jsPath = Join-Path $root 'data\projects.js'

# Supported media extensions
$imageExt = @('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif')
$videoExt = @('.mp4', '.webm', '.mov', '.ogg')

# Icon map: key words in folder name → Font Awesome class
# Add more rows as needed
$iconMap = [ordered]@{
  'portfolio'     = 'fas fa-drafting-compass'
  'architectural' = 'fas fa-drafting-compass'
  'visualization' = 'fas fa-cube'
  'render'        = 'fas fa-cube'
  '3d'            = 'fas fa-cube'
  'presentation'  = 'fas fa-file-powerpoint'
  'design'        = 'fas fa-file-powerpoint'
  'photo'         = 'fas fa-camera'
  'bim'           = 'fas fa-layer-group'
  'autocad'       = 'fas fa-pencil-ruler'
}

function Get-Icon($folderName) {
  $lower = $folderName.ToLower()
  foreach ($key in $iconMap.Keys) {
    if ($lower -like "*$key*") { return $iconMap[$key] }
  }
  return 'fas fa-folder-open'
}

function Get-MediaType($file) {
  $ext = $file.Extension.ToLower()
  if ($videoExt -contains $ext) { return 'video' }
  return 'image'
}

# Load existing data from .js file (regex to extract JSON part)
$existing = @{}
if (Test-Path $jsPath) {
  $rawJs = Get-Content $jsPath -Raw -Encoding UTF8
  if ($rawJs -match 'window\.projectData\s*=\s*(.*);') {
    $raw = $Matches[1] | ConvertFrom-Json
    foreach ($p in $raw) { $existing[$p.id] = $p }
  }
}

# Scan folders
$projects = @()
$folders = Get-ChildItem -Path $projectsDir -Directory | Sort-Object Name

if ($folders.Count -eq 0) {
  Write-Host "No sub-folders found in $projectsDir" -ForegroundColor Yellow
}

foreach ($folder in $folders) {
  $id = $folder.Name

  # Gather media files, sorted naturally
  $files = Get-ChildItem -Path $folder.FullName -File |
  Where-Object { ($imageExt + $videoExt) -contains $_.Extension.ToLower() } |
  Sort-Object Name

  # Build items array
  $items = @()
  foreach ($f in $files) {
    # Use forward slashes so the browser can use the path directly
    $relPath = 'images/Projects/' + $folder.Name + '/' + $f.Name
    $items += [PSCustomObject]@{
      type = Get-MediaType $f
      src  = $relPath
    }
  }

  # Determine cover (first image item, else first video)
  $cover = $items | Where-Object { $_.type -eq 'image' } | Select-Object -First 1
  if (-not $cover) { $cover = $items | Select-Object -First 1 }

  # Build project entry, preserving existing metadata if available
  if ($existing.ContainsKey($id)) {
    $meta = $existing[$id]
    $entry = [ordered]@{
      id          = $id
      title       = $meta.title
      icon        = $meta.icon
      description = $meta.description
      tags        = $meta.tags
      items       = $items
    }
  }
  else {
    # New folder — generate defaults
    Write-Host "  NEW project detected: '$id'" -ForegroundColor Cyan
    $entry = [ordered]@{
      id          = $id
      title       = $id
      icon        = Get-Icon $id
      description = "Project work from the $id folder. Edit this description in data\projects.js."
      tags        = @($id)
      items       = $items
    }
  }

  $entry['_count'] = "$($items.Count) file$(if($items.Count -ne 1){'s'})"
  $projects += [PSCustomObject]$entry
}

# Report removed projects
$removed = $existing.Keys | Where-Object { $_ -notin ($folders | Select-Object -ExpandProperty Name) }
foreach ($r in $removed) {
  Write-Host "  REMOVED project (folder gone): '$r'" -ForegroundColor Yellow
}

# Ensure output directory exists
$dataDir = Split-Path $jsPath
if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }

# Write JS file
$json = $projects | ConvertTo-Json -Depth 10
$jsContent = "window.projectData = $json;"
[System.IO.File]::WriteAllText($jsPath, $jsContent, [System.Text.UTF8Encoding]::new($false))

Write-Host "Sync Complete."
