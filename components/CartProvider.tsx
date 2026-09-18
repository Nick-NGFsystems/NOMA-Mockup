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

/**
 * Identity of a cart LINE, which is not the same as the product id.
 *
 * resolveCart() prices by `id` (`productId` or `productId-size`), so the id has
 * to stay in that exact shape. But two different engravings of the same piece
 * are two different lines — merging them by id would silently throw one
 * engraving away and bump the quantity of the other. Dedupe and quantity
 * changes key on this; the server still receives the plain `id`.
 *
 * Keyed as JSON rather than a delimiter-joined string: engraving text is free
 * input, so any separator character a buyer could type could forge a collision
 * between two genuinely different lines. JSON escaping removes that class of
 * bug entirely.
 */
export function lineKey(item: { id: string; customization?: string | null }): string {
  return JSON.stringify([item.id, item.customization ?? ''])
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>) => void
  /** Takes a lineKey(), not a product id. */
  updateQty: (key: string, delta: number) => void
  /** Empty the cart. Call ONLY after a payment is confirmed settled. */
  clearCart: () => void
  totalQty: number
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  updateQty: () => {},
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
      const key = lineKey(item)
      const existing = prev.find((i) => lineKey(i) === key)
      const next = existing
        ? prev.map((i) => (lineKey(i) === key ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  /** `key` is a lineKey(), not a product id — see lineKey above. */
  const updateQty = useCallback((key: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) => (lineKey(i) === key ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
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
    <CartContext.Provider value={{ items, addItem, updateQty, clearCart, totalQty }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
