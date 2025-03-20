# Stop and remove existing MySQL container
Write-Host "Stopping and removing existing MySQL container..."
docker stop mysql-db 2>$null
docker rm mysql-db 2>$null

# Pull and run MySQL container
Write-Host "Setting up MySQL container..."
docker pull mysql:8.0
docker run -d `
    --name mysql-db `
    --network app-network `
    -e MYSQL_ROOT_PASSWORD=rootpassword `
    -e MYSQL_DATABASE=appdb `
    -e MYSQL_USER=appuser `
    -e MYSQL_PASSWORD=apppassword `
    -p 3305:3306 `
    mysql:8.0

# Wait for MySQL to be ready
Write-Host "Waiting for MySQL to be ready..."
$maxAttempts = 30
$attempt = 1
$mysqlReady = $false

while (-not $mysqlReady -and $attempt -le $maxAttempts) {
    Write-Host "Checking MySQL readiness (attempt $attempt/$maxAttempts)..."
    $mysqlReady = docker exec mysql-db mysqladmin ping -h localhost -u appuser -papppassword --silent
    if (-not $mysqlReady) {
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if (-not $mysqlReady) {
    Write-Host "MySQL failed to become ready in time. Check logs with: docker logs mysql-db"
    exit 1
}

Write-Host "MySQL is ready!"
Write-Host "MySQL is accessible at localhost:3305" 