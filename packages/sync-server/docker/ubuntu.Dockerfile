FROM node:24-bookworm AS builder

# Install required packages
RUN apt-get update && apt-get install -y openssl

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

FROM node:24-bookworm-slim AS prod

# Minimal runtime dependencies
RUN apt-get update && apt-get install tini && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Create a non-root user
ARG USERNAME=actual
ARG USER_UID=1001
ARG USER_GID=$USER_UID
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && mkdir /data && chown -R ${USERNAME}:${USERNAME} /data

WORKDIR /app
ENV NODE_ENV=production

# sync-server entry flattened at /app so CMD stays `node app.js`.
COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/package.json ./
COPY --from=builder /deploy/build ./

# script dir changed when we swapped build method, add the legacy dir in for compatibility
RUN mkdir -p src && ln -s ../scripts src/scripts

ENTRYPOINT ["/usr/bin/tini","-g",  "--"]
EXPOSE 5006
CMD ["node", "app.js"]
