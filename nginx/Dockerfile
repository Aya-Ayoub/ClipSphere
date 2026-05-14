# ── Nginx Dockerfile ─────────────────────────────────────────────────────────
# Lightweight Nginx image used as the reverse proxy gateway.
# The self-signed SSL certificates are generated OUTSIDE this image
# by generate-certs.sh and are mounted at runtime via a Docker volume,
# so rebuilding the image does not require re-generating certs.

FROM nginx:1.25-alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom config
COPY nginx.conf /etc/nginx/conf.d/clipsphere.conf

# Create directory for SSL certs (will be populated by volume mount)
RUN mkdir -p /etc/nginx/certs

# Nginx runs on port 80 (HTTP) and 443 (HTTPS)
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]