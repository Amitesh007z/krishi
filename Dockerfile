FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY --from=builder /app/.next ./.next
RUN mkdir -p ./public
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]


