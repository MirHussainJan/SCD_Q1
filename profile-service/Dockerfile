# Dockerfile for Profile Service
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4004
CMD ["node", "server.js"]
