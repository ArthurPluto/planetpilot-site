# Railway (option b in DEPLOY.md): serves the static site with Caddy.
FROM caddy:2-alpine
COPY deploy/railway/Caddyfile /etc/caddy/Caddyfile
COPY . /srv
RUN rm -rf /srv/deploy /srv/tools /srv/.git /srv/DEPLOY.md
