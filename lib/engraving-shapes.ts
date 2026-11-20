/**
 * What shape each engravable piece's engraving surface is, so the preview is drawn
 * on the right one: Alaina's pendant is a round disc, Paris's is a small bar.
 *
 * Keyed by the product's permanent id. A product not listed gets the bar, so when
 * NOMA adds an engravable piece with another surface, add it here and, for a new
 * shape, a blank photo in `public/` and an entry in `SHAPES` in
 * `components/products/EngravingPreview.tsx`. (The proper long-term home is a field
 * on the portal's Products page; that is an NGF app change.)
 */
export type EngravingShape = 'bar' | 'disc'

const SHAPE_BY_PRODUCT: Record<string, EngravingShape> = {
  'alaina-necklace': 'disc',
  'paris-bracelet': 'bar',
}

export function engravingShape(productId: string): EngravingShape {
  return SHAPE_BY_PRODUCT[productId] ?? 'bar'
}

const KNOWN_SHAPES: readonly EngravingShape[] = ['bar', 'disc']

/**
 * The shape to draw a product's engraving preview on. The portal's own setting
 * (the feed's `engravingShape`) wins; while the client has not set one, the map
 * above decides. A key this site has no blank photo for gets the bar.
 */
export function resolveEngravingShape(fromPortal: string | null | undefined, productId: string): EngravingShape {
  if (fromPortal) return (KNOWN_SHAPES as readonly string[]).includes(fromPortal) ? (fromPortal as EngravingShape) : 'bar'
  return engravingShape(productId)
}
