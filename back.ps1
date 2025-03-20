# Stop and remove existing backend containers
Write-Host "Stopping and removing existing backend containers..."
docker stop main-service calc-service todo-service 2>$null
docker rm main-service calc-service todo-service 2>$null

# Build the backend service images
Write-Host "Building backend service images..."
docker build -t main-service -f ./server/Dockerfile ./server
docker build -t calc-service -f ./server/Dockerfile.calc ./server
docker build -t todo-service -f ./server/Dockerfile.todo ./server

# Run the calculation service
Write-Host "Starting calculation service..."
docker run -d `
    --name calc-service `
    --network app-network `
    -p 3001:3001 `
    --env-file ./server/.env `
    calc-service

# Run the todo service
Write-Host "Starting todo service..."
docker run -d `
    --name todo-service `
    --network app-network `
    -p 3002:3002 `
    --env-file ./server/.env `
    todo-service

# Run the main service
Write-Host "Starting main service..."
docker run -d `
    --name main-service `
    --network app-network `
    -p 3000:3000 `
    --env-file ./server/.env `
    main-service

# Show running containers
docker ps

Write-Host "`nBackend services are running!"
Write-Host "Main Service: http://localhost:3000"
Write-Host "Calculation Service: http://localhost:3001"
Write-Host "Todo Service: http://localhost:3002"
