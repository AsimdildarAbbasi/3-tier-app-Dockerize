FROM node:20-alpine
WORKDIR /app

# Copy package files from the current directory (@latest)
COPY package*.json ./
RUN npm ci

# Copy the rest of the React application files
COPY . .

RUN npm run build

# Vite preview default port
EXPOSE 4173

# Run the preview server and bind to all network interfaces
CMD ["npm", "run", "preview", "--", "--host"]