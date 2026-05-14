#!/bin/bash
# ── generate-certs.sh ─────────────────────────────────────────────────────────
# Generates a self-signed SSL certificate for local HTTPS development.
# Run this ONCE before the first `docker-compose up`:
#
#   chmod +x nginx/generate-certs.sh
#   ./nginx/generate-certs.sh
#
# The generated files are placed in nginx/certs/ and are mounted into the
# Nginx container at /etc/nginx/certs via a Docker volume bind-mount.
# They are gitignored so they are never committed to the repository.
# ─────────────────────────────────────────────────────────────────────────────

set -e

CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"

echo "──────────────────────────────────────────────────"
echo " ClipSphere – Generating self-signed SSL certificate"
echo "──────────────────────────────────────────────────"

openssl req -x509 \
  -nodes \
  -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/clipsphere.key" \
  -out    "$CERT_DIR/clipsphere.crt" \
  -subj   "/C=US/ST=Local/L=Dev/O=ClipSphere/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:clipsphere.local,IP:127.0.0.1"

echo ""
echo "✅  Certificate generated successfully:"
echo "    Key : $CERT_DIR/clipsphere.key"
echo "    Cert: $CERT_DIR/clipsphere.crt"
echo ""
echo "Next steps:"
echo "  1. Add '127.0.0.1 clipsphere.local' to your /etc/hosts (or C:\\Windows\\System32\\drivers\\etc\\hosts)"
echo "  2. Run: docker-compose up --build"
echo "  3. Open: https://localhost  or  https://clipsphere.local"
echo ""
echo "Note: Your browser will show a security warning for self-signed certs."
echo "      Click 'Advanced' → 'Proceed' to continue (safe for local dev)."
echo "──────────────────────────────────────────────────"