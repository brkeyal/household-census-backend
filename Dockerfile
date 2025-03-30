FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Make sure TypeScript is compiled properly
RUN npx tsc --build

# Verify the build output exists
RUN test -f dist/server.js || (echo "server.js not found after build!" && exit 1)

# Expose the server port
EXPOSE 5000

# Command to run the application
CMD ["node", "dist/server.js"]