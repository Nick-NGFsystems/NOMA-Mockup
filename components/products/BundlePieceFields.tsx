'use client'
import { FONTS, type FontKey } from '@/components/products/EngravingPreview'
import { EngravingFields } from '@/components/products/EngravingFields'
import { resolveEngravingShape } from '@/lib/engraving-shapes'
import { engravingLimit, type BundlePieceChoice, type NgfBundlePiece } from '@/lib/ngf-bundles'

/** What the popup holds for one unit of one piece while the shopper chooses. */
export interface PieceDraft {
  option: string | null
  text: string
  font: FontKey
}

export const pieceKey = (id: string, unit: number) => `${id}#${unit}`

/** Every unit of every shop piece, in the bundle's order. Extras have nothing to choose. */
export function pieceUnits(pieces: NgfBundlePiece[]): { piece: NgfBundlePiece; unit: number }[] {
  return pieces
    .filter((piece) => !piece.extra)
    .flatMap((piece) => Array.from({ length: piece.quantity }, (_, i) => ({ piece, unit: i + 1 })))
}

/** "Also includes": the extras a bundle holds, with their photo when there is one. Nothing to choose. */
export function BundleExtras({ extras }: { extras: NgfBundlePiece[] }) {
  if (extras.length === 0) return null
  return (
    <div>
      <p className={`${LABEL} mb-1.5`}>Also includes</p>
      <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
        {extras.map((extra) => (
          <li key={extra.id} className="flex items-center gap-2.5 text-[0.88rem] text-[var(--ink)]">
            {extra.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={extra.image} alt="" className="w-8 h-8 rounded-[7px] object-cover bg-[var(--beige)] shrink-0" />
            ) : null}
            <span>
              {extra.name}
              {extra.quantity > 1 ? ` × ${extra.quantity}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const fontKeyFor = (label: string): FontKey =>
  (Object.keys(FONTS) as FontKey[]).find((key) => FONTS[key].label === label) ?? 'clean'

/**
 * The popup's starting choices: a cart line's own when editing it, otherwise
 * each piece's first option (as a single product starts on its first option)
 * and no engraving.
 */
export function initialDrafts(pieces: NgfBundlePiece[], from: BundlePieceChoice[] | null | undefined): Record<string, PieceDraft> {
  const drafts: Record<string, PieceDraft> = {}
  for (const { piece, unit } of pieceUnits(pieces)) {
    const saved = from?.find((c) => c.id === piece.id && c.unit === unit)
    const option = saved?.option && piece.options.includes(saved.option) ? saved.option : (piece.options[0] ?? null)
    drafts[pieceKey(piece.id, unit)] = {
      option,
      text: piece.engravable && saved?.engraving ? saved.engraving.text : '',
      font: saved?.engraving ? fontKeyFor(saved.engraving.font) : 'clean',
    }
  }
  return drafts
}

/** The drafts as choices for checkBundleChoices (lib/ngf-bundles.ts), which checks and tidies them. */
export function draftsToChoices(pieces: NgfBundlePiece[], drafts: Record<string, PieceDraft>): BundlePieceChoice[] {
  return pieceUnits(pieces).map(({ piece, unit }) => {
    const d = drafts[pieceKey(piece.id, unit)]
    const text = d && piece.engravable ? d.text.replace(/\s+/g, ' ').trim() : ''
    return {
      id: piece.id,
      unit,
      option: d?.option ?? null,
      engraving: text ? { text, font: FONTS[d.font].label } : null,
    }
  })
}

const LABEL = 'block text-[0.8rem] font-semibold text-[var(--ink)]'

/**
 * One block per piece (and per unit, when the bundle holds two of the same
 * piece): its photo and name, its option if it has options, and, only when the
 * piece can be engraved, its own engraving, font and preview on its own shape.
 */
export function BundlePieceFields({
  pieces, drafts, onChange,
}: {
  pieces: NgfBundlePiece[]
  drafts: Record<string, PieceDraft>
  onChange: (key: string, draft: PieceDraft) => void
}) {
  return (
    <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
      <p className={LABEL}>What&rsquo;s in this bundle</p>
      {pieceUnits(pieces).map(({ piece, unit }) => {
        const key = pieceKey(piece.id, unit)
        const draft = drafts[key] ?? { option: piece.options[0] ?? null, text: '', font: 'clean' as FontKey }
        const set = (patch: Partial<PieceDraft>) => onChange(key, { ...draft, ...patch })
        const inputId = `pm-piece-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`
        const title = piece.quantity > 1 ? `${piece.name} (${unit} of ${piece.quantity})` : piece.name
        return (
          <section
            key={key}
            aria-label={title}
            className="border border-[rgba(31,27,22,0.12)] rounded-[14px] p-3 flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2.5">
              {piece.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={piece.image} alt="" className="w-11 h-11 rounded-[9px] object-cover bg-[var(--beige)] shrink-0" />
              ) : (
                <span aria-hidden="true" className="w-11 h-11 rounded-[9px] bg-[var(--beige)] shrink-0" />
              )}
              <span className="text-[0.92rem] font-semibold text-[var(--ink)]">{title}</span>
            </div>

            {piece.options.length > 0 && (
              <div role="radiogroup" aria-label={`${piece.optionLabel ?? 'Option'} for ${title}`} className="flex flex-wrap gap-1.5">
                {piece.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={draft.option === o}
                    // 44px tall: the minimum touch target.
                    className={`pm-pill min-h-11 justify-center${draft.option === o ? ' active' : ''}`}
                    onClick={() => set({ option: o })}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}

            {piece.engravable && (
              <div>
                <EngravingFields
                  id={inputId}
                  label="Engraving (optional)"
                  value={draft.text}
                  onTextChange={(text) => set({ text })}
                  font={draft.font}
                  onFontChange={(font) => set({ font })}
                  maxChars={engravingLimit(piece)}
                  shape={resolveEngravingShape(piece.engravingShape, piece.id)}
                  fontGroupLabel={`Font style for ${title}`}
                />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
