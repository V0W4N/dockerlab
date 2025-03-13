# Function to check if rebuild is needed
function Test-RebuildNeeded {
    param (
        [string]$ServiceName
    )
    
    $changes = docker-compose ps -q $ServiceName
    return $changes.Length -eq 0 -or (Get-Item -Path "Dockerfile").LastWriteTime -gt (Get-Date).AddMinutes(-5)
}

Write-Host "Checking for changes..." -ForegroundColor Yellow

$needsRebuild = Test-RebuildNeeded

if ($needsRebuild) {
    Write-Host "Changes detected, performing full rebuild..." -ForegroundColor Yellow
    docker-compose down
    docker-compose build --parallel
    docker-compose up -d
} else {
    Write-Host "No major changes detected, performing quick restart..." -ForegroundColor Green
    docker-compose restart
}

Write-Host "`nShowing logs..." -ForegroundColor Cyan
docker-compose logs -f