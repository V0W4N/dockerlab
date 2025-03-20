# Stop and remove existing frontend container
Write-Host "Stopping and removing existing frontend container..."
docker stop frontend 2>$null
docker rm frontend 2>$null

# Build the frontend image
Write-Host "Building frontend image..."
docker build -t frontend -f ./client/Dockerfile ./client

# Run the frontend container
Write-Host "Starting frontend container..."
docker run -d `
    --name frontend `
    --network app-network `
    -p 80:80 `
    frontend

# Show running containers
docker ps

Write-Host "`nFrontend is running!"
Write-Host "Frontend: http://localhost"
