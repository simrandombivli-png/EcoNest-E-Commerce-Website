import { useEffect, useMemo, useState } from "react"

type Product = {
  id: number
  name: string
  category: string
  price: number
  original: number
  rating: number
  eco: number
  certs: string[]
  material: string
  image: string
  imageAlt: string
  stock: boolean
  impact: string
  features: string[]
}

type Cart = Record<number, number>
type SavedOrder = {
  id: string
  status: string
  date: string
  total: number
  items: { id: number; qty: number }[]
  step: number
  delivery: string
}
type Page = "home" | "products" | "detail" | "cart" | "checkout" | "confirmation" | "wishlist" | "profile" | "about" | "contact" | "login" | "orders"

const photos = [
  "https://images.unsplash.com/photo-1563391500723-45ce9664ddd6?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1563391506244-af91a410fcc9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1563391507496-209fc783d42e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1762983003454-c3342d74e625?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1764909262009-3dcd5691185c?auto=format&fit=crop&w=900&q=85",
]

const products: Product[] = [
  {
    id: 1,
    name: "Bamboo Toothbrush Set",
    category: "Bamboo Products",
    price: 199,
    original: 249,
    rating: 4.8,
    eco: 5,
    certs: ["FSC", "Plastic-Free"],
    material: "FSC bamboo",
    image:
      "https://images.unsplash.com/photo-1676897288522-e8a081e71430?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Bamboo toothbrush with toothpaste ready for use",
    stock: true,
    impact: "Saves 4 plastic toothbrushes",
    features: [
      "Plant-based bristles",
      "Set of four",
      "Compostable handles",
      "Recycled packaging",
    ],
  },
  {
    id: 2,
    name: "Steel Water Bottle",
    category: "Reusable Kitchen",
    price: 649,
    original: 799,
    rating: 4.7,
    eco: 5,
    certs: ["Carbon Neutral", "Plastic-Free"],
    material: "Food-grade steel",
    image:
      "https://images.unsplash.com/photo-1625708458528-802ec79b1ed8?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Reusable stainless steel water bottles on a light surface",
    stock: true,
    impact: "Replaces 300 plastic bottles",
    features: [
      "750 ml",
      "Double-wall insulation",
      "Leakproof lid",
      "24-hour cold",
    ],
  },
  {
    id: 3,
    name: "Recycled Cotton Tote",
    category: "Recycled Fashion",
    price: 299,
    original: 399,
    rating: 4.6,
    eco: 4,
    certs: ["Recycled Content"],
    material: "80% recycled cotton",
    image:
      "https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Natural cotton reusable tote bag on a neutral surface",
    stock: true,
    impact: "Saves 12 single-use bags",
    features: [
      "Reinforced seams",
      "Inner pocket",
      "Machine washable",
      "15 kg capacity",
    ],
  },
  {
    id: 4,
    name: "Compostable Phone Case",
    category: "Recycled Fashion",
    price: 499,
    original: 699,
    rating: 4.5,
    eco: 4,
    certs: ["Plastic-Free", "Carbon Neutral"],
    material: "Flax & plant polymer",
    image:
      "https://images.unsplash.com/photo-1535157412991-2ef801c1748b?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Assorted plant-based phone cases arranged together",
    stock: true,
    impact: "Avoids 40 g virgin plastic",
    features: [
      "Drop protection",
      "Wireless charging",
      "Home compostable",
      "Soft-touch finish",
    ],
  },
  {
    id: 5,
    name: "Solar Garden Lights",
    category: "Solar & Energy",
    price: 899,
    original: 1199,
    rating: 4.9,
    eco: 5,
    certs: ["Carbon Neutral"],
    material: "Recycled aluminium",
    image:
      "https://images.unsplash.com/photo-1563315419-ba3921bf9bfe?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Metal outdoor garden lantern glowing warmly",
    stock: true,
    impact: "Saves 18 kWh each year",
    features: [
      "Set of four",
      "Auto dusk sensor",
      "Weatherproof",
      "8-hour glow",
    ],
  },
  {
    id: 6,
    name: "Beeswax Food Wraps",
    category: "Reusable Kitchen",
    price: 349,
    original: 449,
    rating: 4.7,
    eco: 5,
    certs: ["Organic", "Plastic-Free"],
    material: "Organic cotton & beeswax",
    image:
      "https://images.unsplash.com/photo-1760445531783-8a2a2f6ee617?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Hands covering a food bowl with a reusable cloth wrap",
    stock: true,
    impact: "Replaces 24 cling-film rolls",
    features: [
      "Pack of three",
      "Washable",
      "Naturally antibacterial",
      "Lasts one year",
    ],
  },
  {
    id: 7,
    name: "Coconut Fibre Planter",
    category: "Home & Garden",
    price: 449,
    original: 549,
    rating: 4.4,
    eco: 4,
    certs: ["Organic", "Plastic-Free"],
    material: "Coconut coir",
    image:
      "https://images.unsplash.com/photo-1562351757-66f3589f30cf?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Green houseplant growing in a natural brown planter",
    stock: true,
    impact: "Upcycles 2 coconut husks",
    features: [
      "Breathable roots",
      "Indoor friendly",
      "Handcrafted",
      "Natural drainage",
    ],
  },
  {
    id: 8,
    name: "Solid Shampoo Bar",
    category: "Zero-Waste Personal Care",
    price: 279,
    original: 349,
    rating: 4.8,
    eco: 5,
    certs: ["Cruelty-Free", "Plastic-Free"],
    material: "Natural oils",
    image:
      "https://images.unsplash.com/photo-1607006344152-62699f97b42c?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Minimal solid shampoo bar on a clean white surface",
    stock: true,
    impact: "Saves 2 plastic bottles",
    features: ["80 washes", "SLS free", "Travel ready", "For all hair types"],
  },
  {
    id: 9,
    name: "Bamboo Desk Organiser",
    category: "Bamboo Products",
    price: 549,
    original: 699,
    rating: 4.3,
    eco: 4,
    certs: ["FSC"],
    material: "FSC bamboo",
    image:
      "https://images.unsplash.com/photo-1644463589256-02679b9c0767?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Organised wooden desk with stationery and work essentials",
    stock: false,
    impact: "Stores carbon naturally",
    features: [
      "Five compartments",
      "Phone stand",
      "Hand finished",
      "No plastic",
    ],
  },
  {
    id: 10,
    name: "Recycled Yoga Mat",
    category: "Recycled Fashion",
    price: 1299,
    original: 1599,
    rating: 4.9,
    eco: 4,
    certs: ["Recycled Content", "Cruelty-Free"],
    material: "Recycled rubber",
    image:
      "https://images.unsplash.com/photo-1637157216470-d92cd2edb2e8?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Person standing on a textured yoga mat indoors",
    stock: true,
    impact: "Diverts 1.2 kg rubber",
    features: ["Non-slip", "6 mm support", "Carry strap", "Odour resistant"],
  },
  {
    id: 11,
    name: "Kitchen Compost Bin",
    category: "Home & Garden",
    price: 799,
    original: 999,
    rating: 4.6,
    eco: 5,
    certs: ["Recycled Content"],
    material: "Recycled steel",
    image:
      "https://images.unsplash.com/photo-1576083983802-7ac0103c9d23?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Grey metal compost bin for collecting kitchen food scraps",
    stock: true,
    impact: "Diverts 3 kg waste weekly",
    features: ["5 litre", "Charcoal filter", "Easy clean", "Odour control"],
  },
  {
    id: 12,
    name: "Solar Reading Lamp",
    category: "Solar & Energy",
    price: 749,
    original: 949,
    rating: 4.5,
    eco: 5,
    certs: ["Carbon Neutral"],
    material: "Recycled ABS",
    image:
      "https://images.unsplash.com/photo-1570974802254-4b0ad1a755f5?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Compact white reading lamp on a desk",
    stock: true,
    impact: "Saves 12 kWh each year",
    features: [
      "Three brightness levels",
      "USB backup",
      "Foldable",
      "12-hour battery",
    ],
  },
]

const categories = [...new Set(products.map((p) => p.category))]
const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2 11h11l2-8H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-6h6v6" />
      </>
    ),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    back: (
      <>
        <path d="M19 12H5" />
        <path d="m11 18-6-6 6-6" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ),
    leaf: (
      <path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 7 0 10-8 10-15ZM4 21c2-6 6-9 12-12" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variant} ${className}`}
    >
      {children}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>
}

function App() {
  const [page, setPage] = useState<Page>("home")
  const [selectedId, setSelectedId] = useState(1)
  const [cart, setCart] = useState<Cart>({})
  const [hydrated, setHydrated] = useState(false)
  const [wishlist, setWishlist] = useState<number[]>([])
  const [recent, setRecent] = useState<number[]>([])
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem("econest-dark-mode") === "true" } catch { return false }
  })
  useEffect(() => {
    try { localStorage.setItem("econest-dark-mode", String(dark)) } catch { /* Storage can be disabled */ }
    document.documentElement.style.colorScheme = dark ? "dark" : "light"
  }, [dark])
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState("")
  const [removeId, setRemoveId] = useState<number | null>(null)
  const [compare, setCompare] = useState<number[]>([])
  const [help, setHelp] = useState(false)
  const [order, setOrder] = useState("")
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [authMode, setAuthMode] = useState<"login" | "signup" | "edit">("login")
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("econest-token") || "")
  const [profile, setProfile] = useState<{id?: number;name:string;email:string} | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [remembered, setRemembered] = useState<{name:string;email:string}[]>(() => {
    try { return JSON.parse(localStorage.getItem("econest-accounts") || "[]") } catch { return [] }
  })
  const guestId = useMemo(() => {
    const old = localStorage.getItem("econest-guest")
    if (old) return old
    const id = crypto.randomUUID()
    localStorage.setItem("econest-guest", id)
    return id
  }, [])
  const sessionId = profile?.id ? `user:${profile.id}` : guestId
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem("econest-token")
    const response = await fetch(`/api${url}`, {
      ...options,
      headers: {...(options.headers as Record<string,string> || {}), ...(token ? {Authorization: `Bearer ${token}`} : {})},
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Database request failed")
    return result
  }
  const rememberAccount = (user: {name:string;email:string}) => {
    setRemembered(prev => {
      const next = [{name:user.name,email:user.email},...prev.filter(x=>x.email!==user.email)].slice(0,8)
      localStorage.setItem("econest-accounts",JSON.stringify(next))
      return next
    })
  }
  const signedIn = (result: {token:string;user:{id:number;name:string;email:string}}) => {
    sessionStorage.setItem("econest-token",result.token)
    setAuthToken(result.token)
    setProfile(result.user)
    rememberAccount(result.user)
    setCart({})
    setWishlist([])
    setOrders([])
    setHydrated(false)
    navigate("profile")
  }
  const logout = async () => {
    try { await apiRequest("/auth/logout",{method:"POST"}) } catch {}
    sessionStorage.removeItem("econest-token")
    setAuthToken("")
    setProfile(null)
    setCart({})
    setWishlist([])
    setOrders([])
    setHydrated(false)
    setAuthMode("login")
    navigate("login")
  }
  useEffect(() => {
    if (!authToken) {setAuthReady(true);return}
    apiRequest("/auth/me").then(r=>{setProfile(r.user);rememberAccount(r.user)})
      .catch(()=>{sessionStorage.removeItem("econest-token");setAuthToken("");setProfile(null)})
      .finally(()=>setAuthReady(true))
  }, [])
  useEffect(() => {
    if (!authReady) return
    let active = true
    setHydrated(false)
    Promise.all([
      apiRequest(`/cart?session_id=${encodeURIComponent(sessionId)}`),
      apiRequest(`/wishlist?session_id=${encodeURIComponent(sessionId)}`),
      profile ? apiRequest(`/orders?session_id=${encodeURIComponent(sessionId)}`) : Promise.resolve({orders:[]}),
    ]).then(([c, w, o]) => {
      if (!active) return
      const dbCart = Object.fromEntries(c.items.map((i: any) => [i.product_id, i.quantity]))
      setCart(dbCart)
      setWishlist(w.products.map((i: any) => i.id))
      setOrders(o.orders)
      setHydrated(true)
    }).catch(() => {
      if (active) { setHydrated(true); setToast("Database offline: using saved browser data") }
    })
    return () => { active = false }
  }, [sessionId, authReady])
  useEffect(() => {
    if (!hydrated) return
    const t = setTimeout(() => {
      apiRequest("/cart", {method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({session_id:sessionId, items:cart})}).catch(() => setToast("Cart could not sync to database"))
    }, 250)
    return () => clearTimeout(t)
  }, [cart, hydrated, sessionId])
  useEffect(() => {
    if (!hydrated) return
    const t = setTimeout(() => {
      apiRequest("/wishlist", {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({session_id:sessionId,product_ids:wishlist})}).catch(() => setToast("Wishlist could not sync to database"))
    }, 250)
    return () => clearTimeout(t)
  }, [wishlist, hydrated, sessionId])
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 2400)
      return () => clearTimeout(t)
    }
  }, [toast])

  const [productSearch, setProductSearch] = useState("")
  const searchProducts = (value: string) => {
    setProductSearch(value.trim())
    navigate("products")
  }
  const navigate = (next: Page) => {
    setPage(next)
    setDrawer(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const viewProduct = (id: number) => {
    setSelectedId(id)
    setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 4))
    navigate("detail")
  }
  const addCart = (id: number, qty = 1) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + qty }))
    setToast("Added to cart")
  }
  const addOrderToCart = (items: { id: number; qty: number }[]) => {
    setCart((current) => {
      const next = { ...current }
      items.forEach(({ id, qty }) => {
        next[id] = (next[id] || 0) + qty
      })
      return next
    })
    setToast("Items added to cart")
  }
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const subtotal = products.reduce(
    (sum, p) => sum + p.price * (cart[p.id] || 0),
    0,
  )
  const toggleWish = (id: number) => {
    setWishlist((w) =>
      w.includes(id) ? w.filter((x) => x !== id) : [...w, id],
    )
    setToast(
      wishlist.includes(id) ? "Removed from wishlist" : "Saved to wishlist",
    )
  }
  const updateQty = (id: number, qty: number) =>
    qty < 1 ? setRemoveId(id) : setCart((c) => ({ ...c, [id]: qty }))
  const remove = (id: number) => {
    setCart((c) => {
      const copy = { ...c }
      delete copy[id]
      return copy
    })
    setRemoveId(null)
    setToast("Item removed")
  }

  return (
    <div className={dark ? "app dark" : "app"}>
      <Header
        navigate={navigate}
        searchProducts={searchProducts}
        cartCount={cartCount}
        wishCount={wishlist.length}
        dark={dark}
        setDark={setDark}
        openCart={() => setDrawer(true)}
      />
      <main>
        {page === "home" && (
          <Home
            navigate={navigate}
            viewProduct={viewProduct}
            addCart={addCart}
            toggleWish={toggleWish}
            wishlist={wishlist}
            compare={compare}
            setCompare={setCompare}
          />
        )}
        {page === "products" && (
          <Products
            initialQuery={productSearch}
            viewProduct={viewProduct}
            addCart={addCart}
            toggleWish={toggleWish}
            wishlist={wishlist}
            compare={compare}
            setCompare={setCompare}
          />
        )}
        {page === "detail" && (
          <Detail
            product={products.find((p) => p.id === selectedId)!}
            viewProduct={viewProduct}
            addCart={addCart}
            toggleWish={toggleWish}
            wished={wishlist.includes(selectedId)}
            navigate={navigate}
          />
        )}
        {page === "cart" && (
          <CartPage
            cart={cart}
            subtotal={subtotal}
            updateQty={updateQty}
            setRemoveId={setRemoveId}
            navigate={navigate}
          />
        )}
        {page === "wishlist" && (
          <Wishlist
            ids={wishlist}
            toggleWish={toggleWish}
            addCart={addCart}
            viewProduct={viewProduct}
          />
        )}
        {page === "checkout" && !profile && (
          <div className="shell page"><h2>Sign in to complete your order</h2><Button onClick={() => {setAuthMode("login");navigate("login")}}>Sign in</Button></div>
        )}
        {page === "checkout" && profile && (
          <Checkout
            cart={cart}
            subtotal={subtotal}
            navigate={navigate}
            complete={async (_id: string, _total: number, checkoutData: any) => {
              try {
                if (!profile) { setToast("Sign in before checkout"); setAuthMode("login"); navigate("login"); return }
                await apiRequest("/cart", {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({session_id:sessionId,items:cart})})
                const result = await apiRequest("/checkout", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...checkoutData,session_id:sessionId})})
                const id = result.order_number
                const total = result.pricing.total
              const items = Object.entries(cart)
                .filter(([, qty]) => qty > 0)
                .map(([productId, qty]) => ({ id: Number(productId), qty }))
              const placed: SavedOrder = {
                id,
                status: "Placed",
                date: new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                total,
                items,
                step: 0,
                delivery: "To be updated",
              }
              setOrders((previous) => [placed, ...previous])
              setOrder(id)
              setCart({})
              navigate("confirmation")
              } catch (err) { setToast(err instanceof Error ? err.message : "Could not place order") }
            }}
          />
        )}
        {page === "confirmation" && (
          <Confirmation order={order} navigate={navigate} />
        )}
        {page === "profile" && !profile && (
          <div className="shell page"><h2>Please sign in to view your profile</h2><Button onClick={() => {setAuthMode("login");navigate("login")}}>Sign in</Button></div>
        )}
        {page === "profile" && profile && (
          <Profile
            navigate={navigate}
            profile={profile}
            logout={logout}
            editProfile={() => {
              setAuthMode("edit")
              navigate("login")
            }}
          />
        )}
        {page === "orders" && !profile && (
          <div className="shell page"><h2>Sign in to see your orders</h2><Button onClick={() => {setAuthMode("login");navigate("login")}}>Sign in</Button></div>
        )}
        {page === "orders" && profile && (
          <Orders
            navigate={navigate}
            addOrderToCart={addOrderToCart}
            orders={orders}
            highlightedOrderId={order}
          />
        )}
        {page === "about" && <About navigate={navigate} />}
        {page === "contact" && <Contact navigate={navigate} />}
        {page === "login" && (
          <Login
            navigate={navigate}
            mode={authMode}
            setMode={setAuthMode}
            profile={profile}
            saveProfile={(u: any) => {setProfile(u);rememberAccount(u)}}
            signedIn={signedIn}
            apiRequest={apiRequest}
            remembered={remembered}
            authToken={authToken}
          />
        )}
      </main>
      {recent.length > 0 &&
        !["detail", "checkout", "confirmation"].includes(page) && (
          <Recently ids={recent} viewProduct={viewProduct} />
        )}
      <Footer navigate={navigate} />
      <MobileNav page={page} navigate={navigate} cartCount={cartCount} />
      {drawer && (
        <Drawer
          cart={cart}
          subtotal={subtotal}
          updateQty={updateQty}
          setRemoveId={setRemoveId}
          close={() => setDrawer(false)}
          navigate={navigate}
        />
      )}
      {removeId !== null && (
        <Modal title="Remove this item?" close={() => setRemoveId(null)}>
          <p className="muted">
            It will be removed from your cart. You can always add it again
            later.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setRemoveId(null)}>
              Keep item
            </Button>
            <Button onClick={() => remove(removeId)}>Remove</Button>
          </div>
        </Modal>
      )}
      {compare.length > 0 && (
        <CompareBar ids={compare} setCompare={setCompare} />
      )}
      {toast && (
        <div className="toast">
          <span className="toast-check">
            <Icon name="check" size={16} />
          </span>
          {toast}
        </div>
      )}
      <button
        className="help-button"
        onClick={() => setHelp(!help)}
        aria-label="Open EcoNest help"
      >
        <Icon name={help ? "close" : "leaf"} />
      </button>
      {help && <Help close={() => setHelp(false)} navigate={navigate} />}
    </div>
  )
}

function Header({
  navigate,
  cartCount,
  wishCount,
  dark,
  setDark,
  openCart,
  searchProducts,
}: any) {
  const [query, setQuery] = useState("")
  const [menu, setMenu] = useState(false)
  return (
    <header className="header">
      <div className="announcement">
        Free shipping over ₹999 <span>•</span> Planet-positive delivery across
        India
      </div>
      <div className="nav shell">
        <button
          className="logo"
          onClick={() => navigate("home")}
          aria-label="EcoNest home"
        >
          <span className="logo-mark">
            <Icon name="leaf" />
          </span>
          <span>
            Eco<span>Nest</span>
          </span>
        </button>
        <form className="desktop-search" onSubmit={(e) => { e.preventDefault(); searchProducts(query) }}>
          <button type="submit" aria-label="Submit product search" className="search-submit"><Icon name="search" /></button>
          <input
            aria-label="Search products"
            placeholder="Search sustainable essentials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("")
            }}
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
              <Icon name="close" size={16} />
            </button>
          )}
        </form>
        <nav className={menu ? "desktop-links open" : "desktop-links"}>
          <button onClick={() => navigate("products")}>Shop</button>
          <button onClick={() => navigate("about")}>Our impact</button>
          <button onClick={() => navigate("contact")}>Contact</button>
        </nav>
        <div className="nav-actions">
          <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode">
            <Icon name={dark ? "sun" : "moon"} />
          </button>
          <button
            className="desktop-icon"
            onClick={() => navigate("wishlist")}
            aria-label="Wishlist"
          >
            <Icon name="heart" />
            {wishCount > 0 && <span className="count">{wishCount}</span>}
          </button>
          <button
            className="desktop-icon"
            onClick={() => navigate("profile")}
            aria-label="Profile"
          >
            <Icon name="user" />
          </button>
          <button onClick={openCart} aria-label="Cart">
            <Icon name="cart" />
            {cartCount > 0 && <span className="count">{cartCount}</span>}
          </button>
          <button
            className="menu"
            onClick={() => setMenu(!menu)}
            aria-label="Menu"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  )
}

function Home({
  navigate,
  viewProduct,
  addCart,
  toggleWish,
  wishlist,
  compare,
  setCompare,
}: any) {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <Icon name="leaf" size={16} /> Everyday choices, reimagined
            </span>
            <h1>
              Live lighter.
              <br />
              <em>Leave more green.</em>
            </h1>
            <p>
              Thoughtfully sourced essentials that are better for your home,
              your routine, and the planet we share.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate("products")}>
                Shop planet-friendly <Icon name="arrow" />
              </Button>
              <Button variant="secondary" onClick={() => navigate("about")}>
                Our story
              </Button>
            </div>
            <div className="hero-proof">
              <div className="avatars">
                <span>A</span>
                <span>R</span>
                <span>M</span>
              </div>
              <div>
                <strong>4.9 / 5</strong>
                <small>from 2,400+ mindful shoppers</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src={photos[1]}
              alt="Reusable glass and natural-fibre products"
            />
            <div className="impact-float">
              <span>
                <Icon name="leaf" />
              </span>
              <div>
                <strong>12,480 kg</strong>
                <small>CO₂ saved together</small>
              </div>
            </div>
            <div className="hero-note">
              Plastic-free
              <br />
              <strong>by design</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="section shell">
        <div className="section-head">
          <div>
            <span className="overline">Shop by collection</span>
            <h2>Small swaps, lasting change</h2>
          </div>
          <button className="text-link" onClick={() => navigate("products")}>
            Explore all <Icon name="arrow" size={17} />
          </button>
        </div>
        <div className="category-grid">
          {categories.map((category, i) => (
            <button
              className="category-card"
              key={category}
              onClick={() => navigate("products")}
            >
              <span className={`category-icon tone-${i}`}>
                <Icon name={i === 5 ? "sun" : "leaf"} />
              </span>
              <span>{category}</span>
              <small>
                {products.filter((p) => p.category === category).length}{" "}
                essentials
              </small>
            </button>
          ))}
        </div>
      </section>
      <section className="section featured">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="overline">Community favourites</span>
              <h2>Better choices, loved daily</h2>
            </div>
            <p>High-impact swaps our community keeps coming back for.</p>
          </div>
          <div className="product-grid">
            {products.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                view={viewProduct}
                add={addCart}
                wished={wishlist.includes(p.id)}
                toggleWish={toggleWish}
                comparing={compare.includes(p.id)}
                toggleCompare={(id: number) =>
                  setCompare(
                    compare.includes(id)
                      ? compare.filter((x: number) => x !== id)
                      : compare.length < 3
                        ? [...compare, id]
                        : compare,
                  )
                }
              />
            ))}
          </div>
        </div>
      </section>
      <section className="impact shell">
        <div className="impact-copy">
          <span className="overline light">Why EcoNest</span>
          <h2>
            Good for you.
            <br />
            Gentler on Earth.
          </h2>
          <p>
            Every product is vetted for its materials, makers, lifespan, and
            end-of-life. No greenwashing—just meaningful progress.
          </p>
          <Button variant="secondary" onClick={() => navigate("about")}>
            How we vet products
          </Button>
        </div>
        <div className="stat-grid">
          <div>
            <strong>82K</strong>
            <span>plastic items avoided</span>
          </div>
          <div>
            <strong>18.4t</strong>
            <span>CO₂ emissions saved</span>
          </div>
          <div>
            <strong>94%</strong>
            <span>plastic-free packaging</span>
          </div>
          <div>
            <strong>42</strong>
            <span>ethical makers supported</span>
          </div>
        </div>
      </section>
      <section className="section shell reviews">
        <span className="overline">Loved by conscious homes</span>
        <h2>Real people, real impact</h2>
        <div className="review-grid">
          {[
            [
              "“Beautiful products, thoughtful packaging, and zero guilt. The bottle hasn't left my side.”",
              "Ananya S.",
              "Mumbai",
            ],
            [
              "“EcoNest makes sustainable living feel wonderfully simple—not like another chore.”",
              "Rahul M.",
              "Bengaluru",
            ],
            [
              "“My order arrived plastic-free and every item feels made to last. I'm converted.”",
              "Meera K.",
              "Pune",
            ],
          ].map(([q, n, c]) => (
            <article className="review-card" key={n}>
              <div className="stars">★★★★★</div>
              <p>{q}</p>
              <div>
                <span className="review-avatar">{n[0]}</span>
                <strong>{n}</strong>
                <small>{c}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Newsletter />
    </>
  )
}

function ProductCard({
  p,
  view,
  add,
  wished,
  toggleWish,
  comparing,
  toggleCompare,
}: any) {
  const discount = Math.round((1 - p.price / p.original) * 100)
  return (
    <article className="product-card">
      <div
        className="product-image"
        onClick={() => view(p.id)}
        role="button"
        tabIndex={0}
      >
        <img loading="lazy" src={p.image} alt={p.imageAlt} />
        <span className="discount">−{discount}%</span>
        <button
          className={wished ? "wish active" : "wish"}
          onClick={(e) => {
            e.stopPropagation()
            toggleWish(p.id)
          }}
          aria-label={`Save ${p.name}`}
        >
          <Icon name="heart" />
        </button>
      </div>
      <div className="product-body">
        <small className="category">{p.category}</small>
        <h3 onClick={() => view(p.id)}>{p.name}</h3>
        <div className="rating">
          <span>★</span> {p.rating} <small>({38 + p.id * 7})</small>
          <span className="eco-leaves">
            <Icon name="leaf" size={14} /> {p.eco}/5
          </span>
        </div>
        <div className="price">
          <strong>{money(p.price)}</strong>
          <s>{money(p.original)}</s>
        </div>
        <div className="card-actions">
          <Button onClick={() => add(p.id)} disabled={!p.stock}>
            {p.stock ? "Add to cart" : "Out of stock"}
          </Button>
          <label className="compare-check">
            <input
              type="checkbox"
              checked={comparing}
              onChange={() => toggleCompare(p.id)}
            />{" "}
            Compare
          </label>
        </div>
      </div>
    </article>
  )
}

function Products({
  initialQuery = "",
  viewProduct,
  addCart,
  toggleWish,
  wishlist,
  compare,
  setCompare,
}: any) {
  const [query, setQuery] = useState(initialQuery)
  useEffect(() => setQuery(initialQuery), [initialQuery])
  const [category, setCategory] = useState("All")
  const [max, setMax] = useState(1500)
  const [eco, setEco] = useState(0)
  const [stockOnly, setStockOnly] = useState(false)
  const [cert, setCert] = useState("All")
  const [sort, setSort] = useState("newest")
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!query || p.name.toLowerCase().includes(query.toLowerCase())) &&
            (category === "All" || p.category === category) &&
            p.price <= max &&
            p.eco >= eco &&
            (!stockOnly || p.stock) &&
            (cert === "All" || p.certs.includes(cert)),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.price - b.price
            : sort === "high"
              ? b.price - a.price
              : sort === "rating"
                ? b.rating - a.rating
                : sort === "eco"
                  ? b.eco - a.eco
                  : b.id - a.id,
        ),
    [query, category, max, eco, stockOnly, cert, sort],
  )
  return (
    <div className="shell page">
      <Breadcrumb items={["Home", "Shop all"]} />
      <div className="listing-title">
        <div>
          <span className="overline">Mindfully curated</span>
          <h1>Sustainable essentials</h1>
          <p>Everyday goods vetted for people and planet.</p>
        </div>
        <div className="listing-search">
          <Icon name="search" />
          <input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="listing">
        <aside className="filters">
          <div className="filter-top">
            <h3>Filters</h3>
            <button
              onClick={() => {
                setCategory("All")
                setMax(1500)
                setEco(0)
                setStockOnly(false)
                setCert("All")
              }}
            >
              Clear all
            </button>
          </div>
          <fieldset>
            <legend>Category</legend>
            {["All", ...categories].map((c) => (
              <label key={c}>
                <input
                  type="radio"
                  name="category"
                  checked={category === c}
                  onChange={() => setCategory(c)}
                />
                <span>{c}</span>
                <small>
                  {c === "All"
                    ? products.length
                    : products.filter((p) => p.category === c).length}
                </small>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>
              Maximum price <span>{money(max)}</span>
            </legend>
            <input
              className="range"
              type="range"
              min="200"
              max="1500"
              step="50"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>₹200</span>
              <span>₹1,500</span>
            </div>
          </fieldset>
          <fieldset>
            <legend>Minimum eco-rating</legend>
            <div className="eco-filter">
              {[0, 3, 4, 5].map((n) => (
                <button
                  className={eco === n ? "selected" : ""}
                  onClick={() => setEco(n)}
                  key={n}
                >
                  {n === 0 ? "Any" : `${n}+`}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Certification</legend>
            <select value={cert} onChange={(e) => setCert(e.target.value)}>
              <option>All</option>
              <option>FSC</option>
              <option>Plastic-Free</option>
              <option>Organic</option>
              <option>Carbon Neutral</option>
              <option>Recycled Content</option>
            </select>
          </fieldset>
          <label className="switch-row">
            <span>
              <strong>In-stock only</strong>
              <small>Hide unavailable items</small>
            </span>
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
            />
          </label>
        </aside>
        <div className="listing-main">
          <div className="sort-row">
            <strong>{filtered.length} products</strong>
            <label>
              Sort by{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="rating">Rating</option>
                <option value="eco">Eco-score</option>
              </select>
            </label>
          </div>
          {filtered.length ? (
            <div className="product-grid listing-grid">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  view={viewProduct}
                  add={addCart}
                  wished={wishlist.includes(p.id)}
                  toggleWish={toggleWish}
                  comparing={compare.includes(p.id)}
                  toggleCompare={(id: number) =>
                    setCompare(
                      compare.includes(id)
                        ? compare.filter((x: number) => x !== id)
                        : compare.length < 3
                          ? [...compare, id]
                          : compare,
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Icon name="search" size={40} />
              <h2>No products found</h2>
              <p>Try widening your filters or searching for something else.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Detail({
  product: p,
  viewProduct,
  addCart,
  toggleWish,
  wished,
  navigate,
}: any) {
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState("Description")
  const [reviewOpen, setReviewOpen] = useState(false)
  return (
    <div className="shell page">
      <Breadcrumb
        items={["Home", p.category, p.name]}
        back={() => navigate("products")}
      />
      <div className="detail">
        <div className="gallery">
          <div className="thumbs">
            {[0, 1, 2].map((x) => (
              <button key={x}>
                <img src={p.image} alt={`${p.imageAlt}, view ${x + 1}`} />
              </button>
            ))}
          </div>
          <div className="main-image">
            <img src={p.image} alt={p.imageAlt} />
            <span className="image-tag">
              <Icon name="leaf" size={15} /> Low impact choice
            </span>
          </div>
        </div>
        <div className="detail-info">
          <span className="overline">{p.category}</span>
          <h1>{p.name}</h1>
          <div className="rating large">
            <span>★</span> {p.rating} <small>128 verified reviews</small>
          </div>
          <div className="detail-price">
            <strong>{money(p.price)}</strong>
            <s>{money(p.original)}</s>
            <Badge>Save {money(p.original - p.price)}</Badge>
          </div>
          <p>
            Designed to make low-waste living feel effortless. Durable,
            thoughtfully made, and gentle on the planet from first use to end of
            life.
          </p>
          <div className="eco-score">
            <span className="eco-score-icon">
              <Icon name="leaf" />
            </span>
            <div>
              <strong>Eco-score: {p.eco}/5</strong>
              <small>
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="leaf" size={15} />
                ))}
              </small>
            </div>
            <button onClick={() => setTab("Impact")}>How we score</button>
          </div>
          <div className="certs">
            {p.certs.map((c: string) => (
              <Badge key={c}>
                <Icon name="check" size={13} />
                {c}
              </Badge>
            ))}
          </div>
          <div className="purchase-row">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>
                <Icon name="minus" size={17} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>
                <Icon name="plus" size={17} />
              </button>
            </div>
            <Button className="add-wide" onClick={() => addCart(p.id, qty)}>
              Add to cart
            </Button>
            <button
              className={wished ? "detail-wish active" : "detail-wish"}
              onClick={() => toggleWish(p.id)}
            >
              <Icon name="heart" />
            </button>
          </div>
          <Button
            className="buy"
            variant="secondary"
            onClick={() => {
              addCart(p.id, qty)
              navigate("checkout")
            }}
          >
            Buy now
          </Button>
          <div className="delivery-notes">
            <span>
              <Icon name="check" size={16} /> Free delivery over ₹999
            </span>
            <span>
              <Icon name="check" size={16} /> 7-day easy returns
            </span>
          </div>
        </div>
      </div>
      <section className="detail-tabs">
        <div className="tab-buttons">
          {["Description", "Features", "Specifications", "Impact"].map((x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {tab === "Description" && (
            <p>
              A better everyday essential, made with {p.material.toLowerCase()}.
              Each piece is responsibly sourced, carefully finished, and packed
              without unnecessary plastic.
            </p>
          )}
          {tab === "Features" && (
            <ul>
              {p.features.map((f: string) => (
                <li key={f}>
                  <Icon name="check" size={16} />
                  {f}
                </li>
              ))}
            </ul>
          )}
          {tab === "Specifications" && (
            <table>
              <tbody>
                <tr>
                  <th>Material</th>
                  <td>{p.material}</td>
                </tr>
                <tr>
                  <th>Origin</th>
                  <td>Responsibly made in India</td>
                </tr>
                <tr>
                  <th>Care</th>
                  <td>Clean gently; air dry</td>
                </tr>
                <tr>
                  <th>Packaging</th>
                  <td>100% recyclable paper</td>
                </tr>
              </tbody>
            </table>
          )}
          {tab === "Impact" && (
            <div className="impact-tab">
              <Icon name="leaf" size={36} />
              <div>
                <h3>Environmental impact</h3>
                <p>
                  {p.impact}. Delivered in recyclable, plastic-free packaging
                  with carbon-offset shipping.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="product-reviews">
        <div className="section-head">
          <div>
            <span className="overline">Verified buyers</span>
            <h2>What people are saying</h2>
          </div>
          <Button
            variant="secondary"
            onClick={() => setReviewOpen(!reviewOpen)}
          >
            Write a review
          </Button>
        </div>
        {reviewOpen && (
          <form
            className="review-form"
            onSubmit={(e) => {
              e.preventDefault()
              setReviewOpen(false)
            }}
          >
            <select aria-label="Rating">
              <option>5 stars</option>
              <option>4 stars</option>
              <option>3 stars</option>
            </select>
            <textarea required placeholder="Share your experience" />
            <Button type="submit">Submit review</Button>
          </form>
        )}
        <div className="review-line">
          <div>
            <strong>4.8</strong>
            <span className="stars">★★★★★</span>
            <small>128 reviews</small>
          </div>
          <p>
            “Exactly as described, beautifully made and arrived with no plastic
            at all.”
          </p>
          <strong>Priya R.</strong>
        </div>
      </section>
      <section className="section related">
        <div className="section-head">
          <h2>You may also like</h2>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard
                key={x.id}
                p={x}
                view={viewProduct}
                add={addCart}
                wished={false}
                toggleWish={toggleWish}
                comparing={false}
                toggleCompare={() => {}}
              />
            ))}
        </div>
      </section>
    </div>
  )
}

function Breadcrumb({ items, back }: { items: string[]; back?: () => void }) {
  return (
    <div className="breadcrumb">
      {back && (
        <button onClick={back}>
          <Icon name="back" size={17} /> Back
        </button>
      )}
      {items.map((x, i) => (
        <span key={x}>
          {i > 0 && " / "}
          <b>{x}</b>
        </span>
      ))}
    </div>
  )
}

function CartContents({ cart, subtotal, updateQty, setRemoveId }: any) {
  const shippingGap = Math.max(0, 999 - subtotal)
  const entries = products.filter((p) => cart[p.id])
  return (
    <>
      {entries.length ? (
        <>
          <div className="shipping-progress">
            <div>
              <Icon name="leaf" size={18} />
              <span>
                {shippingGap ? (
                  <>
                    Add <strong>{money(shippingGap)}</strong> more for free
                    shipping
                  </>
                ) : (
                  <strong>You've unlocked free shipping</strong>
                )}
              </span>
            </div>
            <div>
              <i style={{ width: `${Math.min(100, subtotal / 9.99)}%` }} />
            </div>
          </div>
          <div className="cart-items">
            {entries.map((p) => (
              <div className="cart-item" key={p.id}>
                <img src={p.image} alt={p.imageAlt} />
                <div className="cart-item-info">
                  <small>{p.category}</small>
                  <strong>{p.name}</strong>
                  <span>{money(p.price)}</span>
                  <div className="qty compact">
                    <button onClick={() => updateQty(p.id, cart[p.id] - 1)}>
                      <Icon name="minus" size={15} />
                    </button>
                    <span>{cart[p.id]}</span>
                    <button onClick={() => updateQty(p.id, cart[p.id] + 1)}>
                      <Icon name="plus" size={15} />
                    </button>
                  </div>
                </div>
                <div className="line-total">
                  <strong>{money(p.price * cart[p.id])}</strong>
                  <button
                    onClick={() => setRemoveId(p.id)}
                    aria-label={`Remove ${p.name}`}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty cart-empty">
          <span>
            <Icon name="cart" size={42} />
          </span>
          <h2>Your cart feels light</h2>
          <p>
            Fill it with planet-friendly finds that make everyday living better.
          </p>
        </div>
      )}
    </>
  )
}

function CartPage(props: any) {
  return (
    <div className="shell page cart-page">
      <Breadcrumb
        items={["Home", "Your cart"]}
        back={() => props.navigate("products")}
      />
      <div className="cart-title">
        <h1>Your cart</h1>
        <span>{Object.keys(props.cart).length} items</span>
      </div>
      {Object.keys(props.cart).length ? (
        <div className="cart-layout">
          <div>
            <CartContents {...props} />
          </div>
          <CartSummary subtotal={props.subtotal} navigate={props.navigate} />
        </div>
      ) : (
        <>
          <CartContents {...props} />
          <Button onClick={() => props.navigate("products")}>
            Explore products
          </Button>
        </>
      )}
    </div>
  )
}

function CartSummary({ subtotal, navigate }: any) {
  const [code, setCode] = useState("")
  const [coupon, setCoupon] = useState("")
  const [message, setMessage] = useState("")
  const discount =
    coupon === "ECO10"
      ? subtotal * 0.1
      : coupon === "GREEN20"
        ? subtotal * 0.2
        : 0
  const shipping = subtotal >= 999 ? 0 : 49
  const gst = (subtotal - discount) * 0.18
  const total = subtotal - discount + shipping + gst
  const apply = () => {
    const c = code.toUpperCase()
    if (c === "ECO10" || (c === "GREEN20" && subtotal > 1500)) {
      setCoupon(c)
      setMessage(`${c} applied successfully`)
    } else
      setMessage(
        c === "GREEN20"
          ? "GREEN20 needs a subtotal above ₹1,500"
          : "That coupon isn't valid",
      )
  }
  return (
    <aside className="summary">
      <h2>Order summary</h2>
      <div className="coupon">
        <input
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button variant="secondary" onClick={apply}>
          Apply
        </Button>
      </div>
      {message && (
        <small className={coupon ? "success" : "error"}>{message}</small>
      )}
      <div className="bill">
        <span>
          Subtotal <b>{money(subtotal)}</b>
        </span>
        {discount > 0 && (
          <span className="green">
            Discount <b>−{money(discount)}</b>
          </span>
        )}
        <span>
          Shipping <b>{shipping ? money(shipping) : "Free"}</b>
        </span>
        <span>
          GST (18%) <b>{money(gst)}</b>
        </span>
        <span className="total">
          Grand total <b>{money(total)}</b>
        </span>
      </div>
      <Button className="checkout-button" onClick={() => navigate("checkout")}>
        Secure checkout <Icon name="arrow" size={18} />
      </Button>
      <small className="secure">
        Secure payments · Easy returns · Planet-positive delivery
      </small>
    </aside>
  )
}

function Drawer(props: any) {
  return (
    <div className="drawer-wrap" onMouseDown={props.close}>
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>
            Your cart <span>{Object.keys(props.cart).length}</span>
          </h2>
          <button onClick={props.close}>
            <Icon name="close" />
          </button>
        </div>
        <CartContents {...props} />
        {Object.keys(props.cart).length > 0 && (
          <div className="drawer-foot">
            <div>
              <span>Subtotal</span>
              <strong>{money(props.subtotal)}</strong>
            </div>
            <p>Taxes and delivery calculated at checkout</p>
            <Button onClick={() => props.navigate("cart")}>
              View cart & checkout
            </Button>
          </div>
        )}
      </aside>
    </div>
  )
}

function Wishlist({ ids, toggleWish, addCart, viewProduct }: any) {
  const list = products.filter((p) => ids.includes(p.id))
  return (
    <div className="shell page">
      <Breadcrumb items={["Home", "Wishlist"]} />
      <div className="page-heading">
        <span className="overline">Saved for later</span>
        <h1>Your wishlist</h1>
        <p>{list.length} thoughtful choices</p>
      </div>
      {list.length ? (
        <div className="product-grid">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              view={viewProduct}
              add={(id: number) => {
                addCart(id)
                toggleWish(id)
              }}
              wished
              toggleWish={toggleWish}
              comparing={false}
              toggleCompare={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Icon name="heart" size={42} />
          <h2>Nothing saved yet</h2>
          <p>Tap the heart on anything you would like to revisit.</p>
        </div>
      )}
    </div>
  )
}

function Checkout({ cart, subtotal, navigate, complete }: any) {
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState(49)
  const [carbon, setCarbon] = useState(false)
  const [round, setRound] = useState(false)
  const [payment, setPayment] = useState("UPI")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pin: "",
  })
  const [paymentForm, setPaymentForm] = useState({
    upi: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  })
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const discount = 0,
    gst = (subtotal - discount) * 0.18
  const base = subtotal + shipping + (carbon ? 20 : 0) + gst
  const donation = round ? Math.ceil(base / 100) * 100 - base : 0
  const total = base + donation
  const change = (k: string, v: string) => setForm({ ...form, [k]: v })
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name) e.name = "Enter your full name"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email"
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Phone must be 10 digits"
    if (!form.address) e.address = "Enter your delivery address"
    if (!form.city) e.city = "Enter your city"
    if (!/^\d{6}$/.test(form.pin)) e.pin = "PIN code must be 6 digits"
    setErrors(e)
    return !Object.keys(e).length
  }
  const getPaymentErrors = () => {
    const next: Record<string, string> = {}
    if (
      payment === "UPI" &&
      !/^[A-Za-z0-9._-]+@[A-Za-z][A-Za-z0-9.-]*$/.test(paymentForm.upi.trim())
    )
      next.upi = "Enter a valid UPI ID, such as name@bank"
    if (payment === "Card") {
      if (paymentForm.cardNumber.replace(/\s/g, "").length !== 16)
        next.cardNumber = "Card number must contain 16 digits"
      if (!paymentForm.cardName.trim())
        next.cardName = "Name on card is required"
      const match = paymentForm.expiry.match(/^(\d{2})\/(\d{2})$/)
      const now = new Date()
      const month = match ? Number(match[1]) : 0
      const year = match ? 2000 + Number(match[2]) : 0
      if (
        !match ||
        month < 1 ||
        month > 12 ||
        year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1)
      )
        next.expiry = "Enter a valid future expiry date"
      if (!/^\d{3}$/.test(paymentForm.cvv))
        next.cvv = "CVV must contain 3 digits"
    }
    return next
  }
  const paymentValid = Object.keys(getPaymentErrors()).length === 0
  const changePayment = (field: string, value: string) => {
    setPaymentForm((current) => ({ ...current, [field]: value }))
    setPaymentErrors((current) => ({ ...current, [field]: "" }))
  }
  const next = () => {
    if (step === 0 && !validate()) return
    if (step === 2) {
      const nextErrors = getPaymentErrors()
      setPaymentErrors(nextErrors)
      if (Object.keys(nextErrors).length) return
    }
    if (step < 3) setStep(step + 1)
    else if (paymentValid)
      complete(`EN${Date.now().toString().slice(-8)}`, total, {
        full_name: form.name, email: form.email, phone: form.phone,
        street_address: form.address, city: form.city, pin_code: form.pin,
        shipping_fee: shipping, carbon_offset: carbon, round_up: round,
      })
  }
  if (!Object.keys(cart).length)
    return (
      <div className="shell page empty">
        <h1>Your cart is empty</h1>
        <Button onClick={() => navigate("products")}>Return to shop</Button>
      </div>
    )
  return (
    <div className="checkout-page">
      <div className="shell">
        <Breadcrumb
          items={["Cart", "Checkout"]}
          back={() => navigate("cart")}
        />
        <div className="checkout-steps">
          {["Shipping", "Delivery", "Payment", "Review"].map((x, i) => (
            <div className={i <= step ? "active" : ""} key={x}>
              <span>{i < step ? <Icon name="check" size={15} /> : i + 1}</span>
              <b>{x}</b>
            </div>
          ))}
        </div>
        <div className="checkout-layout">
          <section className="checkout-form">
            {step === 0 && (
              <>
                <div className="form-head">
                  <span>01</span>
                  <div>
                    <h2>Where should we send it?</h2>
                    <p>We'll only use this to deliver your order.</p>
                  </div>
                </div>
                <div className="form-grid">
                  <FormField
                    label="Full name"
                    value={form.name}
                    error={errors.name}
                    onChange={(v: string) => change("name", v)}
                  />
                  <FormField
                    label="Email address"
                    value={form.email}
                    error={errors.email}
                    type="email"
                    onChange={(v: string) => change("email", v)}
                  />
                  <FormField
                    label="Phone number"
                    value={form.phone}
                    error={errors.phone}
                    placeholder="10-digit mobile number"
                    onChange={(v: string) => change("phone", v)}
                  />
                  <FormField
                    wide
                    label="Street address"
                    value={form.address}
                    error={errors.address}
                    onChange={(v: string) => change("address", v)}
                  />
                  <FormField
                    label="City"
                    value={form.city}
                    error={errors.city}
                    onChange={(v: string) => change("city", v)}
                  />
                  <FormField
                    label="PIN code"
                    value={form.pin}
                    error={errors.pin}
                    onChange={(v: string) => change("pin", v)}
                  />
                </div>
                <label className="checkbox-line">
                  <input type="checkbox" defaultChecked /> Billing address is
                  the same as shipping
                </label>
              </>
            )}
            {step === 1 && (
              <>
                <div className="form-head">
                  <span>02</span>
                  <div>
                    <h2>Choose your delivery</h2>
                    <p>All options include recyclable packaging.</p>
                  </div>
                </div>
                <div className="option-list">
                  {[
                    [49, "Standard delivery", "3–5 business days"],
                    [99, "Express delivery", "1–2 business days"],
                    [149, "Same-day delivery", "Order before 11 AM"],
                  ].map(([v, n, d]: any) => (
                    <label className={shipping === v ? "selected" : ""} key={v}>
                      <input
                        type="radio"
                        name="delivery"
                        checked={shipping === v}
                        onChange={() => setShipping(v)}
                      />
                      <span>
                        <strong>{n}</strong>
                        <small>{d}</small>
                      </span>
                      <b>{money(v)}</b>
                    </label>
                  ))}
                </div>
                <label className="green-option">
                  <input
                    type="checkbox"
                    checked={carbon}
                    onChange={(e) => setCarbon(e.target.checked)}
                  />
                  <Icon name="leaf" />
                  <span>
                    <strong>Make shipping carbon-neutral</strong>
                    <small>Add ₹20 to offset this delivery</small>
                  </span>
                </label>
              </>
            )}
            {step === 2 && (
              <>
                <div className="form-head">
                  <span>03</span>
                  <div>
                    <h2>How would you like to pay?</h2>
                    <p>Your payment information is encrypted.</p>
                  </div>
                </div>
                <div className="payment-tabs">
                  {["UPI", "Card", "Net Banking", "Cash on Delivery"].map(
                    (x) => (
                      <button
                        className={payment === x ? "active" : ""}
                        onClick={() => {
                          setPayment(x)
                          setPaymentErrors({})
                        }}
                        key={x}
                      >
                        {x}
                      </button>
                    ),
                  )}
                </div>
                {payment === "UPI" && (
                  <FormField
                    wide
                    label="UPI ID"
                    value={paymentForm.upi}
                    error={paymentErrors.upi}
                    placeholder="name@bank"
                    onChange={(value: string) => changePayment("upi", value)}
                  />
                )}{" "}
                {payment === "Card" && (
                  <div className="form-grid">
                    <FormField
                      wide
                      label="Card number"
                      value={paymentForm.cardNumber}
                      error={paymentErrors.cardNumber}
                      inputMode="numeric"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      onChange={(value: string) =>
                        changePayment(
                          "cardNumber",
                          value
                            .replace(/\D/g, "")
                            .slice(0, 16)
                            .replace(/(\d{4})(?=\d)/g, "$1 "),
                        )
                      }
                    />
                    <FormField
                      wide
                      label="Name on card"
                      value={paymentForm.cardName}
                      error={paymentErrors.cardName}
                      placeholder="As shown on your card"
                      onChange={(value: string) => changePayment("cardName", value)}
                    />
                    <FormField
                      label="Expiry"
                      value={paymentForm.expiry}
                      error={paymentErrors.expiry}
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="MM/YY"
                      onChange={(value: string) => {
                        const digits = value.replace(/\D/g, "").slice(0, 4)
                        changePayment(
                          "expiry",
                          digits.length > 2
                            ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                            : digits,
                        )
                      }}
                    />
                    <FormField
                      label="CVV"
                      type="password"
                      value={paymentForm.cvv}
                      error={paymentErrors.cvv}
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="•••"
                      onChange={(value: string) =>
                        changePayment(
                          "cvv",
                          value.replace(/\D/g, "").slice(0, 3),
                        )
                      }
                    />
                  </div>
                )}
                {payment === "Net Banking" && (
                  <select className="bank-select">
                    <option>Select your bank</option>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                  </select>
                )}
                {payment === "Cash on Delivery" && (
                  <div className="info-box">
                    Pay with cash or UPI when your order arrives.
                  </div>
                )}
              </>
            )}
            {step === 3 && (
              <>
                <div className="form-head">
                  <span>04</span>
                  <div>
                    <h2>Review your order</h2>
                    <p>
                      One last look before your greener goods are on their way.
                    </p>
                  </div>
                </div>
                <div className="review-summary">
                  <span>Deliver to</span>
                  <strong>{form.name}</strong>
                  <p>
                    {form.address}, {form.city} – {form.pin}
                  </p>
                  <hr />
                  <span>Payment</span>
                  <strong>{payment}</strong>
                  <hr />
                  <span>Delivery</span>
                  <strong>
                    {shipping === 49
                      ? "Standard"
                      : shipping === 99
                        ? "Express"
                        : "Same-day"}
                  </strong>
                </div>
                <label className="green-option">
                  <input
                    type="checkbox"
                    checked={round}
                    onChange={(e) => setRound(e.target.checked)}
                  />
                  <Icon name="leaf" />
                  <span>
                    <strong>Round up for trees</strong>
                    <small>
                      Your {money(Math.ceil(base / 100) * 100 - base)} donation
                      supports native tree planting
                    </small>
                  </span>
                </label>
              </>
            )}
            <div className="form-actions">
              {step > 0 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button onClick={next} disabled={step === 3 && !paymentValid}>
                {step === 3 ? `Place order · ${money(total)}` : "Continue"}{" "}
                <Icon name="arrow" size={17} />
              </Button>
            </div>
          </section>
          <aside className="checkout-summary">
            <h2>Your order</h2>
            {products
              .filter((p) => cart[p.id])
              .map((p) => (
                <div className="mini-item" key={p.id}>
                  <img src={p.image} alt={p.imageAlt} />
                  <div>
                    <strong>{p.name}</strong>
                    <small>Qty {cart[p.id]}</small>
                  </div>
                  <b>{money(p.price * cart[p.id])}</b>
                </div>
              ))}
            <div className="bill">
              <span>
                Subtotal <b>{money(subtotal)}</b>
              </span>
              <span>
                Delivery <b>{money(shipping)}</b>
              </span>
              {carbon && (
                <span>
                  Carbon offset <b>₹20</b>
                </span>
              )}
              <span>
                GST (18%) <b>{money(gst)}</b>
              </span>
              {donation > 0 && (
                <span>
                  Tree donation <b>{money(donation)}</b>
                </span>
              )}
              <span className="total">
                Total <b>{money(total)}</b>
              </span>
            </div>
            <div className="summary-impact">
              <Icon name="leaf" />
              <p>
                This order could save <strong>1.8 kg CO₂</strong> and{" "}
                <strong>6 plastic items</strong>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder = "",
  wide = false,
  inputMode,
  maxLength,
}: any) {
  return (
    <label className={wide ? "field wide" : "field"}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "invalid" : ""}
        aria-invalid={Boolean(error)}
      />
      {error && <small>{error}</small>}
    </label>
  )
}

function Confirmation({ order, navigate }: any) {
  return (
    <div className="confirmation">
      <div className="confetti a" />
      <div className="confetti b" />
      <div className="confirmation-card">
        <span className="success-mark">
          <Icon name="check" size={30} />
        </span>
        <span className="overline">Order confirmed</span>
        <h1>Your greener goods are on the way.</h1>
        <p>
          Thanks for choosing progress over perfection. We've sent the details
          to your email.
        </p>
        <div className="order-meta">
          <span>
            Order ID<strong>#{order || "EN24081642"}</strong>
          </span>
          <span>
            Estimated delivery<strong>26–28 June</strong>
          </span>
        </div>
        <div className="timeline">
          {["Placed", "Packed", "Shipped", "Delivered"].map((x, i) => (
            <div className={i === 0 ? "active" : ""} key={x}>
              <span>{i === 0 ? <Icon name="check" size={15} /> : i + 1}</span>
              <b>{x}</b>
            </div>
          ))}
        </div>
        <div className="saved-card">
          <Icon name="leaf" size={32} />
          <div>
            <strong>Your impact with this order</strong>
            <p>
              You saved an estimated <b>1.8 kg CO₂</b> and{" "}
              <b>6 plastic items</b>. Plus, you earned <b>84 Green Points.</b>
            </p>
          </div>
        </div>
        <div className="conf-actions">
          <Button onClick={() => navigate("orders")}>Track order</Button>
          <Button variant="secondary" onClick={() => navigate("products")}>
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  )
}

function Profile({ navigate, profile, editProfile, logout }: any) {
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="shell page profile">
      <Breadcrumb items={["Home", "Profile"]} />
      <div className="profile-hero">
        <span className="profile-avatar">{initials || "EN"}</span>
        <div>
          <span className="overline light">EcoNest member</span>
          <h1>Hello, {profile.name.split(" ")[0]}</h1>
          <p>{profile.email} · Your small swaps are adding up beautifully.</p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Button variant="secondary" onClick={editProfile}>Edit profile</Button>
          <Button variant="secondary" onClick={logout}>Log out</Button>
        </div>
      </div>
      <div className="profile-grid">
        <div className="impact-card">
          <div>
            <span>
              <Icon name="leaf" />
            </span>
            <h2>Your eco-impact</h2>
          </div>
          <div className="impact-numbers">
            <span>
              <strong>14.6 kg</strong>CO₂ saved
            </span>
            <span>
              <strong>47</strong>Plastic items avoided
            </span>
            <span>
              <strong>3</strong>Trees supported
            </span>
          </div>
        </div>
        <div className="points-card">
          <span className="overline">Green rewards</span>
          <strong>680</strong>
          <p>Green Points</p>
          <div>
            <i style={{ width: "68%" }} />
          </div>
          <small>320 points until your ₹100 reward</small>
        </div>
      </div>
      <div className="account-links">
        <button onClick={() => navigate("orders")}>
          <span>
            <Icon name="cart" />
          </span>
          <div>
            <strong>Order history</strong>
            <small>Track, return, or buy again</small>
          </div>
          <Icon name="arrow" />
        </button>
        <button onClick={() => navigate("wishlist")}>
          <span>
            <Icon name="heart" />
          </span>
          <div>
            <strong>Your wishlist</strong>
            <small>All your saved swaps</small>
          </div>
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  )
}

function Orders({
  navigate,
  addOrderToCart,
  orders,
  highlightedOrderId,
}: {
  navigate: (page: Page) => void
  addOrderToCart: (items: { id: number; qty: number }[]) => void
  orders: SavedOrder[]
  highlightedOrderId: string
}) {
  const [tracking, setTracking] = useState<null | {
    id: string
    step: number
    delivery: string
  }>(null)
  const ordered = [...orders].sort(
    (a, b) => Number(b.id.slice(2)) - Number(a.id.slice(2)),
  )
  return (
    <div className="shell page">
      <Breadcrumb
        items={["Profile", "Orders"]}
        back={() => navigate("profile")}
      />
      <div className="page-heading">
        <span className="overline">Your journey</span>
        <h1>Order history</h1>
      </div>
      {!ordered.length && (
        <div className="empty">
          <h2>No orders yet</h2>
          <p>Your completed orders will appear here.</p>
          <Button onClick={() => navigate("products")}>Explore products</Button>
        </div>
      )}
      {ordered.map((placed) => (
        <div className="order-card" key={placed.id}>
          <div>
            <span>Order #{placed.id}</span>
            <Badge>{placed.status}</Badge>
            <small>
              Placed {placed.date} ·{" "}
              {placed.items.reduce((sum, item) => sum + item.qty, 0)} items
            </small>
            {placed.id === highlightedOrderId && (
              <small>Most recent checkout</small>
            )}
          </div>
          <div className="order-thumbs">
            {placed.items.map((item) => {
              const p = products.find((product) => product.id === item.id)
              return p ? (
                <div key={item.id}>
                  <img src={p.image} alt={p.imageAlt} />
                  <small>
                    {p.name} × {item.qty}
                  </small>
                </div>
              ) : null
            })}
          </div>
          <div>
            <strong>{money(placed.total)}</strong>
            <Button
              variant="secondary"
              onClick={() =>
                setTracking({
                  id: placed.id,
                  step: placed.step,
                  delivery: placed.delivery,
                })
              }
            >
              Track order
            </Button>
            <Button
              variant="secondary"
              onClick={() => addOrderToCart(placed.items)}
            >
              Buy again
            </Button>
          </div>
        </div>
      ))}
      {tracking && (
        <Modal
          title={`Track order #${tracking.id}`}
          close={() => setTracking(null)}
        >
          <div className="tracking-view">
            <div className="tracking-date">
              <span>Estimated delivery</span>
              <strong>{tracking.delivery}</strong>
            </div>
            <div className="tracking-timeline">
              {[
                "Placed",
                "Packed",
                "Shipped",
                "Out for Delivery",
                "Delivered",
              ].map((label, index) => (
                <div
                  className={
                    index === tracking.step
                      ? "complete current"
                      : index < tracking.step
                        ? "complete"
                        : ""
                  }
                  key={label}
                >
                  <span>
                    {index < tracking.step ? (
                      <Icon name="check" size={15} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <small>
                      {index === tracking.step
                        ? "Current status"
                        : index < tracking.step
                          ? "Completed"
                          : "Coming up"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setTracking(null)}>
              <Icon name="back" size={17} /> Back to order history
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function About({ navigate }: any) {
  return (
    <>
      <section className="about-hero">
        <div className="shell">
          <span className="overline light">Our reason for being</span>
          <h1>
            Small swaps.
            <br />
            Big planet impact.
          </h1>
          <p>
            We make sustainable living less overwhelming, one beautifully
            practical choice at a time.
          </p>
        </div>
      </section>
      <section className="shell story">
        <div>
          <span className="overline">Our story</span>
          <h2>Progress belongs in every home</h2>
          <p>
            EcoNest began with a simple frustration: finding genuinely
            sustainable products shouldn't require hours of research. So we
            built the store we wished existed—transparent, useful, and never
            preachy.
          </p>
          <p>
            Every item passes our four-part standard for responsible materials,
            ethical making, useful life, and thoughtful end-of-life.
          </p>
          <Button onClick={() => navigate("products")}>
            Shop our standards
          </Button>
        </div>
        <img src={photos[3]} alt="Calm sustainable home interior" />
      </section>
      <section className="values shell">
        <div>
          <Icon name="leaf" />
          <h3>Vetted, not vague</h3>
          <p>We verify claims and favour trusted certifications.</p>
        </div>
        <div>
          <Icon name="check" />
          <h3>Made to last</h3>
          <p>Durability is sustainability's quiet superpower.</p>
        </div>
        <div>
          <Icon name="home" />
          <h3>People matter</h3>
          <p>Fair work and safer materials are non-negotiable.</p>
        </div>
      </section>
    </>
  )
}

function Contact({ navigate }: any) {
  const empty = { name: "", email: "", subject: "", message: "" }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const change = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    setErrors((current) => ({ ...current, [field]: "" }))
    setSent(false)
  }
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Name is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address"
    if (!form.subject.trim()) next.subject = "Subject is required"
    if (form.message.trim().length < 10)
      next.message = "Message must be at least 10 characters"
    setErrors(next)
    if (Object.keys(next).length) return
    setForm(empty)
    setSent(true)
  }
  return (
    <div className="shell page contact">
      <Breadcrumb items={["Home", "Contact"]} />
      <div className="contact-grid">
        <div className="contact-intro">
          <span className="overline">We're here to help</span>
          <h1>Let's talk greener living</h1>
          <p>
            Questions about a product, your order, or making your first
            sustainable swap? Our friendly team usually replies within one
            working day.
          </p>
          <img
            className="contact-image"
            src={photos[4]}
            alt="Eco-friendly personal care products arranged on a clean surface"
          />
          <div className="contact-detail">
            <strong>Email us</strong>
            <span>hello@econest.in</span>
            <strong>Call us</strong>
            <span>+91 80 4567 8900</span>
            <strong>Hours</strong>
            <span>Mon–Sat, 9 AM–6 PM</span>
          </div>
        </div>
        <form className="contact-form" onSubmit={submit} noValidate>
          {sent && (
            <div className="contact-success" role="status">
              <Icon name="check" size={20} />
              <strong>Thanks, we'll reply within 24 hours</strong>
            </div>
          )}
          <FormField
            label="Name"
            value={form.name}
            error={errors.name}
            placeholder="Your full name"
            onChange={(value: string) => change("name", value)}
          />
          <FormField
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            placeholder="you@example.com"
            onChange={(value: string) => change("email", value)}
          />
          <FormField
            wide
            label="Subject"
            value={form.subject}
            error={errors.subject}
            placeholder="What can we help with?"
            onChange={(value: string) => change("subject", value)}
          />
          <label className="field wide">
            <span>Message</span>
            <textarea
              value={form.message}
              className={errors.message ? "invalid" : ""}
              placeholder="Tell us how we can help..."
              onChange={(event) => change("message", event.target.value)}
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message && <small>{errors.message}</small>}
          </label>
          <Button type="submit">
            Send message <Icon name="arrow" size={17} />
          </Button>
        </form>
      </div>
    </div>
  )
}

function Login({ navigate, mode, setMode, profile, saveProfile, signedIn, apiRequest, remembered }: any) {
  const needsName = mode !== "login"
  const [form, setForm] = useState({name:"",email:"",password:"",confirm:""})
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [success, setSuccess] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setForm({name:mode === "edit" ? profile?.name || "" : "",email:mode === "edit" ? profile?.email || "" : "",password:"",confirm:""})
    setErrors({});setSuccess("")
  },[mode])
  const change = (field:string,value:string) => {
    setForm(current=>({...current,[field]:value}))
    setErrors(current=>({...current,[field]:""}))
    setSuccess("")
  }
  const submit = async (event:React.FormEvent) => {
    event.preventDefault()
    const next:Record<string,string>={}
    if (needsName && !form.name.trim()) next.name="Name is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email="Enter a valid email address"
    if (mode !== "edit" && form.password.length < 8) next.password="Password must be at least 8 characters"
    if (mode === "signup" && form.confirm !== form.password) next.confirm="Passwords must match"
    if (mode === "edit" && form.password && form.password.length < 8) next.password="Password must be at least 8 characters"
    if (mode === "edit" && form.password && form.confirm !== form.password) next.confirm="Passwords must match"
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      if (mode === "edit") {
        const r = await apiRequest("/auth/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.name,email:form.email,password:form.password})})
        saveProfile(r.user)
        setSuccess("Profile updated successfully")
      } else {
        const r = await apiRequest(mode === "signup" ? "/auth/register" : "/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.name,email:form.email,password:form.password})})
        signedIn(r)
      }
      setForm(current=>({...current,password:"",confirm:""}))
    } catch (err) {setErrors({general:err instanceof Error ? err.message : "Could not sign in"})}
    finally {setBusy(false)}
  }
  const title =
    mode === "signup"
      ? "Create your account"
      : mode === "edit"
        ? "Edit your profile"
        : "Good to see you again"
  const intro =
    mode === "signup"
      ? "Start tracking your positive impact today."
      : mode === "edit"
        ? "Update your account details below."
        : "Sign in to see your orders, impact, and rewards."
  return (
    <div className="auth">
      <div className="auth-card">
        <button className="logo" onClick={() => navigate("home")}>
          <span className="logo-mark">
            <Icon name="leaf" />
          </span>
          <span>
            Eco<span>Nest</span>
          </span>
        </button>
        <span className="overline">
          {mode === "signup"
            ? "Join the community"
            : mode === "edit"
              ? "Your account"
              : "Welcome back"}
        </span>
        <h1>{title}</h1>
        <p>{intro}</p>
        {errors.general && <p role="alert" style={{color:"#a32020"}}>{errors.general}</p>}
        {mode === "login" && remembered.length > 0 && (
          <div style={{margin:"16px 0"}}>
            <strong>Accounts used on this browser</strong>
            {remembered.map((account: {name:string;email:string}) => (
              <button type="button" key={account.email} className="auth-switch" style={{display:"block",textAlign:"left",width:"100%"}}
                onClick={() => change("email",account.email)}>
                {account.name} — {account.email}
              </button>
            ))}
            <small>Choose an account, then enter its password.</small>
          </div>
        )}
        {success && (
          <div className="auth-success" role="status">
            <Icon name="check" size={18} />
            <strong>{success}</strong>
          </div>
        )}
        <form onSubmit={submit} noValidate>
          {needsName && (
            <FormField
              label="Full name"
              value={form.name}
              error={errors.name}
              placeholder="Your full name"
              onChange={(value: string) => change("name", value)}
            />
          )}
          <FormField
            label="Email address"
            type="email"
            value={form.email}
            error={errors.email}
            placeholder="you@example.com"
            onChange={(value: string) => change("email", value)}
          />
          <PasswordField
            label="Password"
            value={form.password}
            error={errors.password}
            placeholder={
              mode === "edit" ? "Enter a new password" : "At least 8 characters"
            }
            onChange={(value: string) => change("password", value)}
          />
          {needsName && (
            <PasswordField
              label="Confirm password"
              value={form.confirm}
              error={errors.confirm}
              placeholder="Enter password again"
              onChange={(value: string) => change("confirm", value)}
            />
          )}
          <Button type="submit" disabled={busy}>
            {mode === "signup"
              ? "Create account"
              : mode === "edit"
                ? "Save changes"
                : "Sign in"}
          </Button>
        </form>
        {mode === "edit" ? (
          <button className="auth-switch" onClick={() => navigate("profile")}>
            <Icon name="back" size={15} /> Back to profile
          </button>
        ) : (
          <button
            className="auth-switch"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New to EcoNest? Create an account"}
          </button>
        )}
      </div>
      <div className="auth-image">
        <img src={photos[0]} alt="Natural sustainable home product" />
        <div>
          <Icon name="leaf" />
          <q>
            There is no such thing as away. When we throw anything away, it must
            go somewhere.
          </q>
          <span>— Annie Leonard</span>
        </div>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, error, placeholder }: any) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="field password-field">
      <span>{label}</span>
      <span className="password-input">
        <input
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={error ? "invalid" : ""}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
      {error && <small>{error}</small>}
    </label>
  )
}

function CompareBar({ ids, setCompare }: any) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {
        <div className="compare-bar">
          <div>
            <strong>Compare products</strong>
            <span>{ids.length}/3 selected</span>
          </div>
          <div className="compare-mini">
            {ids.map((id: number) => {
              const p = products.find((product) => product.id === id)!
              return (
                <span key={id}>
                  <img src={p.image} alt={p.imageAlt} />
                  <button
                    onClick={() =>
                      setCompare(ids.filter((x: number) => x !== id))
                    }
                  >
                    <Icon name="close" size={13} />
                  </button>
                </span>
              )
            })}
          </div>
          <Button disabled={ids.length < 2} onClick={() => setOpen(true)}>
            Compare now
          </Button>
          <button onClick={() => setCompare([])}>
            <Icon name="close" />
          </button>
        </div>
      }
      {open && (
        <Modal title="Eco-score comparison" close={() => setOpen(false)}>
          <div className="compare-table">
            {ids.map((id: number) => {
              const p = products.find((x) => x.id === id)!
              return (
                <div key={id}>
                  <img src={p.image} alt={p.imageAlt} />
                  <h3>{p.name}</h3>
                  <strong>{p.eco}/5 leaves</strong>
                  <span>{p.material}</span>
                  <small>{p.certs.join(" · ")}</small>
                  <Button onClick={() => setOpen(false)}>Choose this</Button>
                </div>
              )
            })}
          </div>
        </Modal>
      )}
    </>
  )
}
function Modal({ title, children, close }: any) {
  return (
    <div className="modal-wrap" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
function Recently({ ids, viewProduct }: any) {
  return (
    <section className="recent shell">
      <div className="section-head">
        <h2>Recently viewed</h2>
      </div>
      <div>
        {ids.map((id: number) => {
          const p = products.find((x) => x.id === id)!
          return (
            <button key={id} onClick={() => viewProduct(id)}>
              <img src={p.image} alt={p.imageAlt} />
              <span>
                <strong>{p.name}</strong>
                <small>{money(p.price)}</small>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
function Newsletter() {
  const [done, setDone] = useState(false)
  return (
    <section className="newsletter">
      <div className="shell">
        <div>
          <span className="overline light">The good news letter</span>
          <h2>Simple ideas for a lighter life</h2>
          <p>
            Monthly swaps, honest guides, and members-only offers. No clutter.
          </p>
        </div>
        {done ? (
          <strong className="subscribed">
            <Icon name="check" /> You're on the list.
          </strong>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setDone(true)
            }}
          >
            <input required type="email" placeholder="Your email address" />
            <Button type="submit">Join the community</Button>
          </form>
        )}
      </div>
    </section>
  )
}
function Help({ close, navigate }: any) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const answers: Record<string, string> = {
    "What makes a product sustainable?": "EcoNest highlights products designed to reduce waste or resource use, such as reusable items, recycled materials, and responsibly sourced materials. Check each product's materials, certifications, and impact details for its specific sustainability information.",
    "How do returns work?": "For return eligibility, deadlines, and instructions, please contact our support team with your order number. The exact return conditions are not specified here, so our team can confirm the applicable policy before you send anything back.",
  }
  return (
    <aside className="help">
      <div>
        <span><Icon name="leaf" /></span>
        <div><strong>EcoNest help</strong><small>Frequently asked questions</small></div>
        <button onClick={close} aria-label="Close help"><Icon name="close" /></button>
      </div>
      <p>Hi! How can we help you live a little lighter today?</p>
      {["Where is my order?", "What makes a product sustainable?", "How do returns work?"].map((question) => (
        <div key={question} className="help-question">
          <button type="button" aria-expanded={expanded === question} onClick={() => {
            if (question.startsWith("Where")) { close(); navigate("orders") }
            else setExpanded(expanded === question ? null : question)
          }}>
            {question}<Icon name="arrow" size={15} />
          </button>
          {expanded === question && <p className="help-answer">{answers[question]}</p>}
        </div>
      ))}
      <small>Need more help? <button onClick={() => { close(); navigate("contact") }}>Contact our team</button></small>
    </aside>
  )
}

function Footer({ navigate }: any) {
  return (
    <footer>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <button className="logo" onClick={() => navigate("home")}>
            <span className="logo-mark">
              <Icon name="leaf" />
            </span>
            <span>
              Eco<span>Nest</span>
            </span>
          </button>
          <p>Small swaps. Big planet impact.</p>
          <small>Mindfully sourced in India.</small>
        </div>
        <div>
          <strong>Shop</strong>
          <button onClick={() => navigate("products")}>All products</button>
          <button onClick={() => navigate("products")}>New arrivals</button>
          <button onClick={() => navigate("wishlist")}>Wishlist</button>
        </div>
        <div>
          <strong>EcoNest</strong>
          <button onClick={() => navigate("about")}>Our impact</button>
          <button onClick={() => navigate("about")}>Our standards</button>
          <button onClick={() => navigate("contact")}>Contact</button>
        </div>
        <div>
          <strong>Help</strong>
          <button onClick={() => navigate("orders")}>Track order</button>
          <button onClick={() => navigate("contact")}>
            Shipping & returns
          </button>
          <button onClick={() => navigate("contact")}>FAQs</button>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2025 EcoNest. Made thoughtfully for Earth.</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  )
}
function MobileNav({ page, navigate, cartCount }: any) {
  return (
    <nav className="mobile-nav">
      {[
        ["home", "home", "Home"],
        ["products", "search", "Search"],
        ["cart", "cart", "Cart"],
        ["wishlist", "heart", "Wishlist"],
        ["profile", "user", "Profile"],
      ].map(([p, i, l]) => (
        <button
          className={page === p ? "active" : ""}
          onClick={() => navigate(p)}
          key={p}
        >
          <span>
            <Icon name={i} />
            {p === "cart" && cartCount > 0 && <b>{cartCount}</b>}
          </span>
          <small>{l}</small>
        </button>
      ))}
    </nav>
  )
}

export default App
