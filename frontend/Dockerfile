# Stage 1: Build the React application
FROM node:18-alpine as builder
# ARG NODE_VERSION=18
# FROM node:${NODE_VERSION}-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* ./
# If you use yarn, copy yarn.lock instead and use yarn commands.

# Install dependencies using npm ci for consistency with package-lock.json
# npm ci is generally recommended for CI/CD environments.
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application for production
# Pass VITE_API_URL as a build argument, it will be set by Railway
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]