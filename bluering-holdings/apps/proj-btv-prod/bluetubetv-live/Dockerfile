# ---- build stage ----
FROM node:18-bullseye AS build
WORKDIR /app
# Prevent Next telemetry
ENV NEXT_TELEMETRY_DISABLED=1
# Install deps first (better cache)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Choose your installer: npm, pnpm, or yarn. (Uncomment ONE)
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm ci; fi
# Copy source and build
COPY . .
RUN if [ -f pnpm-lock.yaml ]; then pnpm build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

# ---- runtime stage ----
FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Copy only the runtime artifacts
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
# Copy package files to install production deps only (for next start)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm i --prod --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
    else npm ci --omit=dev; fi
# Next.js needs these to run
COPY next.config.* ./
#COPY .next/standalone/ ./standalone/ 2>/dev/null || true
# Expose Cloud Run port
ENV PORT=8080
EXPOSE 8080
# Start Next on Cloud Run port
CMD [ "npm", "run", "start", "--", "-p", "8080" ]
