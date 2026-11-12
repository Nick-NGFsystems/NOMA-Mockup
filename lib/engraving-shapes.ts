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
