FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies in a separate layer
RUN npm install

# For development dependencies in a separate layer
COPY --chown=node:node . .

# Use node user instead of root
USER node

EXPOSE 3000

CMD ["node", "src/server.js"] 