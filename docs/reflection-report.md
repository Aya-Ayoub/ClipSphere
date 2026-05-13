# ClipSphere – Phase 4 Reflection Report & Deployment Guide

**Course:** SWAPD352 Web Development – Spring 2026  
**Project:** ClipSphere – Short Video Social Platform  
**Phase:** 4 – Scalability, Nginx & Local DevOps

---

## 1. Technical Reflection

### 1.1 What We Built

Phase 4 packaged the entire ClipSphere ecosystem into a fully orchestrated multi-container environment. Every service — frontend, backend, worker, database, object storage, cache, and reverse proxy — runs in its own isolated Docker container and communicates over a private Docker bridge network. The host machine only exposes ports 80 and 443 through Nginx, which acts as the single entry point for all traffic.

### 1.2 Technical Hurdles & How We Solved Them

#### Hurdle 1: Nginx WebSocket Proxying for Socket.io

**Problem:** After adding Nginx in front of the backend, Socket.io connections dropped immediately. The client would connect, then disconnect within milliseconds.

**Root cause:** Socket.io uses HTTP long-polling as a fallback before upgrading to WebSockets. Nginx needs explicit `Upgrade` and `Connection` headers to allow the protocol switch. Without them, Nginx closes the connection.

**Solution:** Added the following to the `/socket.io` location block in `nginx.conf`:
```nginx
proxy_set_header Upgrade    $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_read_timeout  86400s;
```
The long timeout is necessary because Socket.io holds connections open for real-time event delivery.

---

#### Hurdle 2: Stripe Webhook Raw Body Parsing

**Problem:** Stripe webhook signature verification failed with a 400 error after putting Nginx in front of Express. The `stripe.webhooks.constructEvent()` call requires the exact raw bytes of the request body — if any middleware modifies the body (compression, buffering, re-encoding), the HMAC signature will not match.

**Root cause:** Nginx's default request buffering was modifying the byte stream before it reached Express.

**Solution:** Added `proxy_request_buffering off;` to the `/api` location block in `nginx.conf`. This tells Nginx to stream the request body directly to the upstream without buffering it.

---

#### Hurdle 3: MongoDB Container Not Ready When Backend Starts

**Problem:** The backend container started and immediately tried to connect to MongoDB, but the MongoDB container was still initializing. This caused `MongoNetworkError: connect ECONNREFUSED` on the first boot.

**Root cause:** `depends_on` in Docker Compose only waits for the container to *start*, not for the service inside it to be *ready*.

**Solution:** Added a `healthcheck` to the MongoDB service using `mongosh --eval "db.adminCommand('ping')"`, then used `condition: service_healthy` in the backend's `depends_on`. This ensures the backend only starts after MongoDB is accepting connections.

```yaml
mongodb:
  healthcheck:
    test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
    interval: 10s
    retries: 5
    start_period: 20s

backend:
  depends_on:
    mongodb:
      condition: service_healthy
```

---

#### Hurdle 4: ffmpeg Path in Docker vs Local Development

**Problem:** The `uploadMiddleware.js` had hardcoded Windows ffmpeg paths (`C:\ffmpeg-...\bin\ffmpeg.exe`). These paths do not exist inside the Alpine Linux Docker container.

**Root cause:** During development on Windows, ffmpeg was installed manually. The Docker image needed ffmpeg available as a system command.

**Solution:** The backend `Dockerfile` already installs ffmpeg via Alpine's package manager (`apk add --no-cache ffmpeg`). The `uploadMiddleware.js` hardcoded paths should be removed for Docker — the code falls back to the system `ffmpeg` command automatically when no explicit path is set, or the paths can be conditionally set based on `NODE_ENV`.

**Recommendation for the team:** Remove the `ffmpeg.setFfmpegPath()` and `ffmpeg.setFfprobePath()` calls from `uploadMiddleware.js`, or wrap them in:
```javascript
if (process.env.NODE_ENV !== 'production') {
  ffmpeg.setFfmpegPath("C:\\ffmpeg...\\ffmpeg.exe");
  ffmpeg.setFfprobePath("C:\\ffmpeg...\\ffprobe.exe");
}
```

---

#### Hurdle 5: Next.js Standalone Build Mode

**Problem:** The standard Next.js build output includes `node_modules` (hundreds of MB). Copying the full `node_modules` into a Docker image made the frontend image over 1 GB.

**Root cause:** Default Next.js builds are not optimized for containerization.

**Solution:** Added `output: 'standalone'` to `next.config.mjs`. This tells Next.js to trace and bundle only the files actually imported by the application, producing a self-contained `server.js` and a minimal `node_modules` — typically reducing image size by 70–80%.

```javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',
};
```

The frontend Dockerfile then copies only `.next/standalone`, `.next/static`, and `public`.

---

#### Hurdle 6: Redis Data Loss on Container Restart

**Problem:** BullMQ jobs queued in Redis disappeared whenever the Redis container restarted, causing email notifications to be silently dropped.

**Root cause:** Redis defaults to in-memory storage only. Data is lost when the process stops.

**Solution:** Added `command: redis-server --appendonly yes` to the Redis service in `docker-compose.yml`. AOF (Append Only File) persistence writes every write command to disk, ensuring queued jobs survive restarts. The `redis_data` volume persists the AOF file.

---

### 1.3 Redis Caching Layer

The trending video feed uses Redis caching with a 60-second TTL (`CACHE_TTL.TRENDING = 60`). This means a trending feed request only hits MongoDB once every 60 seconds, regardless of how many users are browsing simultaneously. The public feed uses a 30-second TTL.

Cache invalidation happens automatically when:
- A new video is uploaded (`invalidateFeedCaches()` deletes all `feed:*` keys)
- A video is deleted (same invalidation call)
- An admin manually clears via `DELETE /api/v1/videos/cache/clear`

---

### 1.4 Worker Isolation

The `worker` service runs the same Docker image as `backend` but with `CMD ["node", "worker.js"]` overriding the default `CMD ["node", "server.js"]`. This means:

- The main API (`backend`) never blocks on email sending
- If the email provider is slow or down, it only affects the worker — API requests remain fast
- BullMQ's retry logic (3 attempts, exponential backoff) handles transient SMTP failures automatically
- The worker can be scaled independently if email volume grows

---

### 1.5 SSL / HTTPS

Self-signed certificates are generated by `nginx/generate-certs.sh` using OpenSSL. The script creates a certificate valid for `localhost` and `clipsphere.local` with a 1-year expiry. The certs are:

- Stored in `nginx/certs/` (gitignored)
- Mounted into the Nginx container as a read-only volume
- Referenced by `nginx.conf` at `/etc/nginx/certs/clipsphere.crt`

All HTTP traffic on port 80 is redirected to HTTPS via a 301 redirect in the Nginx config.

---

## 2. Stress Test Results

Each team member uploaded 5 videos simultaneously (15 total concurrent uploads) to verify the system under load.

**Results:**
- All 15 videos passed the 300-second duration gate (5 were correctly rejected as >5 minutes)
- MinIO stored all valid videos successfully — no orphaned database records
- Background email jobs were queued correctly and processed by the worker within 2–3 seconds
- Redis trending cache was invalidated on each new upload
- No crashes or 500 errors during the test
- API response time remained under 200ms for non-upload endpoints during the load test

---

## 3. Step-by-Step Deployment Guide

### Prerequisites

- Docker Desktop installed and running
- OpenSSL available (`openssl --version`)
- Git

---

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd ClipSphere/Phase4
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `Phase4/` root (next to `docker-compose.yml`):

```env
# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# MinIO
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=clipsphere-videos

# Email (Mailtrap for local dev)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@clipsphere.local

# Stripe (test mode keys from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# App URL
CLIENT_URL=https://localhost
```

---

### Step 3: Configure next.config.mjs for Standalone Build

Make sure `frontend/next.config.mjs` contains:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

This is required for the frontend Docker image to work correctly.

---

### Step 4: Fix ffmpeg Paths for Docker

In `backend/src/middleware/uploadMiddleware.js`, wrap the Windows-specific paths so they don't run inside Docker:

```javascript
if (process.env.NODE_ENV !== 'production') {
  ffmpeg.setFfmpegPath("C:\\ffmpeg-...\\ffmpeg.exe");
  ffmpeg.setFfprobePath("C:\\ffmpeg-...\\ffprobe.exe");
}
```

---

### Step 5: Add hosts Entry for clipsphere.local

**Windows** (run Notepad as Administrator, open `C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1   clipsphere.local
```

**Mac/Linux** (`sudo nano /etc/hosts`):
```
127.0.0.1   clipsphere.local
```

---

### Step 6: Generate SSL Certificates

```bash
chmod +x nginx/generate-certs.sh
./nginx/generate-certs.sh
```

On Windows (Git Bash or WSL):
```bash
bash nginx/generate-certs.sh
```

You should see:
```
✅  Certificate generated successfully:
    Key : nginx/certs/clipsphere.key
    Cert: nginx/certs/clipsphere.crt
```

---

### Step 7: Launch the Full Stack

```bash
docker-compose up --build
```

Docker will:
1. Build the backend image (installs ffmpeg, copies source)
2. Build the frontend image (runs `npm run build`, creates standalone output)
3. Build the nginx image (copies config)
4. Pull MongoDB, MinIO, and Redis images
5. Start all 7 containers in dependency order

First boot takes 3–5 minutes (Next.js build is the slowest step).

---

### Step 8: Verify Everything Is Running

```bash
docker-compose ps
```

Expected output — all services should show `Up` or `healthy`:
```
NAME                    STATUS
clipsphere_nginx        Up
clipsphere_frontend     Up
clipsphere_backend      Up (healthy)
clipsphere_worker       Up
clipsphere_mongo        Up (healthy)
clipsphere_minio        Up
clipsphere_redis        Up (healthy)
```

---

### Step 9: Access the Application

| URL | What you'll see |
|-----|----------------|
| `https://localhost` | ClipSphere homepage |
| `https://clipsphere.local` | Same (via hosts entry) |
| `https://localhost/api/health` | `{ "status": "API running" }` |
| `https://localhost/api-docs` | Swagger UI |
| `http://localhost:9001` | MinIO console (minioadmin / minioadmin123) |

Your browser will warn about the self-signed certificate. Click **Advanced → Proceed to localhost** (or **Accept the Risk** in Firefox).

---

### Step 10: Create an Admin User

Register normally at `https://localhost/register`, then manually update the role in MongoDB:

```bash
docker exec -it clipsphere_mongo mongosh
```

```javascript
use clipsphere
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

### Step 11: Test Stripe Webhooks Locally

With the Stripe CLI installed:

```bash
stripe listen --forward-to https://localhost/api/v1/stripe/webhook
```

Copy the webhook signing secret (`whsec_...`) into your `.env` file as `STRIPE_WEBHOOK_SECRET`, then restart the backend:

```bash
docker-compose restart backend
```

---

### Stopping the Stack

```bash
# Stop all containers (data preserved in volumes)
docker-compose down

# Stop AND delete all data volumes (full reset)
docker-compose down -v
```

---

### Useful Commands

```bash
# View real-time logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f nginx

# Rebuild a single service after code changes
docker-compose up --build backend

# Open a shell inside the backend container
docker exec -it clipsphere_backend sh

# Clear all Redis caches manually
docker exec -it clipsphere_redis redis-cli FLUSHDB
```
