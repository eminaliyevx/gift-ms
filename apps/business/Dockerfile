FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/business apps/business
COPY libs libs
COPY prisma prisma

RUN npm install -g pnpm

RUN pnpm install -r

RUN pnpm exec prisma generate

RUN pnpm run build business

FROM node:18-alpine AS test

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/business apps/business
COPY libs libs
COPY prisma prisma

RUN npm install -g pnpm

RUN pnpm install -r 

RUN pnpm exec prisma generate

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/business/main"]