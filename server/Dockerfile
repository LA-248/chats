FROM node:20-alpine AS base

WORKDIR /app
# Copy package.json and package-lock.json first for better layer caching
COPY package*.json ./
RUN npm ci

FROM base as development
# No need to copy the source code in the dev stage,
# since the compose file copies the source code into the container using a bind mount
CMD [ "npm",  "run", "dev" ]

FROM base AS builder
COPY . .
RUN npm run build

FROM builder as production
CMD [ "npm", "start" ]
