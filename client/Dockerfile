FROM node:20-alpine AS base
WORKDIR /app
# Copy package.json and package-lock.json first for better layer caching
COPY package*.json ./

FROM base AS development 
RUN npm ci
# No need to copy the source code in the dev stage,
# since the compose file copies the source code into the container using a bind mount
CMD [ "npm", "run", "dev" ]

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
