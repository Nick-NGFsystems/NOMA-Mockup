'use client'
import { useState } from 'react'
import { EngravingTag, FONTS, type FontKey } from '@/components/products/EngravingPreview'
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
      <p style={{ ...label, margin: '0 0 6px' }}>Also includes</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {extras.map((extra) => (
          <li key={extra.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--ink)' }}>
            {extra.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={extra.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '7px', objectFit: 'cover', background: 'var(--beige)', flexShrink: 0 }} />
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

const label: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }

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
  const [previewOpen, setPreviewOpen] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
      <p style={{ ...label, margin: 0 }}>What&rsquo;s in this bundle</p>
      {pieceUnits(pieces).map(({ piece, unit }) => {
        const key = pieceKey(piece.id, unit)
        const draft = drafts[key] ?? { option: piece.options[0] ?? null, text: '', font: 'clean' as FontKey }
        const set = (patch: Partial<PieceDraft>) => onChange(key, { ...draft, ...patch })
        const max = engravingLimit(piece)
        const inputId = `pm-piece-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`
        const title = piece.quantity > 1 ? `${piece.name} (${unit} of ${piece.quantity})` : piece.name
        return (
          <section
            key={key}
            aria-label={title}
            style={{ border: '1px solid rgba(31,27,22,0.12)', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {piece.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={piece.image} alt="" style={{ width: '44px', height: '44px', borderRadius: '9px', objectFit: 'cover', background: 'var(--beige)', flexShrink: 0 }} />
              ) : (
                <span aria-hidden="true" style={{ width: '44px', height: '44px', borderRadius: '9px', background: 'var(--beige)', flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink)' }}>{title}</span>
            </div>

            {piece.options.length > 0 && (
              <div role="radiogroup" aria-label={`${piece.optionLabel ?? 'Option'} for ${title}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {piece.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={draft.option === o}
                    className={`pm-pill${draft.option === o ? ' active' : ''}`}
                    style={{ padding: '6px 12px' }}
                    onClick={() => set({ option: o })}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}

            {piece.engravable && (
              <div>
                <label htmlFor={inputId} style={label}>Engraving (optional)</label>
                <input
                  id={inputId}
                  type="text"
                  value={draft.text}
                  maxLength={max}
                  onChange={(e) => set({ text: e.target.value })}
                  onFocus={(e) => {
                    const el = e.currentTarget
                    window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
                  }}
                  placeholder="Initials, a name, a date…"
                  autoComplete="off"
                  aria-describedby={`${inputId}-hint`}
                  // 16px keeps iOS from zooming the page when the field is focused.
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px',
                    border: '1.5px solid rgba(31,27,22,0.18)', fontFamily: 'inherit', fontSize: '16px',
                    color: 'var(--ink)', background: '#fff',
                  }}
                />
                <p id={`${inputId}-hint`} style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Up to {max} characters.
                </p>

                <div role="radiogroup" aria-label={`Font style for ${title}`} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {(Object.keys(FONTS) as FontKey[]).map((fontKey) => {
                    const def = FONTS[fontKey]
                    const active = draft.font === fontKey
                    return (
                      <button
                        key={fontKey}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => set({ font: fontKey })}
                        style={{
                          flex: '1 1 0', minWidth: '88px', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer',
                          border: active ? '1.5px solid var(--accent)' : '1px solid rgba(31,27,22,0.18)',
                          background: active ? 'var(--beige)' : '#fff', fontFamily: 'inherit',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                        }}
                      >
                        <span style={{ fontFamily: def.family, fontStyle: def.italic ? 'italic' : 'normal', fontSize: '1.1rem', color: 'var(--ink)', lineHeight: 1 }}>Aa</span>
                        <span style={{ fontSize: '0.68rem', color: active ? 'var(--ink)' : 'var(--muted)' }}>{def.label}</span>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewOpen((open) => (open === key ? null : key))}
                  aria-expanded={previewOpen === key}
                  aria-controls={`${inputId}-preview`}
                  className="pm-desc-btn"
                  style={{ marginTop: '10px', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  {previewOpen === key ? 'Hide preview' : 'See how it looks'}
                </button>
                {previewOpen === key && (
                  <div id={`${inputId}-preview`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                    <EngravingTag text={draft.text} font={draft.font} flat shape={resolveEngravingShape(piece.engravingShape, piece.id)} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>Preview</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
