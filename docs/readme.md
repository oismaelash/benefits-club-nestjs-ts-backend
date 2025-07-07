# Benefits Club API

## Scenario
API for a benefits club that offers products to users

## Endpoints

prefix: `/api`

### Health Check
- **GET** `/health`  
  Check if the API is online.

### Authentication
- **POST** `/auth/login`  
  User authentication.  
  **Parameters:**  
  - `email`: User's email  
  - `password`: User's password

- **POST** `/auth/register`  
  User registration.  
  **Parameters:**  
  - `name`: User's name  
  - `email`: User's email  
  - `password`: User's password

- **POST** `/auth/logout`  
  User logout.

- **POST** `/auth/refresh`  
  Refresh authentication token.

### Users
- **POST** `/users`  
  Register a new user.  
  **Parameters:**  
  - `name`: User's name  
  - `email`: User's email  
  - `password`: User's password

- **GET** `/users`  
  Retrieve all users.

- **GET** `/users/{id}`  
  Retrieve a specific user by ID.

- **PUT** `/users/{id}`  
  Update a specific user.  
  **Parameters:**  
  - `name`: User's name (optional)  
  - `email`: User's email (optional)

- **DELETE** `/users/{id}`  
  Delete a specific user.

- **GET** `/users/{id}/profile`  
  Get user's detailed profile including statistics.

- **GET** `/users/{id}/purchases`  
  Get all purchases made by a specific user.

### Products
- **GET** `/products/categories`  
  Get available categories for product creation.

- **POST** `/products`  
  Register a new product.  
  **Parameters:**  
  - `name`: Product's name  
  - `description`: Product's description  
  - `price`: Product's price  
  - `category`: Category ID (optional) - Use GET /products/categories to get available categories

- **GET** `/products`  
  Retrieve all products.  
  **Query Parameters:**  
  - `price_min`: Minimum price filter (optional)  
  - `price_max`: Maximum price filter (optional)  
  - `q`: Search keyword (optional)  
  - `category`: Filter by category ID (optional)

- **GET** `/products/{id}`  
  Retrieve a specific product by ID.

- **PUT** `/products/{id}`  
  Update a specific product.  
  **Parameters:**  
  - `name`: Product's name (optional)  
  - `description`: Product's description (optional)  
  - `price`: Product's price (optional)  
  - `category`: Category ID (optional) - Use GET /products/categories to get available categories

- **DELETE** `/products/{id}`  
  Delete a specific product.

- **GET** `/products?price_min=50&price_max=200`  
  Filter products by price range.

- **GET** `/products/search?q=keyword`  
  Search products by name or description.

- **GET** `/products/{id}/purchases`  
  Get all purchases for a specific product.

### Purchases
- **POST** `/purchases`  
  Register a purchase.  
  **Parameters:**  
  - `user_id`: User ID  
  - `product_id`: Product ID

- **GET** `/purchases`  
  Retrieve all purchases.

- **GET** `/purchases/{id}`  
  Retrieve a specific purchase by ID.

- **DELETE** `/purchases/{id}`  
  Cancel a specific purchase.

- **GET** `/purchases?user_id=123`  
  Filter purchases by user.

### Wishlist
- **POST** `/users/{id}/wishlist`  
  Add a product to user's wishlist.  
  **Parameters:**  
  - `product_id`: Product ID

- **GET** `/users/{id}/wishlist`  
  Get user's wishlist.

- **DELETE** `/users/{id}/wishlist/{product_id}`  
  Remove a product from user's wishlist.

### Reviews
- **POST** `/products/{id}/reviews`  
  Add a review for a product.  
  **Parameters:**  
  - `user_id`: User ID  
  - `rating`: Rating (1-5)  
  - `comment`: Review comment

- **GET** `/products/{id}/reviews`  
  Get all reviews for a product.

- **GET** `/reviews/{id}`  
  Get a specific review by ID.

- **PUT** `/reviews/{id}`  
  Update a specific review.  
  **Parameters:**  
  - `rating`: Rating (1-5) (optional)  
  - `comment`: Review comment (optional)

- **DELETE** `/reviews/{id}`  
  Delete a specific review.

### Statistics
- **GET** `/stats/users`  
  Get user statistics (total users, new registrations, etc.).

- **GET** `/stats/products`  
  Get product statistics (total products, most popular, etc.).

- **GET** `/stats/purchases`  
  Get purchase statistics (total purchases, revenue, etc.).

- **GET** `/stats/review`  
  Get review statistics (total reviews, average rating, etc.).

- **GET** `/stats/wishlist`  
  Get wishlist statistics (total wishlist items, most popular, etc.).

- **GET** `/stats/categories`  
  Get category statistics (total categories, most popular, etc.).

- **GET** `/stats/overview`  
  Get overall platform statistics (comprehensive dashboard).

### Cache Management (Statistics)
- **POST** `/stats/cache/invalidate/users`  
  Invalidate user statistics cache.

- **POST** `/stats/cache/invalidate/products`  
  Invalidate product statistics cache.

- **POST** `/stats/cache/invalidate/purchases`  
  Invalidate purchase statistics cache.

- **POST** `/stats/cache/invalidate/reviews`  
  Invalidate review statistics cache.

- **POST** `/stats/cache/invalidate/wishlist`  
  Invalidate wishlist statistics cache.

- **POST** `/stats/cache/invalidate/categories`  
  Invalidate category statistics cache.

- **POST** `/stats/cache/invalidate/all`  
  Invalidate all statistics cache.

### Categories
- **POST** `/categories`  
  Create a new product category.  
  **Parameters:**  
  - `name`: Category name  
  - `description`: Category description

- **GET** `/categories`  
  Get all categories.

- **GET** `/categories/{id}`  
  Get a specific category by ID.

- **PUT** `/categories/{id}`  
  Update a specific category.

- **DELETE** `/categories/{id}`  
  Delete a specific category.

- **GET** `/categories/{id}/products`  
  Get all products in a specific category.