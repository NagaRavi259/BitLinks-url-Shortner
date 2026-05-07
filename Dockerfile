# Use the same Node version as the host
FROM node:24-slim

# Install dependencies needed for native modules (like better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set the environment to development
ENV NODE_ENV=development

# The actual code will be mounted via volumes in docker-compose
# We expose the port Next.js uses
EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "dev"]
