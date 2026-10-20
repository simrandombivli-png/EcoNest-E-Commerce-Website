from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
import os
import secrets
import hashlib
import hmac
from werkzeug.security import generate_password_hash, check_password_hash
import re
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("ECONEST_DB_PATH", os.path.join(BASE_DIR, "instance", "econest.db"))
app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False
CORS(app, resources={r"/api/*": {"origins": os.environ.get("ECONEST_FRONTEND_ORIGIN", "http://localhost:5173").split(",")}})

CATEGORIES = [
    "Bamboo Products", "Reusable Kitchen", "Recycled Fashion",
    "Solar & Energy", "Home & Garden", "Zero-Waste Personal Care"
]

SEED_PRODUCTS = [
    ('Bamboo Toothbrush Set', 'Bamboo Products', 199, 249, 4.8, 40, 5, 'Eco-friendly product', '', 20, 'Eco-friendly', 0.5, 1),
    ('Steel Water Bottle', 'Reusable Kitchen', 649, 799, 4.7, 40, 5, 'Eco-friendly product', '', 18, 'Eco-friendly', 0.5, 1),
    ('Recycled Cotton Tote', 'Recycled Fashion', 299, 399, 4.6, 40, 4, 'Eco-friendly product', '', 25, 'Eco-friendly', 0.5, 1),
    ('Compostable Phone Case', 'Recycled Fashion', 499, 699, 4.5, 40, 4, 'Eco-friendly product', '', 28, 'Eco-friendly', 0.5, 1),
    ('Solar Garden Lights', 'Solar & Energy', 899, 1199, 4.9, 40, 5, 'Eco-friendly product', '', 25, 'Eco-friendly', 0.5, 1),
    ('Beeswax Food Wraps', 'Reusable Kitchen', 349, 449, 4.7, 40, 5, 'Eco-friendly product', '', 22, 'Eco-friendly', 0.5, 1),
    ('Coconut Fibre Planter', 'Home & Garden', 449, 549, 4.4, 40, 4, 'Eco-friendly product', '', 18, 'Eco-friendly', 0.5, 1),
    ('Solid Shampoo Bar', 'Zero-Waste Personal Care', 279, 349, 4.8, 40, 5, 'Eco-friendly product', '', 20, 'Eco-friendly', 0.5, 1),
    ('Bamboo Desk Organiser', 'Bamboo Products', 549, 699, 4.3, 40, 4, 'Eco-friendly product', '', 21, 'Eco-friendly', 0.5, 1),
    ('Recycled Yoga Mat', 'Recycled Fashion', 1299, 1599, 4.9, 40, 4, 'Eco-friendly product', '', 18, 'Eco-friendly', 0.5, 1),
    ('Kitchen Compost Bin', 'Home & Garden', 799, 999, 4.6, 40, 5, 'Eco-friendly product', '', 20, 'Eco-friendly', 0.5, 1),
    ('Solar Reading Lamp', 'Solar & Energy', 749, 949, 4.5, 40, 5, 'Eco-friendly product', '', 21, 'Eco-friendly', 0.5, 1),
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
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS auth_sessions (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TEXT NOT NULL
        );
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

def token_user():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    token = header[7:].strip()
    if not token:
        return None
    digest = hashlib.sha256(token.encode()).hexdigest()
    with connect() as con:
        row = con.execute("SELECT u.id, u.name, u.email FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?", (digest,)).fetchone()
    return dict(row) if row else None

def current_session(provided=""):
    user = token_user()
    if user:
        return f"user:{user['id']}"
    if isinstance(provided, str) and provided.startswith("user:"):
        return None
    return provided if isinstance(provided, str) and len(provided) <= 100 else ""

def require_account():
    user = token_user()
    if not user:
        return None, (jsonify({"error": "Please sign in to continue"}), 401)
    return user, None

def issue_token(user):
    token = secrets.token_urlsafe(32)
    with connect() as con:
        con.execute("INSERT INTO auth_sessions(token_hash,user_id,created_at) VALUES (?,?,?)", (hashlib.sha256(token.encode()).hexdigest(), user['id'], datetime.now(timezone.utc).isoformat()))
    return jsonify({"token": token, "user": dict(user)})

@app.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if len(name) < 2 or len(name) > 100 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(password) < 8 or len(password) > 128:
        return jsonify({"error": "Enter a valid name, email and password (8–128 characters)"}), 400
    with connect() as con:
        if con.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone():
            return jsonify({"error": "An account with this email already exists"}), 409
        cur = con.execute("INSERT INTO users(name,email,password_hash,created_at) VALUES (?,?,?,?)", (name,email,generate_password_hash(password),datetime.now(timezone.utc).isoformat()))
        user = {"id":cur.lastrowid,"name":name,"email":email}
    return issue_token(user)

@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    with connect() as con:
        row = con.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not row or not check_password_hash(row['password_hash'],password):
        return jsonify({"error": "Incorrect email or password"}), 401
    return issue_token({"id":row['id'],"name":row['name'],"email":row['email']})

@app.get("/api/auth/me")
def me():
    user, error = require_account()
    return error if error else jsonify({"user":user})

@app.post("/api/auth/logout")
def logout():
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        with connect() as con:
            con.execute("DELETE FROM auth_sessions WHERE token_hash=?",(hashlib.sha256(header[7:].strip().encode()).hexdigest(),))
    return jsonify({"ok":True})

@app.put("/api/auth/profile")
def edit_profile():
    user, error = require_account()
    if error: return error
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if len(name)<2 or len(name)>100 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or (password and len(password)<8):
        return jsonify({"error":"Invalid profile information"}),400
    with connect() as con:
        exists=con.execute("SELECT id FROM users WHERE email=? AND id<>?",(email,user['id'])).fetchone()
        if exists: return jsonify({"error":"Email is already registered"}),409
        if password:
            con.execute("UPDATE users SET name=?,email=?,password_hash=? WHERE id=?",(name,email,generate_password_hash(password),user['id']))
        else:
            con.execute("UPDATE users SET name=?,email=? WHERE id=?",(name,email,user['id']))
    return jsonify({"user":{"id":user['id'],"name":name,"email":email}})

@app.before_request
def guard_user_namespace():
    if request.path.startswith("/api/") and not request.path.startswith("/api/auth/"):
        data = request.get_json(silent=True) if request.method in ("POST","PUT","PATCH") else None
        provided = (data or {}).get("session_id", "") if isinstance(data,dict) else request.args.get("session_id", "")
        if isinstance(provided,str) and provided.startswith("user:") and not token_user():
            return jsonify({"error":"Please sign in to access this account"}),401

def get_or_create_cart(session_id):
    if session_id is None: raise ValueError("Unauthorized account session")
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
    payload = cart_payload(current_session(request.args.get("session_id", "")))
    response = jsonify(payload)
    response.headers["X-EcoNest-Session"] = payload["session_id"]
    return response

@app.post("/api/cart/items")
def add_to_cart():
    data = request.get_json(silent=True) or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    session_id = current_session(data.get("session_id", ""))
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
    session_id, cart_id = get_or_create_cart(current_session(data.get("session_id", "")))
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
    session_id = current_session(request.args.get("session_id", ""))
    session_id, cart_id = get_or_create_cart(session_id)
    with connect() as con:
        con.execute("DELETE FROM cart_items WHERE cart_id=? AND product_id=?", (cart_id, product_id))
    return jsonify(cart_payload(session_id))

@app.delete("/api/cart")
def clear_cart():
    session_id, cart_id = get_or_create_cart(current_session(request.args.get("session_id", "")))
    with connect() as con:
        con.execute("DELETE FROM cart_items WHERE cart_id=?", (cart_id,))
    return jsonify(cart_payload(session_id))

@app.put("/api/cart")
def replace_cart():
    data = request.get_json(silent=True) or {}
    session_id, cart_id = get_or_create_cart(current_session(data.get("session_id", "")))
    items = data.get("items", {})
    if not isinstance(items, dict):
        return jsonify({"error": "items must be an object"}), 400
    with connect() as con:
        valid = {r["id"]: bool(r["in_stock"]) for r in con.execute("SELECT id, in_stock FROM products")}
        parsed = {}
        for key, quantity in items.items():
            try:
                product_id = int(key)
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid product ID"}), 400
            if type(quantity) is not int or quantity < 1 or quantity > 99 or not valid.get(product_id):
                return jsonify({"error": "Invalid product or quantity"}), 400
            parsed[product_id] = quantity
        con.execute("DELETE FROM cart_items WHERE cart_id=?", (cart_id,))
        for product_id, quantity in parsed.items():
            con.execute("INSERT INTO cart_items(cart_id, product_id, quantity) VALUES (?, ?, ?)", (cart_id, product_id, quantity))
    return jsonify(cart_payload(session_id))

@app.put("/api/wishlist")
def replace_wishlist():
    data = request.get_json(silent=True) or {}
    session_id = current_session(data.get("session_id", ""))
    ids = data.get("product_ids", [])
    if not session_id or not isinstance(ids, list) or any(type(i) is not int for i in ids):
        return jsonify({"error": "Invalid wishlist"}), 400
    with connect() as con:
        valid = {r["id"] for r in con.execute("SELECT id FROM products")}
        if any(i not in valid for i in ids):
            return jsonify({"error": "Unknown product"}), 400
        con.execute("DELETE FROM wishlists WHERE session_id=?", (session_id,))
        for i in dict.fromkeys(ids):
            con.execute("INSERT INTO wishlists(session_id, product_id, created_at) VALUES (?, ?, ?)", (session_id, i, datetime.now(timezone.utc).isoformat()))
    return jsonify({"ok": True})

@app.get("/api/orders")
def list_orders():
    user, error = require_account()
    if error: return error
    session_id = current_session(request.args.get("session_id", ""))
    if not session_id:
        return jsonify({"orders": []})
    with connect() as con:
        rows = con.execute("SELECT id, order_number, status, created_at, total FROM orders WHERE session_id=? ORDER BY id DESC", (session_id,)).fetchall()
        result = []
        for order in rows:
            lines = con.execute("SELECT product_id, quantity FROM order_items WHERE order_id=?", (order["id"],)).fetchall()
            result.append({"id": order["order_number"], "status": order["status"], "date": datetime.fromisoformat(order["created_at"]).strftime("%d %b %Y"), "total": order["total"], "items": [{"id": x["product_id"], "qty": x["quantity"]} for x in lines], "step": 0, "delivery": "To be updated"})
    return jsonify({"orders": result})

@app.get("/api/wishlist")
def get_wishlist():
    session_id = current_session(request.args.get("session_id", ""))
    if not session_id:
        return jsonify({"session_id": "", "products": []})
    with connect() as con:
        products = con.execute("""SELECT p.* FROM wishlists w JOIN products p ON p.id=w.product_id
                                  WHERE w.session_id=? ORDER BY w.created_at DESC""", (session_id,)).fetchall()
    return jsonify({"session_id": session_id, "products": rows_as_dicts(products)})

@app.post("/api/wishlist/<int:product_id>")
def toggle_wishlist(product_id):
    data = request.get_json(silent=True) or {}
    session_id = current_session(data.get("session_id", ""))
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
    user, error = require_account()
    if error: return error
    data = request.get_json(silent=True) or {}
    error = validate_checkout(data)
    if error:
        return jsonify({"error": error}), 400
    session_id = current_session(data.get("session_id", ""))
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    cart = cart_payload(session_id)
    if not cart["items"]:
        return jsonify({"error": "Your cart is empty"}), 400
    subtotal = cart["subtotal"]
    delivery = data.get("shipping_fee", 49)
    if type(delivery) is not int or delivery not in (0, 49, 99):
        return jsonify({"error": "Invalid shipping option"}), 400
    # Demonstration tax calculation. Confirm the applicable tax rules before production use.
    gst = round(subtotal * 0.18)
    carbon = 20 if data.get("carbon_offset") is True else 0
    base = subtotal + delivery + gst + carbon
    donation = (100 - base % 100) % 100 if data.get("round_up") is True else 0
    total = base + donation
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
    user, error = require_account()
    if error: return error
    with connect() as con:
        order = con.execute("""SELECT order_number, full_name, status, subtotal, delivery_fee, gst, total, created_at
                               FROM orders WHERE order_number=? AND session_id=?""", (order_number.upper(), f"user:{user['id']}")).fetchone()
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
