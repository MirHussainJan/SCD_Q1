# Dockerfile for Comment Service
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4003
CMD ["node", "server.js"]
