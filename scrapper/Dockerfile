# Use the official Node.js 18 base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install

# Install dependencies for Playwright browsers (for Alpine Linux)
RUN apk add --no-cache \
    libnss3 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    alsa-lib \
    libdrm \
    libx11-xcb \
    fontconfig \
    ttf-freefont

# Copy the entire application code
COPY . .

# Expose the backend port
EXPOSE 4006

# Set the default command to run the app
CMD ["npx", "ts-node", "src/app.ts"]
