FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/frontend/package.json packages/frontend/
COPY packages/backend/package.json packages/backend/
RUN npm ci
COPY . .
RUN npm run build -w packages/frontend
RUN npm run build -w packages/backend

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/packages/backend/dist packages/backend/dist
COPY --from=builder /app/packages/backend/package.json packages/backend/
COPY --from=builder /app/packages/frontend/dist packages/frontend/dist
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
RUN npm ci --workspace=packages/backend --omit=dev
EXPOSE 3001
ENV PORT=3001
CMD ["node", "packages/backend/dist/index.js"]
