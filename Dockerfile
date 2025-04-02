# Dockerfile - Production Arbitrage Searcher

FROM node:18-alpine

# Create working directory
WORKDIR /app

# Copy dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD node -e "require('fs').accessSync('./scripts/searcherBot.js') || process.exit(1)"

# Default command
CMD ["pm2-runtime", "ecosystem.config.js"]
