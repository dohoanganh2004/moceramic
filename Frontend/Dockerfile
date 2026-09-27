# Next.js 10 / webpack 4 needs Node's legacy OpenSSL provider on modern Node builds.
ARG NODE_IMAGE=node:18-alpine
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
ENV NODE_OPTIONS=--openssl-legacy-provider

# git is needed because one dependency ("line-awesome") is installed straight
# from a GitHub URL rather than the npm registry.
RUN apk add --no-cache git

COPY package.json package-lock.json* ./
# --legacy-peer-deps: the lockfile predates npm's strict peer-dep resolution
# (e.g. react-apexcharts@1.6.0 declares apexcharts@>=4 but the project pins 3.x).
RUN npm install --legacy-peer-deps

# ---- Build stage ----
FROM deps AS build
WORKDIR /app
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV NODE_ENV=production

# NEXT_PUBLIC_* vars are baked into the client bundle at build time, so this
# has to be a build arg (set via docker-compose's `build.args`), not just a
# runtime env var.
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS=--openssl-legacy-provider

# Reuse node_modules already installed in the build stage instead of
# reinstalling here - `npm prune`/a fresh install would need git again for the
# GitHub-sourced "line-awesome" dependency. Costs some image size (dev deps
# stay in), but keeps the build simple and correct.
COPY package.json ./
COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY server.js next.config.js ./

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
