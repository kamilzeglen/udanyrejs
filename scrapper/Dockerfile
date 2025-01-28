# Use the official Node.js 18 base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code
COPY . .

# Expose the backend port
EXPOSE 4006

# Set the default command to run the app
CMD ["npx", "ts-node", "src/app.ts"]
