export default () => ({
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  app_name: process.env.APP_NAME || 'Benefits Club Backend',
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/benefits-club',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 300, // 5 minutes default
  },
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
}); 