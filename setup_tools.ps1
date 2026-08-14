# Setup script to download and install security/OSINT binaries on Windows
$toolsDir = "D:\Github\darktracer\tools\bin"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
}

$ProgressPreference = 'SilentlyContinue'

function Download-And-Extract-Zip {
    param($url, $binName, $destDir)
    try {
        $tempZip = Join-Path $env:TEMP "$binName-temp.zip"
        $tempExtract = Join-Path $env:TEMP "$binName-temp"
        Write-Host "[*] Downloading $binName from $url..."
        Invoke-WebRequest -Uri $url -OutFile $tempZip -UseBasicParsing
        if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
        Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
        $exe = Get-ChildItem -Path $tempExtract -Filter "$binName.exe" -Recurse | Select-Object -First 1
        if ($exe) {
            Copy-Item -Path $exe.FullName -Destination $destDir -Force
            Write-Host "[+] Installed $binName.exe successfully."
        } else {
            # Try any .exe
            $anyExe = Get-ChildItem -Path $tempExtract -Filter "*.exe" -Recurse | Select-Object -First 1
            if ($anyExe) {
                Copy-Item -Path $anyExe.FullName -Destination (Join-Path $destDir "$binName.exe") -Force
                Write-Host "[+] Installed $($anyExe.Name) as $binName.exe successfully."
            }
        }
        Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
        Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "[-] Failed to download/extract $binName - $($_.Exception.Message)"
    }
}

# 1. Subfinder
Download-And-Extract-Zip "https://github.com/projectdiscovery/subfinder/releases/download/v2.6.8/subfinder_2.6.8_windows_amd64.zip" "subfinder" $toolsDir

# 2. HTTPX
Download-And-Extract-Zip "https://github.com/projectdiscovery/httpx/releases/download/v1.6.9/httpx_1.6.9_windows_amd64.zip" "httpx" $toolsDir

# 3. Naabu
Download-And-Extract-Zip "https://github.com/projectdiscovery/naabu/releases/download/v2.3.2/naabu_2.3.2_windows_amd64.zip" "naabu" $toolsDir

# 4. Nuclei
Download-And-Extract-Zip "https://github.com/projectdiscovery/nuclei/releases/download/v3.3.9/nuclei_3.3.9_windows_amd64.zip" "nuclei" $toolsDir

# 5. Amass
Download-And-Extract-Zip "https://github.com/owasp-amass/amass/releases/download/v4.2.0/amass_windows_amd64.zip" "amass" $toolsDir

# 6. Gobuster
Download-And-Extract-Zip "https://github.com/OJ/gobuster/releases/download/v3.6.0/gobuster_Windows_x86_64.zip" "gobuster" $toolsDir

# 7. Assetfinder
Download-And-Extract-Zip "https://github.com/tomnomnom/assetfinder/releases/download/v0.1.1/assetfinder-windows-amd64-0.1.1.zip" "assetfinder" $toolsDir

# 8. GAU
Download-And-Extract-Zip "https://github.com/lc/gau/releases/download/v2.2.3/gau_2.2.3_windows_amd64.zip" "gau" $toolsDir

# 9. Waybackurls
Download-And-Extract-Zip "https://github.com/tomnomnom/waybackurls/releases/download/v0.1.0/waybackurls-windows-amd64-0.1.0.zip" "waybackurls" $toolsDir

# 10. ExifTool
Download-And-Extract-Zip "https://oliverbetz.de/cms/files/Artikel/ExifTool/exiftool-13.20_64.zip" "exiftool" $toolsDir

Write-Host "[*] Binary download and installation sequence completed."
Get-ChildItem -Path $toolsDir
