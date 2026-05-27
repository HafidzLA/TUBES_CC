FROM node:20-alpine

WORKDIR /app

# Copy package descriptors first to cache dependencies layer
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY src/ ./src/

# Expose Express server port
EXPOSE 5000

# Set environment variables defaults
ENV PORT=5000
ENV NODE_ENV=production

# Run start script
CMD ["npm", "start"]
