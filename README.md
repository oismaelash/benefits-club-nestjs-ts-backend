# Benefits Club Backend

A comprehensive NestJS backend template with TypeScript, clean architecture, MongoDB with Mongoose, JWT authentication, and Redis caching.

## Features

- ✅ **NestJS Framework** - Modern, scalable Node.js framework
- ✅ **TypeScript** - Full TypeScript support with strict typing
- ✅ **MongoDB & Mongoose** - NoSQL database with elegant ODM
- ✅ **JWT Authentication** - Secure authentication with JSON Web Tokens
- ✅ **Redis Caching** - High-performance caching for statistics
- ✅ **Clean Architecture** - Well-structured, maintainable codebase
- ✅ **Swagger Documentation** - Auto-generated API documentation
- ✅ **Validation** - Request validation with class-validator
- ✅ **Error Handling** - Global exception filters
- ✅ **Response Interceptors** - Standardized API responses
- ✅ **Environment Configuration** - Centralized configuration management
- ✅ **Security** - CORS, rate limiting, and security headers

## Project Structure

```
src/
├── common/                 # Shared utilities and common functionality
│   ├── decorators/         # Custom decorators
│   ├── filters/            # Exception filters
│   ├── guards/             # Authentication guards
│   ├── interceptors/       # Response interceptors
│   └── interfaces/         # TypeScript interfaces
├── config/                 # Configuration files
│   ├── configuration.ts    # Main configuration
│   ├── database.config.ts  # Database configuration
│   └── redis.config.ts     # Redis cache configuration
├── modules/                # Feature modules
│   ├── auth/               # Authentication module
│   ├── users/              # Users management
│   ├── products/           # Products management
│   ├── categories/         # Product categories
│   ├── purchases/          # Purchase transactions
│   ├── wishlist/           # User wishlist
│   ├── reviews/            # Product reviews
│   └── statistics/         # Statistics with caching
├── app.controller.ts       # Main app controller
├── app.module.ts          # Main app module
├── app.service.ts         # Main app service
└── main.ts                # Application entry point
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd benefits-club-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/benefits-club
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   REDIS_TTL=300
   ```

4. **Start MongoDB and Redis**
   Make sure MongoDB and Redis are running on your system.

5. **Run the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
- **Local**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api

## Complete API Endpoints

### Health Check
- **GET** `/health` - Check if the API is online

### Authentication Module
- **POST** `/auth/login` - User authentication
  - **Body**: `{ email, password }`
- **POST** `/auth/register` - User registration
  - **Body**: `{ name, email, password }`
- **POST** `/auth/logout` - User logout
- **POST** `/auth/refresh` - Refresh authentication token

### Users Module
- **POST** `/users` - Register a new user
  - **Body**: `{ name, email, password }`
- **GET** `/users` - Retrieve all users
- **GET** `/users/{id}` - Retrieve a specific user by ID
- **PUT** `/users/{id}` - Update a specific user
  - **Body**: `{ name?, email? }`
- **DELETE** `/users/{id}` - Delete a specific user
- **GET** `/users/{id}/profile` - Get user's detailed profile including statistics
- **GET** `/users/{id}/purchases` - Get all purchases made by a specific user

### Products Module
- **GET** `/products/categories` - Get available categories for product creation
- **POST** `/products` - Register a new product
  - **Body**: `{ name, description, price, category? }`
  - **Note**: Use GET /products/categories to get available categories
- **GET** `/products` - Retrieve all products
  - **Query**: `?price_min=50&price_max=200&category=categoryId&q=keyword`
- **GET** `/products/{id}` - Retrieve a specific product by ID
- **PUT** `/products/{id}` - Update a specific product
  - **Body**: `{ name?, description?, price?, category? }`
  - **Note**: Use GET /products/categories to get available categories
- **DELETE** `/products/{id}` - Delete a specific product
- **GET** `/products?price_min=50&price_max=200` - Filter products by price range
- **GET** `/products/search?q=keyword` - Search products by name or description
- **GET** `/products/{id}/purchases` - Get all purchases for a specific product

### Categories Module
- **POST** `/categories` - Create a new product category
  - **Body**: `{ name, description }`
- **GET** `/categories` - Get all categories
- **GET** `/categories/{id}` - Get a specific category by ID
- **PUT** `/categories/{id}` - Update a specific category
  - **Body**: `{ name?, description? }`
- **DELETE** `/categories/{id}` - Delete a specific category
- **GET** `/categories/{id}/products` - Get all products in a specific category

### Purchases Module
- **POST** `/purchases` - Register a purchase
  - **Body**: `{ user_id, product_id }`
- **GET** `/purchases` - Retrieve all purchases
- **GET** `/purchases/{id}` - Retrieve a specific purchase by ID
- **DELETE** `/purchases/{id}` - Cancel a specific purchase
- **GET** `/purchases?user_id=123` - Filter purchases by user

### Wishlist Module
- **POST** `/users/{id}/wishlist` - Add a product to user's wishlist
  - **Body**: `{ product_id }`
- **GET** `/users/{id}/wishlist` - Get user's wishlist
- **DELETE** `/users/{id}/wishlist/{product_id}` - Remove a product from user's wishlist

### Reviews Module
- **POST** `/products/{id}/reviews` - Add a review for a product
  - **Body**: `{ user_id, rating, comment }`
- **GET** `/products/{id}/reviews` - Get all reviews for a product
- **GET** `/reviews/{id}` - Get a specific review by ID
- **PUT** `/reviews/{id}` - Update a specific review
  - **Body**: `{ rating?, comment? }`
- **DELETE** `/reviews/{id}` - Delete a specific review

### Statistics Module (with Redis Caching)
- **GET** `/stats/users` - Get user statistics (total users, new registrations, etc.)
- **GET** `/stats/products` - Get product statistics (total products, most popular, etc.)
- **GET** `/stats/purchases` - Get purchase statistics (total purchases, revenue, etc.)
- **GET** `/stats/review` - Get review statistics (total reviews, average rating, etc.)
- **GET** `/stats/wishlist` - Get wishlist statistics (total wishlist items, most popular, etc.)
- **GET** `/stats/categories` - Get category statistics (total categories, most popular, etc.)
- **GET** `/stats/overview` - Get overall platform statistics (comprehensive dashboard)

### Cache Management (Statistics)
- **POST** `/stats/cache/invalidate/users` - Invalidate user statistics cache
- **POST** `/stats/cache/invalidate/products` - Invalidate product statistics cache
- **POST** `/stats/cache/invalidate/purchases` - Invalidate purchase statistics cache
- **POST** `/stats/cache/invalidate/reviews` - Invalidate review statistics cache
- **POST** `/stats/cache/invalidate/wishlist` - Invalidate wishlist statistics cache
- **POST** `/stats/cache/invalidate/categories` - Invalidate category statistics cache
- **POST** `/stats/cache/invalidate/all` - Invalidate all statistics cache

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server port | `3000` |
| `APP_NAME` | Application name | `Benefits Club Backend` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/benefits-club` |
| `JWT_SECRET` | JWT secret key | `your-super-secret-jwt-key-here` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `REDIS_HOST` | Redis server host | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis server password | `undefined` |
| `REDIS_DB` | Redis database number | `0` |
| `REDIS_TTL` | Redis cache TTL in seconds | `300` |
| `API_PREFIX` | API route prefix | `api` |
| `API_VERSION` | API version | `v1` |
| `THROTTLE_TTL` | Rate limiting TTL | `60` |
| `THROTTLE_LIMIT` | Rate limiting requests | `10` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |

## Scripts

```bash
# Development
npm run start:dev          # Start in development mode with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start in production mode

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## Authentication Flow

1. **Register**: `POST /auth/register` with user details
2. **Login**: `POST /auth/login` with email and password
3. **Use Token**: Include `Authorization: Bearer <token>` header in protected routes

## Database Schemas

### User Schema
```typescript
{
  name: string;         // User's full name
  email: string;        // Unique email address
  password: string;     // Hashed password
  isActive: boolean;    // Account status
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Product Schema
```typescript
{
  name: string;         // Product name
  description: string;  // Product description
  price: number;        // Product price
  category: ObjectId;   // Reference to Category
  isActive: boolean;    // Product availability
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Category Schema
```typescript
{
  name: string;         // Category name
  description: string;  // Category description
  isActive: boolean;    // Category status
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Purchase Schema
```typescript
{
  user: ObjectId;       // Reference to User
  product: ObjectId;    // Reference to Product
  price: number;        // Purchase price
  status: string;       // Purchase status
  createdAt: Date;      // Purchase timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Review Schema
```typescript
{
  user: ObjectId;       // Reference to User
  product: ObjectId;    // Reference to Product
  rating: number;       // Rating (1-5)
  comment: string;      // Review comment
  createdAt: Date;      // Review timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Wishlist Schema
```typescript
{
  user: ObjectId;       // Reference to User
  product: ObjectId;    // Reference to Product
  priority: string;     // Priority level
  createdAt: Date;      // Addition timestamp
  updatedAt: Date;      // Last update timestamp
}
```

## Redis Caching

The application includes Redis caching for statistics endpoints:

- **Automatic Caching**: Statistics are cached on first request
- **Configurable TTL**: Different cache durations for different data types
- **Cache Invalidation**: Manual cache invalidation endpoints
- **Performance**: 90%+ response time improvement for cached data

See `docs/redis-caching.md` for detailed caching documentation.

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - class-validator for request validation
- **CORS Protection** - Configurable CORS settings
- **Rate Limiting** - Throttling protection
- **Global Guards** - JWT protection on all routes except public ones

## Error Handling

The application includes comprehensive error handling:
- Global exception filters
- Standardized error responses
- Proper HTTP status codes
- Detailed error logging

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 