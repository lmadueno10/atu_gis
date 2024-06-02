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

# Expose port 3004
EXPOSE 3004

# Add wait-for-it.sh
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

# Set up environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy environment-specific .env file
COPY .env.${NODE_ENV} .env

# Command to run the application, waiting for RabbitMQ to be available
CMD ["node", "server.js"]