FROM node:22.15.0

# Set working directory
WORKDIR /app

# Railway automatically makes environment variables available during build
# Vite will read VITE_* variables from the environment during npm run build
# No need to explicitly set them here - Railway passes them to the build context

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Debug: Print environment variables (without exposing sensitive values)
RUN echo "Checking Vite environment variables..." && \
    echo "VITE_FIREBASE_API_KEY is set: $([ -n \"$VITE_FIREBASE_API_KEY\" ] && echo 'YES' || echo 'NO')" && \
    echo "VITE_FIREBASE_AUTH_DOMAIN is set: $([ -n \"$VITE_FIREBASE_AUTH_DOMAIN\" ] && echo 'YES' || echo 'NO')" && \
    echo "VITE_FIREBASE_PROJECT_ID is set: $([ -n \"$VITE_FIREBASE_PROJECT_ID\" ] && echo 'YES' || echo 'NO')"

# Build the frontend with the correct Node.js version
# Vite will use the ENV variables set above
RUN npm run build

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3001

# Start the Express/Vite-backed server
CMD ["npm", "start"]


