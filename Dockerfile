# Use image node as base
FROM node:18

# Set directory
WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all files project to container
COPY . .

# Running server with nodemon (development)
CMD ["yarn", "dev"]
