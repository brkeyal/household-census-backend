FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Force install the correct versions
RUN npm uninstall --no-save multer-s3 && \
    npm install --save multer-s3@2.10.0 && \
    npm install

# Install all dependencies with verbose flag
RUN npm install --verbose

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the server port
EXPOSE 5000

# Command to run the application
CMD ["node", "src/server.js"]