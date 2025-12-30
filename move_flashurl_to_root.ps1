$ErrorActionPreference = 'Stop'

# Move each item from 'flashurl' into repo root using git mv to preserve history
$src = Join-Path (Get-Location) 'flashurl'
if (-not (Test-Path $src)) {
    Write-Host "Source folder 'flashurl' not found. Exiting."
    exit 1
}

Write-Host "Moving items from $src to repository root..."
Get-ChildItem -LiteralPath $src -Force | ForEach-Object {
    $itemPath = Join-Path $src $_.Name
    Write-Host "git mv `"$itemPath`" `".`""
    & git mv $itemPath .
}

# Remove the (now empty) folder
if (Test-Path $src) {
    Write-Host "Removing folder: $src"
    Remove-Item -Recurse -Force $src
}

Write-Host "Staging and committing changes..."
& git add -A
& git commit -m 'chore: move project files from flashurl/ to repository root (flatten)'

Write-Host "Done."
