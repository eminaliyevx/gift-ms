FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/api apps/api
COPY libs libs
COPY prisma prisma

RUN npm install -g pnpm

RUN pnpm install 

RUN pnpm exec prisma generate

RUN pnpm run build api

FROM node:18-alpine AS test

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/api apps/api
COPY libs libs
COPY prisma prisma

RUN npm install -g pnpm

RUN pnpm install 

RUN pnpm exec prisma generate

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma prisma

COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/apps/api/public ./public