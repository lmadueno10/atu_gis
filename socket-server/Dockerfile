# Use Node.js 18 as base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3003
EXPOSE 3003

# Command to run the application, waiting for RabbitMQ to be available
CMD ["node", "server.js"]