# --- Build stage: compile the Vite PWA bundle ---------------------------------
FROM node:26-alpine AS build

# Refresh Alpine packages in the build stage too (scanner inspects the final image).
RUN apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# --- Runtime stage: tiny static server for the built bundle -------------------
FROM python:3-alpine

# Force the OS package layer to re-resolve so the fixed zlib (1.4-r0) is installed
# instead of the vulnerable 1.3.2-r1 shipped in the base image.
RUN apk upgrade --no-cache \
 && apk add --no-cache 'zlib>=1.4-r0'

WORKDIR /app

COPY --from=build /app/dist ./
COPY server.py ./

ENV PORT=3000
EXPOSE 3000

CMD ["python3", "server.py"]
