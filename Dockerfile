# Use Node.js base image (Debian-based, not Alpine, easier for Chrome)
FROM node:18-slim

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  ca-certificates \
  fonts-liberation \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  xdg-utils \
  wget \
  && rm -rf /var/lib/apt/lists/*

# Set CHROME_PATH so chrome-launcher can find Chromium
ENV CHROME_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy backend package files
COPY Backend/package*.json ./Backend/

# Install backend dependencies
RUN cd Backend && npm install --production

# Copy backend and frontend code
COPY Backend ./Backend
COPY Frontend ./Frontend

# Expose backend port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["node", "Backend/server.js"]
