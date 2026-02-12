FROM node:22.15.0

# Set working directory
WORKDIR /app

# Accept build arguments (Railway will pass environment variables as build args)
# These are optional - if not provided, the build will continue with warnings
ARG VITE_FIREBASE_API_KEY=""
ARG VITE_FIREBASE_AUTH_DOMAIN=""
ARG VITE_FIREBASE_PROJECT_ID=""
ARG VITE_FIREBASE_STORAGE_BUCKET=""
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=""
ARG VITE_FIREBASE_APP_ID=""
ARG VITE_FIREBASE_MEASUREMENT_ID=""

# Set as environment variables for Vite to access during build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the frontend with the correct Node.js version
# The check-env script will warn if variables are missing but won't fail the build
RUN npm run build

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3001

# Start the Express/Vite-backed server
CMD ["npm", "start"]


