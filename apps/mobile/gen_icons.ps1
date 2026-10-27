Add-Type -AssemblyName System.Drawing

$srcPath = "e:\Rahat Setu\Consumer-Behavior-PBL\apps\mobile\assets\images\Logo.png"
Copy-Item $srcPath "e:\Rahat Setu\Consumer-Behavior-PBL\apps\mobile\assets\images\logo.png" -Force

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

$resDir = "e:\Rahat Setu\Consumer-Behavior-PBL\apps\mobile\android\app\src\main\res"

foreach ($folder in $sizes.Keys) {
    $dim = $sizes[$folder]
    $destFolder = Join-Path $resDir $folder
    $destFile = Join-Path $destFolder "ic_launcher.png"
    
    $bmp = New-Object System.Drawing.Bitmap $dim, $dim
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.DrawImage($srcImg, 0, 0, $dim, $dim)
    
    $bmp.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $destFile"
}

$srcImg.Dispose()
Write-Host "All icons generated successfully!"
