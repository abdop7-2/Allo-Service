# ─────────────────────────────────────────────────────────────
# React (Create React App) frontend — build then serve via nginx
# ─────────────────────────────────────────────────────────────

# ---- Stage 1: build the static bundle ----
FROM node:22-alpine AS build
WORKDIR /app

# Trust any local TLS-intercepting proxy CA (corporate proxy / antivirus such as
# Avast) so npm can reach the registry over HTTPS while building. Bundling avoids
# a hard dependency on the file existing — it's empty (a no-op) on a normal
# network where certs/ only contains the .gitkeep placeholder.
COPY certs/ /tmp/extra-certs/
RUN cat /tmp/extra-certs/*.crt > /tmp/extra-certs/bundle.pem 2>/dev/null || true
ENV NODE_EXTRA_CA_CERTS=/tmp/extra-certs/bundle.pem

# Use `npm install` rather than `npm ci`: the committed package-lock.json is out
# of sync with package.json (missing some transitive deps), which makes the strict
# `npm ci` fail. `npm install` reconciles the tree and still uses the lock as a base.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

COPY . .

# Baked in at build time (CRA inlines REACT_APP_* vars).
# Points the browser at the dockerized backend by default.
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# ---- Stage 2: serve with nginx ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
