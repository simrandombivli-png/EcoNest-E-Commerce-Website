# EcoNest Python Backend (Flask + SQLite)

A starter REST API for the EcoNest sustainable-products e-commerce design shown in your Figma screenshots.

## Included
- Product catalogue seeded with 12 demo products
- Search, category, price, eco-rating, certification and stock filters
- Sorting and pagination
- Cart add/update/remove/clear and free-shipping progress
- Wishlist toggle
- Checkout form validation and demo order creation
- Order status lookup
- Impact summary endpoint
- SQLite database created automatically at `instance/econest.db`

## Requirements
- Python 3.10 or newer
- Internet is needed only to install the two Python packages. No external database is required.

## Run on Windows
Open a terminal in this folder:

```powershell
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`. Test `http://127.0.0.1:5000/api/health`.

## Important session handling
The frontend should create a random `session_id` once per visitor and keep it in localStorage. Send it with cart, wishlist and checkout requests. This demo does not include user accounts or real payment processing.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/categories` | Category names and counts |
| GET | `/api/products` | List/search/filter/sort products |
| GET | `/api/products/1` | Product details |
| GET | `/api/cart?session_id=YOUR_ID` | Read cart |
| POST | `/api/cart/items` | Add product |
| PATCH | `/api/cart/items/1` | Set quantity; use 0 to remove |
| DELETE | `/api/cart/items/1?session_id=YOUR_ID` | Remove product |
| DELETE | `/api/cart?session_id=YOUR_ID` | Empty cart |
| GET | `/api/wishlist?session_id=YOUR_ID` | Read wishlist |
| POST | `/api/wishlist/1` | Toggle wishlist item |
| POST | `/api/checkout` | Validate address and create demo order |
| GET | `/api/orders/EN-XXXXXXXX` | Check order status |
| GET | `/api/impact` | Impact summary |

### Product query parameters
- `q`: search phrase
- `category`: exact category, e.g. `Solar & Energy`
- `max_price`: maximum price in INR
- `min_eco`: minimum eco rating from 0 to 5
- `certification`: certification/claim text
- `in_stock=true`: only available items
- `sort`: `newest`, `price_low`, `price_high`, `rating`, `popular`, `name`
- `page`: page number
- `per_page`: 1–48

Example:
`GET /api/products?category=Solar%20%26%20Energy&max_price=1000&sort=price_low`

### Add to cart
```json
POST /api/cart/items
{
  "session_id": "demo-session-123",
  "product_id": 5,
  "quantity": 1
}
```

### Change quantity
```json
PATCH /api/cart/items/5
{
  "session_id": "demo-session-123",
  "quantity": 2
}
```

### Wishlist
```json
POST /api/wishlist/5
{
  "session_id": "demo-session-123"
}
```

### Checkout
```json
POST /api/checkout
{
  "session_id": "demo-session-123",
  "full_name": "Demo Customer",
  "email": "demo@example.com",
  "phone": "9876543210",
  "street_address": "12 Example Road",
  "city": "Mumbai",
  "pin_code": "400001",
  "billing_same": true
}
```

Checkout currently creates an order in demo mode and clears the cart. It does **not** charge a payment method or send emails/SMS. The GST calculation is illustrative and must be reviewed for a real store.

## Connecting your Figma frontend
Figma is the design source, not automatically a connected frontend. When your frontend is implemented, call these endpoints using `fetch()` or Axios. CORS is enabled for development; for deployment, restrict allowed origins. Update product images in the database or seed data with the actual image URLs/assets you choose.

## Before production
Add authentication, admin authorization, server-side stock management, rate limiting, CSRF/security controls appropriate to your deployment, secure session identifiers, payment gateway integration, verified tax/shipping logic, privacy policy, and proper logging. Never store card numbers or CVV in this backend.
