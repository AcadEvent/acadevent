FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# prisma.config.ts throws if DATABASE_URL is unset; generate does not connect.
ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY . .
RUN npx prisma generate && npm run build
RUN npm prune --omit=dev

FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
