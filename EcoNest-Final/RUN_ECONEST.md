# EcoNest — run the original design with SQLite

The original React pages and CSS are retained. Flask now stores cart, wishlist and demo checkout orders in SQLite (`instance/econest.db`). Payment screens are **demo-only**: no payment is charged. Profile/login remains the original browser-only demo and is not secure account authentication.

## Terminal 1: backend
```powershell
py -m pip install -r requirements.txt
py app.py
```
Visit http://127.0.0.1:5000/api/health

## Terminal 2: frontend
```powershell
npm install
npm run dev
```
Visit http://localhost:5173

Keep both terminals running. The SQLite file is created automatically. For repeat testing, use the same browser; a per-browser session ID identifies its saved cart and orders. Do not enter real payment credentials in this demo.
