FROM node:22-bookworm-slim

WORKDIR /app

# Keep installs deterministic and fast-ish for CI. For real prod, consider multi-stage + pnpm deploy.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN corepack enable && corepack pnpm install --frozen-lockfile=false

COPY . .

RUN corepack pnpm --filter @barbergo/api exec prisma generate
RUN corepack pnpm --filter @barbergo/api build

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "apps/api/dist/main.js"]

