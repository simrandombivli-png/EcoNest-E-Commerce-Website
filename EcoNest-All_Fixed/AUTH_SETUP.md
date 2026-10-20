# EcoNest account system (SQLite)

Run `py -m pip install -r requirements.txt` and `py app.py` in one terminal, and `npm install` and `npm run dev` in another. Open http://localhost:5173.

Register from Profile → Create account. Log out from Profile. Previously used account names/emails are remembered in **this browser only**, with no saved passwords. Selecting an account fills its email; the password must be entered. The authentication token is held in sessionStorage (tab session). Passwords are hashed using Werkzeug.

Cart, wishlist and orders use a server-derived `user:<id>` session namespace when logged in. Guest carts and wishlists use a separate browser identifier; checkout requires sign-in. Existing guest items are not automatically transferred to an account. The app still uses demo payments: no real payment is processed.

**Deployment:** Set `ECONEST_DB_PATH` to a persistent volume path, set `ECONEST_FRONTEND_ORIGIN` to the exact deployed frontend origin, and use a production WSGI server (not Flask debug). SQLite on ephemeral hosting will lose data. Add HTTPS, rate limiting, email verification, password reset, CSRF protections if using cookies, and a managed DB before handling real customers or payments.
