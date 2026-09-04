$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$themeRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$projectRoot = Split-Path $themeRoot -Parent
$releaseZip = Join-Path $projectRoot 'global-english.zip'
$backupZip = Join-Path $projectRoot 'docs/backups/global-english-1.3.3.zip'
if (!(Test-Path -LiteralPath $backupZip)) { throw 'Original release backup is required before packaging.' }
$files = @(
    'style.css','index.php','front-page.php','header.php','footer.php','functions.php',
    'page-privacy-policy.php','page-data-consent.php','README.md','screenshot.png',
    'inc/content.php','inc/client-config.php','inc/form-validation.php','template-parts/trial-form.php','template-parts/messengers.php',
    'assets/css/main.css','assets/js/main.js','assets/js/phone-mask.js','assets/js/modal.js',
    'assets/js/scroll-lock.js','assets/js/cookie-consent.js',
    'assets/fonts/manrope-cyrillic.woff2','assets/fonts/manrope-latin.woff2',
    'assets/icons/brand.svg','assets/icons/ui.svg','assets/icons/benefit-scenes.svg','assets/icons/skyline.svg','assets/icons/tg.svg','assets/icons/max.png',
    'assets/images/hero-scene-clean.webp','assets/images/school-1.png','assets/images/school-2.png','assets/images/school-3.png','assets/images/school-4.png','assets/images/REDESIGN-PROVENANCE.md','assets/documents/README.md'
)
foreach ($relative in $files) {
    if (!(Test-Path -LiteralPath (Join-Path $themeRoot $relative) -PathType Leaf)) { throw "Missing release file: $relative" }
}
$versionText = Get-Content -LiteralPath (Join-Path $themeRoot 'style.css') -Raw
if ($versionText -notmatch 'Version: 2\.0\.0') { throw 'Unexpected theme version.' }
$stream = [System.IO.File]::Open($releaseZip, [System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($relative in $files) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $themeRoot $relative), ('global-english/' + $relative), [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $archive.Dispose(); $stream.Dispose() }
$archive = [System.IO.Compression.ZipFile]::OpenRead($releaseZip)
try {
    if ($archive.Entries.Count -ne $files.Count) { throw 'Unexpected archive entry count.' }
    foreach ($relative in $files) {
        $entry = $archive.GetEntry('global-english/' + $relative)
        if (!$entry) { throw "Missing archive entry: $relative" }
        $sourceBytes = [System.IO.File]::ReadAllBytes((Join-Path $themeRoot $relative))
        $entryStream = $entry.Open()
        $memory = [System.IO.MemoryStream]::new()
        try { $entryStream.CopyTo($memory); $packedBytes = $memory.ToArray() }
        finally { $entryStream.Dispose(); $memory.Dispose() }
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try {
            if ([Convert]::ToBase64String($sha.ComputeHash($sourceBytes)) -ne [Convert]::ToBase64String($sha.ComputeHash($packedBytes))) { throw "Archive differs from source: $relative" }
        } finally { $sha.Dispose() }
    }
} finally { $archive.Dispose() }
Write-Output "Release 2.0.0: PASS ($($files.Count) entries, source hashes match, no test files)"
Get-Item -LiteralPath $releaseZip | Select-Object FullName,Length
Get-FileHash -LiteralPath $releaseZip -Algorithm SHA256
