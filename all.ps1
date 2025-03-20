# Stop and remove existing containers
Write-Host "Stopping and removing existing containers..."
docker stop main-service calc-service todo-service mysql-db frontend 2>$null
docker rm main-service calc-service todo-service mysql-db frontend 2>$null

# Create Docker network if it doesn't exist
docker network create app-network

# Pull MySQL image
Write-Host "Pulling MySQL image..."
docker pull mysql:8.0

# Run MySQL container
docker run -d `
    --name mysql-db `
    --network app-network `
    -e MYSQL_ROOT_PASSWORD=rootpassword `
    -e MYSQL_DATABASE=appdb `
    -e MYSQL_USER=appuser `
    -e MYSQL_PASSWORD=apppassword `
    -p 3305:3305 `
    mysql:8.0

# Build the main service image
docker build -t main-service -f ./server/Dockerfile ./server

# Build the calculation service image
docker build -t calc-service -f ./server/Dockerfile.calc ./server

# Build the todo service image
docker build -t todo-service -f ./server/Dockerfile.todo ./server

# Build the frontend image
Write-Host "Building frontend image..."
docker build -t frontend -f ./client/Dockerfile ./client

# Run the calculation service
docker run -d `
    --name calc-service `
    --network app-network `
    -p 3001:3001 `
    --env-file ./server/.env `
    calc-service

# Run the todo service
docker run -d `
    --name todo-service `
    --network app-network `
    -p 3002:3002 `
    --env-file ./server/.env `
    todo-service

# Run the main service
docker run -d `
    --name main-service `
    --network app-network `
    -p 3000:3000 `
    --env-file ./server/.env `
    main-service

# Run the frontend container
docker run -d `
    --name frontend `
    --network app-network `
    -p 80:80 `
    frontend

# Show running containers
docker ps

# Show network details
docker network inspect app-network

Write-Host "`nAll services are running!"
Write-Host "Frontend: http://localhost"
Write-Host "Main Service: http://localhost:3000"
Write-Host "Calculation Service: http://localhost:3001"
Write-Host "Todo Service: http://localhost:3002"
Write-Host "MySQL: localhost:3306" 