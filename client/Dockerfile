# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# VITE_API_URL must be injected at build time because Vite statically replaces
# all import.meta.env.* references during the bundle step. At runtime it is
# too late — the JS is already compiled.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
# Throw away Node and all dev dependencies; only ship the compiled static files.
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default nginx config with one that handles React Router correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
