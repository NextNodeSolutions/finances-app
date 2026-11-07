FROM alpine:3.23 AS builder

# Install required packages
RUN apk add --no-cache nodejs npm python3 openssl build-base

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY packages ./packages

RUN npm install -g "$(node -p "require('./package.json').packageManager")"

# Avoiding memory issues with ARMv7
RUN if [ "$(uname -m)" = "armv7l" ]; then pnpm config set --location project child-concurrency 2; pnpm config set --location project network-concurrency 5; fi

# Self-contained production copy of the sync-server: its build, package.json and
# a node_modules holding copies of its workspace dependencies.
RUN pnpm --filter @actual-app/sync-server deploy --prod /deploy

# better-sqlite3 only ships prebuilt binaries for x64 and arm64, so compile it
# on any other architecture (armv6/armv7 images).
WORKDIR /deploy
RUN if [ "$(node node_modules/better-sqlite3/lib/binding.js)" = "0" ]; then \
      pnpm --dir node_modules/better-sqlite3 run build-release; \
    fi

FROM alpine:3.23 AS prod

# Minimal runtime dependencies
RUN apk add --no-cache nodejs tini

# Create a non-root user
ARG USERNAME=actual
ARG USER_UID=1001
ARG USER_GID=$USER_UID
RUN addgroup -S ${USERNAME} -g ${USER_GID} && adduser -S ${USERNAME} -G ${USERNAME} -u ${USER_UID}
RUN mkdir /data && chown -R ${USERNAME}:${USERNAME} /data

WORKDIR /app
ENV NODE_ENV=production

# sync-server entry flattened at /app so CMD stays `node app.js`.
COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/package.json ./
COPY --from=builder /deploy/build ./

# script dir changed when we swapped build method, add the legacy dir in for compatibility
RUN mkdir -p src && ln -s ../scripts src/scripts

ENTRYPOINT ["/sbin/tini","-g",  "--"]
EXPOSE 5006
CMD ["node", "app.js"]
