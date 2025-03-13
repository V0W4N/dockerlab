# Docker Network Test Application

This is a simple Node.js application that helps test Docker's network connectivity. It provides information about network interfaces, hostname, and client connection details.

## Features

- Shows server hostname
- Displays all network interfaces
- Shows client IP address
- Lists request headers
- Includes health check endpoint

## Building and Running

### Local Development

```bash
# Install dependencies
npm install

# Run the server
node src/server.js
```

### Docker

```bash
# Build the Docker image
docker build -t docker-network-test .

# Run the container
docker run -p 3000:3000 docker-network-test
```

## Testing

Once running, you can access the following endpoints:

- Main endpoint: http://localhost:3000/
- Health check: http://localhost:3000/health

## Network Testing

The application will show you:
1. The container's network interfaces
2. Your client IP address
3. All request headers
4. The container's hostname

This information helps verify network connectivity and container configuration. 