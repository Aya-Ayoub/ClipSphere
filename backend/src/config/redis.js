// PERSON B
const { createClient } = require("redis");

let redisClient;

const connectRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  redisClient.on("error",       (err) => console.error("[Redis] Error:", err.message));
  redisClient.on("connect",     ()    => console.log("[Redis] Connected"));
  redisClient.on("reconnecting",()    => console.log("[Redis] Reconnecting..."));

  await redisClient.connect();
  return redisClient;
};

const getRedis = () => {
  if (!redisClient) throw new Error("Redis not initialised. Call connectRedis() first.");
  return redisClient;
};

// Cache TTL constants in seconds
const CACHE_TTL = {
  TRENDING: 60,   // trending feed — 60s
  VIDEOS:   30,   // public feed  — 30s
  VIDEO:    120,  // single video — 2min
};

module.exports = { connectRedis, getRedis, CACHE_TTL };