FROM node

# Create app directory
WORKDIR /frontend

# Copy package.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code
COPY . .

# Expose port 3000
EXPOSE 3001

# Run app
CMD [ "npm", "run", "dev" ]
