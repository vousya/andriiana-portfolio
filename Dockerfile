
ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=1.27-alpine

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
ARG BASE_PATH=/
ARG SITE_URL=https://portfolio.local
ENV BASE_PATH=${BASE_PATH} SITE_URL=${SITE_URL}
RUN npm run build

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runtime

ARG VERSION=dev
ARG VCS_REF=local
LABEL org.opencontainers.image.title="andriiana-portfolio" \
      org.opencontainers.image.description="Astro + Tailwind portfolio served by Nginx" \
      org.opencontainers.image.source="https://github.com/vousya/andriiana-portfolio" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.licenses="MIT"

COPY --link nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --link --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null 2>&1 || exit 1
