$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$pluginTarget = Join-Path $env:USERPROFILE ".gemini\config\plugins\ai-engineering-team"

Write-Host "================================================="
Write-Host "[1/3] Cai dat Antigravity Plugin + MCP Server..."
Write-Host "      Target: $pluginTarget"
Write-Host "================================================="
New-Item -ItemType Directory -Force -Path $pluginTarget | Out-Null

$copyItems = @(
    "plugin.json",
    "mcp_config.json",
    "README.md",
    "assets",
    "rules",
    "skills",
    "agents"
)
foreach ($item in $copyItems) {
    $src = Join-Path $repoRoot $item
    if (Test-Path $src) {
        Copy-Item -Recurse -Force $src (Join-Path $pluginTarget $item)
    }
}

$mcpDst = Join-Path $pluginTarget "mcp-server"
New-Item -ItemType Directory -Force -Path (Join-Path $mcpDst "dist") | Out-Null
Copy-Item -Force (Join-Path $repoRoot "mcp-server\server.py") (Join-Path $mcpDst "server.py")
Copy-Item -Force (Join-Path $repoRoot "mcp-server\dist\dashboard.html") (Join-Path $mcpDst "dist\dashboard.html")

Write-Host "[*] Kiem tra Python MCP SDK..."
python -c "import mcp; print('Python MCP SDK OK')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Chua cai goi python 'mcp'. Dang cai tu dong: pip install mcp..."
    python -m pip install --quiet mcp
}

Write-Host "`n================================================="
Write-Host "[2/3] Cai dat Sidebar Extension vao Antigravity IDE..."
Write-Host "================================================="
$vsix = Get-ChildItem (Join-Path $repoRoot "ide-extension") -Filter "*.vsix" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($vsix) {
    $ideBins = @(
        (Join-Path $env:LOCALAPPDATA "Programs\Antigravity IDE\bin\antigravity-ide.cmd"),
        (Join-Path $env:LOCALAPPDATA "Programs\Microsoft VS Code\bin\code.cmd")
    )
    $installedAny = $false
    foreach ($bin in $ideBins) {
        if (Test-Path $bin) {
            Write-Host "[*] Dang cai $($vsix.Name) bang: $bin"
            & $bin --install-extension $vsix.FullName --force
            if ($LASTEXITCODE -eq 0) { $installedAny = $true }
        }
    }
    if (-not $installedAny) {
        Write-Host "[!] Khong tim thay antigravity-ide.cmd / code.cmd. Ban co the cai thu cong file: $($vsix.FullName)"
    }
} else {
    Write-Host "[!] Khong tim thay file .vsix trong ide-extension/"
}

Write-Host "`n================================================="
Write-Host "[3/3] HOAN TAT!"
Write-Host "  - Plugin & MCP Server: $pluginTarget"
Write-Host "  - Mo lai / Reload Window Antigravity IDE de thay icon AI Team tren thanh Sidebar ben trai."
Write-Host "================================================="
