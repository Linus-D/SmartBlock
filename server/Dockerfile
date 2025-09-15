# Lightweight Node image
FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy source
COPY src ./src
COPY .env.example ./

# Create data dir for sqlite
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose and run
ENV NODE_ENV=production
ENV PORT=4001
EXPOSE 4001
CMD ["node", "src/index.js"]
