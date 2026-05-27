# Stage 1: Build React/Vite application
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (leverage Docker layers cache)
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build application
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:1.25-alpine

# Copy built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config for Single Page Application routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
