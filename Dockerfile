FROM node:22.15.0

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the frontend with the correct Node.js version
RUN npm run build

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3001

# Start the Express/Vite-backed server
CMD ["npm", "start"]


