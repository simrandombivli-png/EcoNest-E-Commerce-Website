from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import secrets
import hashlib
import hmac
import re
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("ECONEST_DB_PATH", os.path.join(BASE_DIR, "instance", "econest.db"))
app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False
CORS(app)  # In production, restrict origins to your actual frontend domain.

CATEGORIES = [
    "Bamboo Products", "Reusable Kitchen", "Recycled Fashion",
    "Solar & Energy", "Home & Garden", "Zero-Waste Personal Care"
]

SEED_PRODUCTS = [
    ("Solar Reading Lamp", "Solar & Energy", 749, 949, 4.5, 122, 5, "A compact solar-powered reading lamp.", "", 21, "FSC-style packaging", 0.8, 1),
    ("Kitchen Compost Bin", "Home & Garden", 799, 999, 4.6, 115, 5, "A countertop bin for collecting kitchen scraps.", "", 20, "Plastic-free packaging", 1.1, 1),
    ("Recycled Yoga Mat", "Recycled Fashion", 1299, 1599, 4.9, 108, 4, "A grippy yoga mat made with recycled materials.", "", 19, "Recycled materials", 1.4, 1),
    ("Bamboo Toothbrush Set", "Bamboo Products", 199, 249, 4.8, 45, 5, "Everyday toothbrushes with bamboo handles.", "", 20, "Plastic-free", 0.2, 1),
    ("Steel Water Bottle", "Reusable Kitchen", 649, 799, 4.7, 52, 5, "Reusable insulated steel bottle for daily hydration.", "", 19, "Reusable product", 0.9, 1),
    ("Recycled Cotton Tote", "Recycled Fashion", 299, 399, 4.6, 59, 4, "A sturdy tote made with recycled cotton.", "", 25, "Recycled textiles", 0.5, 1),
    ("Compostable Phone Case", "Recycled Fashion", 499, 699, 4.5, 66, 5, "A lightweight phone case designed with compostable materials.", "", 29, "Compostable materials", 0.4, 1),
    ("Beeswax Food Wraps", "Reusable Kitchen", 349, 449, 4.7, 80, 5, "Washable wraps for covering bowls and storing food.", "", 22, "Reusable alternative", 0.6, 1),
    ("Solar Garden Lights", "Solar & Energy", 899, 1199, 4.9, 73, 5, "Decorative solar lights for balconies and gardens.", "", 25, "Solar powered", 1.3, 1),
    ("Bamboo Storage Tray", "Bamboo Products", 399, 499, 4.6, 39, 4, "A versatile tray made from bamboo.", "", 20, "Renewable material", 0.5, 1),
    ("Natural Soap Bars", "Zero-Waste Personal Care", 249, 299, 4.4, 31, 4, "Gentle soap bars with minimal packaging.", "", 17, "Low-waste packaging", 0.3, 1),
    ("Indoor Air-Purifying Plant", "Home & Garden", 599, 749, 4.7, 48, 5, "An easy-care indoor plant for your home.", "", 20, "Plant-based choice", 0.7, 1),
]

def connect():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con

def rows_as_dicts(rows):
    return [dict(row) for row in rows]

def init_db():
    with connect() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL CHECK(price >= 0),
            original_price INTEGER NOT NULL CHECK(original_price >= price),
            rating REAL NOT NULL DEFAULT 0,
            review_count INTEGER NOT NULL DEFAULT 0,
            eco_rating INTEGER NOT NULL DEFAULT 0 CHECK(eco_rating BETWEEN 0 AND 5),
            description TEXT NOT NULL DEFAULT '',
            image_url TEXT NOT NULL DEFAULT '',
            discount_percent INTEGER NOT NULL DEFAULT 0,
            certification TEXT NOT NULL DEFAULT '',
            co2_saved_kg REAL NOT NULL DEFAULT 0,
            in_stock INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS carts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id),
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            UNIQUE(cart_id, product_id)
        );
        CREATE TABLE IF NOT EXISTS wishlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            product_id INTEGER NOT NULL REFERENCES products(id),
            created_at TEXT NOT NULL,
            UNIQUE(session_id, product_id)
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT NOT NULL UNIQUE,
            session_id TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            street_address TEXT NOT NULL,
            city TEXT NOT NULL,
            pin_code TEXT NOT NULL,
            billing_same INTEGER NOT NULL DEFAULT 1,
            subtotal INTEGER NOT NULL,
            delivery_fee INTEGER NOT NULL,
            gst INTEGER NOT NULL,
            total INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'Placed',
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id),
            product_name TEXT NOT NULL,
            unit_price INTEGER NOT NULL,
            quantity INTEGER NOT NULL
        );
        """)
        count = con.execute("SELECT COUNT(*) AS n FROM products").fetchone()["n"]
        if count == 0:
            now = datetime.now(timezone.utc).isoformat()
            for p in SEED_PRODUCTS:
                name, category, price, original, rating, reviews, eco, desc_, image, discount, cert, co2, stock = p
                # Placeholder text is intentionally not stored as an image URL.
                image = "" if "placeholder" in image else image
                con.execute("""INSERT INTO products
                    (name, category, price, original_price, rating, review_count, eco_rating,
                     description, image_url, discount_percent, certification, co2_saved_kg,
                     in_stock, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (name, category, price, original, rating, reviews, eco, desc_, image,
                     discount, cert, co2, stock, now))

def get_or_create_cart(session_id):
    if not session_id or len(session_id) > 100:
        session_id = secrets.token_urlsafe(18)
    with connect() as con:
        con.execute("INSERT OR IGNORE INTO carts(session_id, created_at) VALUES (?, ?)",
                    (session_id, datetime.now(timezone.utc).isoformat()))
        cart_id = con.execute("SELECT id FROM carts WHERE session_id=?", (session_id,)).fetchone()["id"]
    return session_id, cart_id

def cart_payload(session_id):
    session_id, cart_id = get_or_create_cart(session_id)
    with connect() as con:
        items = con.execute("""
            SELECT p.id AS product_id, p.name, p.category, p.price, p.image_url,
                   p.co2_saved_kg, ci.quantity, (p.price * ci.quantity) AS line_total
            FROM cart_items ci JOIN products p ON p.id=ci.product_id
            WHERE ci.cart_id=? ORDER BY ci.id
        """, (cart_id,)).fetchall()
    items = rows_as_dicts(items)
    subtotal = sum(i["line_total"] for i in items)
    delivery = 0 if subtotal >= 999 or subtotal == 0 else 49
    return {"session_id": session_id, "items": items, "item_count": sum(i["quantity"] for i in items),
            "subtotal": subtotal, "delivery_fee": delivery, "free_shipping_threshold": 999,
            "amount_until_free_shipping": max(0, 999-subtotal),
            "co2_saved_kg": round(sum(i["co2_saved_kg"]*i["quantity"] for i in items), 2),
            "total_before_gst": subtotal + delivery}

@app.get("/")
def index():
    return jsonify({"name": "EcoNest API", "status": "running", "version": "1.0.0",
                    "docs": "See README.md for endpoint examples."})

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "database": "sqlite"})

@app.get("/api/categories")
def categories():
    with connect() as con:
        data = con.execute("SELECT category, COUNT(*) AS product_count FROM products GROUP BY category ORDER BY category").fetchall()
    return jsonify(rows_as_dicts(data))

@app.get("/api/products")
def list_products():
    search = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    max_price = request.args.get("max_price", type=int)
    min_eco = request.args.get("min_eco", type=int)
    certification = request.args.get("certification", "").strip()
    in_stock = request.args.get("in_stock", "false").lower() in ("1", "true", "yes")
    sort = request.args.get("sort", "newest").lower()
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(48, max(1, request.args.get("per_page", 12, type=int)))

    where, params = [], []
    if search:
        where.append("(name LIKE ? OR description LIKE ? OR category LIKE ?)")
        params.extend([f"%{search}%"]*3)
    if category and category.lower() != "all":
        where.append("category = ?"); params.append(category)
    if max_price is not None:
        where.append("price <= ?"); params.append(max(0, max_price))
    if min_eco is not None:
        where.append("eco_rating >= ?"); params.append(max(0, min(5, min_eco)))
    if certification and certification.lower() != "all":
        where.append("certification LIKE ?"); params.append(f"%{certification}%")
    if in_stock:
        where.append("in_stock = 1")
    order = {"newest": "created_at DESC, id DESC", "price_low": "price ASC",
             "price_high": "price DESC", "rating": "rating DESC",
             "popular": "review_count DESC", "name": "name ASC"}.get(sort, "created_at DESC, id DESC")
    clause = (" WHERE " + " AND ".join(where)) if where else ""
    with connect() as con:
        total = con.execute(f"SELECT COUNT(*) AS n FROM products{clause}", params).fetchone()["n"]
        products = con.execute(f"SELECT * FROM products{clause} ORDER BY {order} LIMIT ? OFFSET ?",
                               params + [per_page, (page-1)*per_page]).fetchall()
    return jsonify({"products": rows_as_dicts(products), "total": total, "page": page,
                    "per_page": per_page, "pages": (total+per_page-1)//per_page})

@app.get("/api/products/<int:product_id>")
def product_detail(product_id):
    with connect() as con:
        p = con.execute("SELECT * FROM products WHERE id=?", (product_id,)).fetchone()
    if not p:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(dict(p))

@app.get("/api/cart")
def get_cart():
    payload = cart_payload(request.args.get("session_id", ""))
    response = jsonify(payload)
    response.headers["X-EcoNest-Session"] = payload["session_id"]
    return response

@app.post("/api/cart/items")
def add_to_cart():
    data = request.get_json(silent=True) or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    session_id = data.get("session_id", "")
    if not isinstance(product_id, int) or not isinstance(quantity, int) or quantity < 1 or quantity > 99:
        return jsonify({"error": "product_id and quantity must be valid integers; quantity must be 1–99"}), 400
    session_id, cart_id = get_or_create_cart(session_id)
    with connect() as con:
        product = con.execute("SELECT id, in_stock FROM products WHERE id=?", (product_id,)).fetchone()
        if not product:
            return jsonify({"error": "Product not found"}), 404
        if not product["in_stock"]:
            return jsonify({"error": "This product is currently out of stock"}), 409
        existing = con.execute("SELECT quantity FROM cart_items WHERE cart_id=? AND product_id=?",
                               (cart_id, product_id)).fetchone()
        new_quantity = quantity + (existing["quantity"] if existing else 0)
        if new_quantity > 99:
            return jsonify({"error": "Maximum quantity per product is 99"}), 400
        con.execute("""INSERT INTO cart_items(cart_id, product_id, quantity) VALUES (?, ?, ?)
                       ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity=excluded.quantity""",
                    (cart_id, product_id, new_quantity))
    result = cart_payload(session_id)
    return jsonify(result), 201

@app.patch("/api/cart/items/<int:product_id>")
def update_cart_item(product_id):
    data = request.get_json(silent=True) or {}
    session_id, cart_id = get_or_create_cart(data.get("session_id", ""))
    quantity = data.get("quantity")
    if not isinstance(quantity, int) or quantity < 0 or quantity > 99:
        return jsonify({"error": "quantity must be an integer from 0 to 99; use 0 to remove"}), 400
    with connect() as con:
        item = con.execute("SELECT id FROM cart_items WHERE cart_id=? AND product_id=?", (cart_id, product_id)).fetchone()
        if not item:
            return jsonify({"error": "Item is not in this cart"}), 404
        if quantity == 0:
            con.execute("DELETE FROM cart_items WHERE cart_id=? AND product_id=?", (cart_id, product_id))
        else:
            con.execute("UPDATE cart_items SET quantity=? WHERE cart_id=? AND product_id=?", (quantity, cart_id, product_id))
    return jsonify(cart_payload(session_id))

@app.delete("/api/cart/items/<int:product_id>")
def remove_cart_item(product_id):
    session_id = request.args.get("session_id", "")
    session_id, cart_id = get_or_create_cart(session_id)
    with connect() as con:
        con.execute("DELETE FROM cart_items WHERE cart_id=? AND product_id=?", (cart_id, product_id))
    return jsonify(cart_payload(session_id))

@app.delete("/api/cart")
def clear_cart():
    session_id, cart_id = get_or_create_cart(request.args.get("session_id", ""))
    with connect() as con:
        con.execute("DELETE FROM cart_items WHERE cart_id=?", (cart_id,))
    return jsonify(cart_payload(session_id))

@app.get("/api/wishlist")
def get_wishlist():
    session_id = request.args.get("session_id", "")
    if not session_id:
        return jsonify({"session_id": "", "products": []})
    with connect() as con:
        products = con.execute("""SELECT p.* FROM wishlists w JOIN products p ON p.id=w.product_id
                                  WHERE w.session_id=? ORDER BY w.created_at DESC""", (session_id,)).fetchall()
    return jsonify({"session_id": session_id, "products": rows_as_dicts(products)})

@app.post("/api/wishlist/<int:product_id>")
def toggle_wishlist(product_id):
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id", "")
    if not session_id:
        session_id = secrets.token_urlsafe(18)
    with connect() as con:
        if not con.execute("SELECT id FROM products WHERE id=?", (product_id,)).fetchone():
            return jsonify({"error": "Product not found"}), 404
        existing = con.execute("SELECT id FROM wishlists WHERE session_id=? AND product_id=?",
                               (session_id, product_id)).fetchone()
        if existing:
            con.execute("DELETE FROM wishlists WHERE id=?", (existing["id"],))
            action = "removed"
        else:
            con.execute("INSERT INTO wishlists(session_id, product_id, created_at) VALUES (?, ?, ?)",
                        (session_id, product_id, datetime.now(timezone.utc).isoformat()))
            action = "added"
    return jsonify({"session_id": session_id, "product_id": product_id, "action": action})

def validate_checkout(data):
    required = ["full_name", "email", "phone", "street_address", "city", "pin_code"]
    missing = [k for k in required if not str(data.get(k, "")).strip()]
    if missing:
        return f"Missing required fields: {', '.join(missing)}"
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", str(data["email"]).strip()):
        return "Enter a valid email address"
    if not re.fullmatch(r"[6-9]\d{9}", re.sub(r"\s+", "", str(data["phone"]))):
        return "Enter a valid 10-digit Indian mobile number"
    if not re.fullmatch(r"\d{6}", str(data["pin_code"]).strip()):
        return "PIN code must contain 6 digits"
    if len(str(data["full_name"]).strip()) < 2:
        return "Enter your full name"
    return None

@app.post("/api/checkout")
def checkout():
    data = request.get_json(silent=True) or {}
    error = validate_checkout(data)
    if error:
        return jsonify({"error": error}), 400
    session_id = data.get("session_id", "")
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    cart = cart_payload(session_id)
    if not cart["items"]:
        return jsonify({"error": "Your cart is empty"}), 400
    subtotal = cart["subtotal"]
    delivery = 0 if subtotal >= 999 else 49
    # Demonstration tax calculation. Confirm the applicable tax rules before production use.
    gst = round(subtotal * 0.18)
    total = subtotal + delivery + gst
    order_number = "EN-" + secrets.token_hex(4).upper()
    now = datetime.now(timezone.utc).isoformat()
    with connect() as con:
        cur = con.execute("""INSERT INTO orders
            (order_number, session_id, full_name, email, phone, street_address, city, pin_code,
             billing_same, subtotal, delivery_fee, gst, total, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Placed', ?)""",
            (order_number, session_id, data["full_name"].strip(), data["email"].strip(),
             re.sub(r"\s+", "", str(data["phone"])), data["street_address"].strip(),
             data["city"].strip(), data["pin_code"].strip(), int(bool(data.get("billing_same", True))),
             subtotal, delivery, gst, total, now))
        order_id = cur.lastrowid
        for item in cart["items"]:
            con.execute("""INSERT INTO order_items(order_id, product_id, product_name, unit_price, quantity)
                           VALUES (?, ?, ?, ?, ?)""",
                        (order_id, item["product_id"], item["name"], item["price"], item["quantity"]))
        cart_id = con.execute("SELECT id FROM carts WHERE session_id=?", (session_id,)).fetchone()["id"]
        con.execute("DELETE FROM cart_items WHERE cart_id=?", (cart_id,))
    return jsonify({"message": "Order placed successfully (demo mode; no payment was processed)",
                    "order_number": order_number, "status": "Placed",
                    "pricing": {"subtotal": subtotal, "delivery_fee": delivery, "gst": gst, "total": total},
                    "co2_saved_kg": cart["co2_saved_kg"]}), 201

@app.get("/api/orders/<order_number>")
def order_status(order_number):
    with connect() as con:
        order = con.execute("""SELECT order_number, full_name, status, subtotal, delivery_fee, gst, total, created_at
                               FROM orders WHERE order_number=?""", (order_number.upper(),)).fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404
        items = con.execute("SELECT product_name, unit_price, quantity FROM order_items WHERE order_id=(SELECT id FROM orders WHERE order_number=?)",
                            (order_number.upper(),)).fetchall()
    result = dict(order)
    result["items"] = rows_as_dicts(items)
    return jsonify(result)

@app.get("/api/impact")
def impact():
    with connect() as con:
        products = con.execute("SELECT COUNT(*) AS count FROM products").fetchone()["count"]
        total_reviews = con.execute("SELECT COALESCE(SUM(review_count),0) AS n FROM products").fetchone()["n"]
        total_co2 = con.execute("SELECT COALESCE(SUM(co2_saved_kg),0) AS n FROM products WHERE in_stock=1").fetchone()["n"]
        orders = con.execute("SELECT COUNT(*) AS n FROM orders").fetchone()["n"]
    return jsonify({"products_available": products, "community_reviews": total_reviews,
                    "estimated_co2_saving_per_product_kg": round(total_co2, 2),
                    "orders_placed": orders,
                    "note": "Impact figures are illustrative demo data, not independently verified claims."})

@app.errorhandler(404)
def not_found(_):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(_):
    return jsonify({"error": "Internal server error"}), 500

init_db()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=True)
