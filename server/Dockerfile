FROM node:22-alpine

WORKDIR /app

# Copy package files first so Docker can cache the npm install layer.
# If only source files change, this layer is reused and npm install is skipped.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source after installing deps
COPY src/ ./src/

EXPOSE 4000

# Run DB migrations + seed on every start (safe: uses IF NOT EXISTS + ON CONFLICT DO NOTHING),
# then start the API server.
CMD ["sh", "-c", "node src/db/seed.js && node src/index.js"]
