# Railway (option b in DEPLOY.md): serves the static site in docs/ with Caddy.
FROM caddy:2-alpine
COPY deploy/railway/Caddyfile /etc/caddy/Caddyfile
COPY docs/ /srv/
