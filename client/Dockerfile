FROM node:20-alpine

# Define the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for better layer caching
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Start the development server
CMD ["npm", "run", "dev"]