# Stage 1: Build the frontend, and install server dependencies
FROM node:22 AS builder

WORKDIR /app

# Copy all files from the current directory
COPY . ./

# Environment variables setup (handled by workspace root now)
WORKDIR /app/services_mermaid-flow-creator_version-3_source
RUN echo "API_KEY=PLACEHOLDER" > ./.env
RUN echo "GEMINI_API_KEY=PLACEHOLDER" >> ./.env

# Install server dependencies
WORKDIR /app/services_mermaid-flow-creator_version-3_source/server
RUN npm install

# Install dependencies and build the frontend
WORKDIR /app/services_mermaid-flow-creator_version-3_source
RUN npm install && npm run build


# Stage 2: Build the final server image
FROM node:22

WORKDIR /app

# Copy server files
COPY --from=builder /app/services_mermaid-flow-creator_version-3_source/server .
# Copy built frontend assets from the builder stage
COPY --from=builder /app/services_mermaid-flow-creator_version-3_source/dist ./dist

EXPOSE 3000

CMD ["node", "server.js"]
