# Use Node.js 14 as base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3001
EXPOSE 3001

# Add wait-for-it.sh
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

# Command to run the application, waiting for RabbitMQ to be available
CMD ["./wait-for-it.sh", "rabbitmq:5672", "-t", "120", "--", "npm", "run", "dev"]