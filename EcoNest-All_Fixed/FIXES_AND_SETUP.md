# EcoNest — consolidated fixes and setup

This complete project preserves the original frontend design and the Flask/SQLite backend.

## Fixes included
- Home header search: Enter or search icon sends the query to the product listing.
- Help FAQ: Sustainability and Returns expand to show explanations; Where is my order navigates to orders.
- Dark mode: explicit backgrounds and text for cards, buttons, forms, search and help, plus saved browser preference.
- Account login/register, remembered accounts, cart, wishlist, checkout and order history retained.

## Run locally (two terminals inside this folder)

Backend: `py -m pip install -r requirements.txt` then `py app.py` (on Windows).
Frontend: `npm install` then `npm run dev`.
Open the Vite URL printed in the terminal (usually http://localhost:5173).

SQLite database files under `instance/` are local data and intentionally not included.
Users registered on one local backend are not automatically registered on another computer.

## GitHub
Upload this folder as `EcoNest-Final/` inside the existing repository; do not overwrite the original root files.
Do not commit `node_modules/`, `instance/`, `.env`, `*.db`, or `*.sqlite3`.

## Verification checklist
1. Toggle dark mode: cards, product names, filters and search all change and remain readable.
2. Refresh: theme remains selected.
3. Search for `shampoo` using Enter and the icon; the product listing filters accordingly.
4. Help > What makes a product sustainable? and How do returns work? both expand.
5. Test registration, login, remembered-account selection, cart and checkout with backend running.

Google Fonts require internet; if unavailable, system font fallbacks may look slightly different, though the colors remain consistent.
