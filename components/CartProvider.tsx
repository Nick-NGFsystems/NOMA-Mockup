'use client'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export interface CartItem {
  id: string
  title: string
  price: string
  image: string
  qty: number
  /** Engraving text for this line, when the buyer asked for personalization. */
  customization?: string | null
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>) => void
  updateQty: (id: string, delta: number) => void
  /** Take the server's current prices into the cart (checkout's "your total changed" answer). */
  repriceItems: (prices: { id: string; unitCents: number }[]) => void
  /** Empty the cart. Call ONLY after a payment is confirmed settled. */
  clearCart: () => void
  totalQty: number
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  updateQty: () => {},
  repriceItems: () => {},
  clearCart: () => {},
  totalQty: 0,
})

const STORAGE_KEY = 'nomaCart'

/**
 * Validate anything read back from localStorage.
 *
 * It is user-writable storage, so a hand-edited or half-written value used to
 * be trusted straight into React state — a non-array or a malformed row would
 * throw during render and take the whole site down, not just the cart. Bad data
 * is now discarded silently, which is the right failure for a shopping cart.
 */
function parseStoredCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is CartItem =>
        Boolean(i) &&
        typeof i.id === 'string' &&
        typeof i.title === 'string' &&
        typeof i.price === 'string' &&
        Number.isInteger(i.qty) &&
        i.qty > 0,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(parseStoredCart(stored))
    } catch {
      // ignore
    }
  }, [])

  const addItem = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      const next = existing
        ? prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const updateQty = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  /**
   * NOMA sets prices in the portal now, so a price can change while an item
   * sits in someone's cart. The cart's copy is display-only (checkout re-prices
   * on the server and refuses a total the shopper was not shown), but the
   * DISPLAY must still catch up, or every retry would send the same stale total
   * and be refused forever. Only lines the server priced are touched.
   */
  const repriceItems = useCallback((prices: { id: string; unitCents: number }[]) => {
    const byId = new Map(
      prices
        .filter((p) => p && typeof p.id === 'string' && Number.isInteger(p.unitCents) && p.unitCents > 0)
        .map((p) => [p.id, p.unitCents] as const),
    )
    setItems((prev) => {
      const next = prev.map((i) => {
        const cents = byId.get(i.id)
        if (cents === undefined) return i
        const dollars = cents / 100
        const price = Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`
        return { ...i, price }
      })
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  /**
   * There was no way to empty the cart at all, which meant a paid order left
   * its items sitting in localStorage — the buyer could refresh the success
   * screen, land back on a full cart, and pay for the same jewelry twice.
   *
   * Only ever call this once a charge is CONFIRMED settled. Clearing earlier
   * loses the buyer's basket on a declined card.
   */
  const clearCart = useCallback(() => {
    setItems([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [])

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, repriceItems, clearCart, totalQty }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
