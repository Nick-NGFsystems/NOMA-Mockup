/**
 * Bundles made of real products, with each piece engraved on its own.
 *
 * A bundle on the portal's Products page can list its pieces (other products the
 * client sells). The product feed then gives the bundle an `includes` list: per
 * piece its handle, name, photo, how many of it, its options, and whether and how
 * it can be engraved. A shopper picks, per piece and per unit, the option and the
 * engraving; checkout checks every choice here against the live feed and refuses
 * anything that does not match.
 *
 * The bundle's price is its own price whatever is chosen. The choices are written
 * into the order line's one `customization` string, one piece per line, so the
 * order report, the portal's order inbox and the order emails need no new field.
 *
 * NO IMPORTS on purpose: it runs in the browser (the product popup and the cart),
 * on the server (checkout), and under `node --experimental-strip-types` for the
 * tests in scripts/verify-bundles.ts.
 */

/** One piece of a bundle, as the product feed describes it. */
export interface NgfBundlePiece {
  /** The piece's own product handle. For an extra, "extra:1", "extra:2"… */
  id: string
  /**
   * An extra item that is not sold in the shop (a gift pouch, a card): shown as
   * part of what the bundle holds, with nothing to choose. Never engraved.
   */
  extra: boolean
  name: string
  image: string | null
  /** How many of this piece the bundle holds, 1 to 5. Each unit is chosen on its own. */
  quantity: number
  /** What the options are called, e.g. "Length". Null without options. */
  optionLabel: string | null
  /** The piece's option labels. The shopper must pick one per unit when there are any. */
  options: string[]
  engravable: boolean
  /** "bar", "disc"… Null when the client has not set one: the site picks its own default. */
  engravingShape: string | null
  /** Null when the client has not set one: DEFAULT_ENGRAVING_MAX_CHARS. */
  engravingMaxChars: number | null
}

/** What the shopper chose for one unit of one piece. */
export interface BundlePieceChoice {
  /** The piece's product handle. */
  id: string
  /** Which unit of that piece, 1 to its quantity. */
  unit: number
  /** The option label, when the piece has options. */
  option: string | null
  /** The engraving, when the piece is engravable and the shopper wrote one. */
  engraving: { text: string; font: string } | null
}

export const DEFAULT_ENGRAVING_MAX_CHARS = 10
const MAX_PIECES = 10
const MAX_PIECE_QUANTITY = 5
const MAX_FONT_LENGTH = 40

const isInt = (n: unknown, min: number, max: number): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max

const nonEmpty = (s: unknown): s is string => typeof s === 'string' && s.trim() !== ''

/** Read a feed `includes` list. Anything unreadable makes the whole list unreadable (null): a bundle that cannot be described is not sold as one made of pieces. */
export function readBundlePieces(raw: unknown): NgfBundlePiece[] | null {
  if (raw === undefined || raw === null) return null
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_PIECES) return null
  const pieces: NgfBundlePiece[] = []
  const seen = new Set<string>()
  for (const entry of raw) {
    const p = entry as Record<string, unknown> | null
    if (!p || typeof p !== 'object') return null
    if (!nonEmpty(p.id) || !nonEmpty(p.name) || seen.has(p.id)) return null
    if (!isInt(p.quantity, 1, MAX_PIECE_QUANTITY)) return null
    seen.add(p.id)
    const extra = p.extra === true
    const options = !extra && Array.isArray(p.options) ? p.options.filter(nonEmpty) : []
    pieces.push({
      id: p.id,
      extra,
      name: p.name,
      image: nonEmpty(p.image) ? p.image : null,
      quantity: p.quantity,
      optionLabel: options.length > 0 && nonEmpty(p.optionLabel) ? p.optionLabel : null,
      options,
      engravable: !extra && p.engravable === true,
      engravingShape: nonEmpty(p.engravingShape) ? p.engravingShape : null,
      engravingMaxChars: isInt(p.engravingMaxChars, 1, 40) ? p.engravingMaxChars : null,
    })
  }
  return pieces
}

/** True when at least one piece is a shop product, so there is something to choose per piece. */
export const hasChoosablePieces = (pieces: NgfBundlePiece[] | null | undefined): boolean =>
  Boolean(pieces && pieces.some((p) => !p.extra))

/** The extras (not sold in the shop) a bundle holds, in order. */
export const bundleExtras = (pieces: NgfBundlePiece[] | null | undefined): NgfBundlePiece[] =>
  pieces ? pieces.filter((p) => p.extra) : []

export const engravingLimit = (piece: Pick<NgfBundlePiece, 'engravingMaxChars'>): number =>
  piece.engravingMaxChars ?? DEFAULT_ENGRAVING_MAX_CHARS

/** Characters as a shopper counts them (an emoji is one), not UTF-16 units. */
const charCount = (s: string): number => [...s].length

/** Engraving text: no line breaks or control characters, because each piece is one line of the order. */
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/
const FONT_OK = /^[\p{L}\p{N} .'&-]+$/u

export type CheckedChoices =
  | { ok: true; choices: BundlePieceChoice[] }
  | { ok: false; reason: string }

/**
 * Check a shopper's choices for one bundle against the feed's pieces. REFUSES
 * rather than repairs, with a reason the shopper can act on:
 *
 * - a choice for a piece that is not in the bundle, or for a unit past its quantity
 * - the same piece and unit chosen twice
 * - a piece with options left without one, or given an option it does not have
 * - an engraving on a piece that cannot be engraved, or longer than that piece allows
 *
 * An empty engraving is no engraving (engraving is optional on each piece). The
 * result is in the bundle's own order, piece by piece and unit by unit, and holds
 * only the units that carry an option or an engraving.
 */
export function checkBundleChoices(bundleName: string, pieces: NgfBundlePiece[], raw: unknown): CheckedChoices {
  const list = raw === undefined || raw === null ? [] : raw
  if (!Array.isArray(list)) return { ok: false, reason: `We could not read your choices for ${bundleName}.` }
  const units = pieces.reduce((n, p) => n + p.quantity, 0)
  if (list.length > units) return { ok: false, reason: `We could not read your choices for ${bundleName}.` }

  const byKey = new Map<string, BundlePieceChoice>()
  for (const entry of list) {
    const c = entry as Record<string, unknown> | null
    if (!c || typeof c !== 'object' || typeof c.id !== 'string') {
      return { ok: false, reason: `We could not read your choices for ${bundleName}.` }
    }
    // An extra has nothing to choose, so a choice for one is not a choice for a piece in this bundle.
    const piece = pieces.find((p) => p.id === c.id && !p.extra)
    if (!piece) return { ok: false, reason: `${bundleName} has changed. Please choose its pieces again.` }
    if (!isInt(c.unit, 1, piece.quantity)) {
      return { ok: false, reason: `${bundleName} has changed. Please choose its pieces again.` }
    }
    const key = `${piece.id}\u0000${c.unit}`
    if (byKey.has(key)) return { ok: false, reason: `We could not read your choices for ${bundleName}.` }

    let option: string | null = null
    if (c.option !== undefined && c.option !== null) {
      if (typeof c.option !== 'string' || !piece.options.includes(c.option)) {
        return { ok: false, reason: `That option is no longer available for ${piece.name} in ${bundleName}.` }
      }
      option = c.option
    }

    let engraving: BundlePieceChoice['engraving'] = null
    if (c.engraving !== undefined && c.engraving !== null) {
      const e = c.engraving as Record<string, unknown>
      if (typeof e !== 'object' || typeof e.text !== 'string' || typeof e.font !== 'string') {
        return { ok: false, reason: `We could not read the engraving for ${piece.name}.` }
      }
      const text = e.text.trim()
      if (text !== '') {
        if (!piece.engravable) return { ok: false, reason: `${piece.name} in ${bundleName} cannot be engraved.` }
        if (CONTROL.test(text)) return { ok: false, reason: `The engraving for ${piece.name} has a character we cannot engrave.` }
        const max = engravingLimit(piece)
        if (charCount(text) > max) {
          return { ok: false, reason: `The engraving for ${piece.name} can be at most ${max} characters.` }
        }
        const font = e.font.trim()
        if (font === '' || font.length > MAX_FONT_LENGTH || !FONT_OK.test(font)) {
          return { ok: false, reason: `Please choose a font for the engraving on ${piece.name}.` }
        }
        engraving = { text: text.toUpperCase(), font }
      }
    }
    byKey.set(key, { id: piece.id, unit: c.unit, option, engraving })
  }

  const choices: BundlePieceChoice[] = []
  for (const piece of pieces) {
    if (piece.extra) continue
    for (let unit = 1; unit <= piece.quantity; unit++) {
      const choice = byKey.get(`${piece.id}\u0000${unit}`)
      if (piece.options.length > 0 && !choice?.option) {
        const what = piece.optionLabel ? `a ${piece.optionLabel.toLowerCase()}` : 'an option'
        const which = piece.quantity > 1 ? ` (${ordinal(unit)} one)` : ''
        return { ok: false, reason: `Please choose ${what} for ${piece.name}${which} in ${bundleName}.` }
      }
      if (choice && (choice.option || choice.engraving)) choices.push(choice)
    }
  }
  return { ok: true, choices }
}

const ordinal = (n: number): string => ['first', 'second', 'third', 'fourth', 'fifth'][n - 1] ?? `#${n}`

/**
 * The checked choices as the order line's `customization`: one line per unit
 * that carries an option or an engraving, in the bundle's order.
 *
 *   Alaina Necklace (16"): ALAINA (Cormorant Italic)
 *   Paris Bracelet #2: MARY (Open Sans)
 *   Simple Chain (18")
 *
 * Null when nothing was chosen. "#2" appears only when a bundle holds more than
 * one of the same piece.
 */
export function renderBundleChoices(pieces: NgfBundlePiece[], choices: BundlePieceChoice[]): string | null {
  const lines: string[] = []
  for (const choice of choices) {
    const piece = pieces.find((p) => p.id === choice.id)
    if (!piece) continue
    let line = piece.name
    if (piece.quantity > 1) line += ` #${choice.unit}`
    if (choice.option) line += ` (${choice.option})`
    if (choice.engraving) line += `: ${choice.engraving.text} (${choice.engraving.font})`
    lines.push(line)
  }
  return lines.length > 0 ? lines.join('\n') : null
}

/**
 * A stable text for a set of choices, so the cart can tell two bundles with
 * different engravings apart (each stays its own line) and treat the same
 * choices as one line.
 */
export function choicesKey(choices: BundlePieceChoice[] | null | undefined): string {
  if (!choices || choices.length === 0) return ''
  return [...choices]
    .sort((a, b) => (a.id === b.id ? a.unit - b.unit : a.id < b.id ? -1 : 1))
    .map((c) => [c.id, c.unit, c.option ?? '', c.engraving ? `${c.engraving.text}|${c.engraving.font}` : ''].join('\u0001'))
    .join('\u0002')
}

/** Shape-check choices read back from the browser's storage. Not a security check: checkout runs checkBundleChoices. */
export function readStoredChoices(raw: unknown): BundlePieceChoice[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const out: BundlePieceChoice[] = []
  for (const entry of raw) {
    const c = entry as Record<string, unknown> | null
    if (!c || typeof c.id !== 'string' || !isInt(c.unit, 1, MAX_PIECE_QUANTITY)) return undefined
    const e = c.engraving as Record<string, unknown> | null | undefined
    out.push({
      id: c.id,
      unit: c.unit,
      option: typeof c.option === 'string' ? c.option : null,
      engraving: e && typeof e.text === 'string' && typeof e.font === 'string' ? { text: e.text, font: e.font } : null,
    })
  }
  return out
}
