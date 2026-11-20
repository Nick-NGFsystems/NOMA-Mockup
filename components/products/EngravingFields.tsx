'use client'
import { useState } from 'react'
import { EngravingTag, FONTS, type FontKey } from '@/components/products/EngravingPreview'
import type { EngravingShape } from '@/lib/engraving-shapes'

interface EngravingFieldsProps {
  /** The text box's id; the hint and the preview use it as their prefix. */
  id: string
  label: string
  value: string
  onTextChange: (text: string) => void
  font: FontKey
  onFontChange: (font: FontKey) => void
  maxChars: number
  /** The surface the preview is drawn on. */
  shape: EngravingShape
  /** The font radio group's accessible name. */
  fontGroupLabel: string
  required?: boolean
  /** Show the hint as an error: the shopper must write something first. */
  missing?: boolean
  missingMessage?: string
}

/**
 * One engraving: the text box, the font choice and "See how it looks". Used by
 * the product popup for a single piece and by BundlePieceFields once per
 * engravable piece of a bundle, so the two always look and behave the same.
 */
export function EngravingFields({
  id, label, value, onTextChange, font, onFontChange, maxChars, shape, fontGroupLabel,
  required = false, missing = false, missingMessage = '',
}: EngravingFieldsProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <label htmlFor={id} className="block text-[0.8rem] font-semibold text-[var(--ink)] mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxChars}
        onChange={(e) => onTextChange(e.target.value)}
        // Once the keyboard has finished opening, bring the box to the
        // middle of the card's own scroll area.
        onFocus={(e) => {
          const el = e.currentTarget
          window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
        }}
        placeholder="Initials, a name, a date…"
        aria-required={required}
        aria-invalid={missing}
        aria-describedby={`${id}-hint`}
        autoComplete="off"
        // 16px keeps iOS from zooming the page when the field is focused.
        className={`w-full py-2.5 px-3 rounded-[10px] border-[1.5px] text-[16px] text-[var(--ink)] bg-white ${
          missing ? 'border-[#b3261e]' : 'border-[rgba(31,27,22,0.18)]'
        }`}
      />
      <p id={`${id}-hint`} className={`mt-1.5 text-[0.75rem] ${missing ? 'text-[#b3261e]' : 'text-[var(--muted)]'}`}>
        {missing ? missingMessage : `Up to ${maxChars} characters.`}
      </p>

      <div role="radiogroup" aria-label={fontGroupLabel} className="flex flex-wrap gap-2 mt-2.5">
        {(Object.keys(FONTS) as FontKey[]).map((key) => {
          const def = FONTS[key]
          const active = font === key
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onFontChange(key)}
              className={`flex-[1_1_0] min-w-[88px] py-2 px-2.5 rounded-[10px] cursor-pointer flex flex-col items-center gap-0.5 ${
                active
                  ? 'border-[1.5px] border-[var(--accent)] bg-[var(--beige)]'
                  : 'border border-[rgba(31,27,22,0.18)] bg-white'
              }`}
            >
              {/* The font itself is the data being shown, so it is set from FONTS. */}
              <span
                className={`text-[1.1rem] text-[var(--ink)] leading-none ${def.italic ? 'italic' : 'not-italic'}`}
                style={{ fontFamily: def.family }}
              >
                Aa
              </span>
              <span className={`text-[0.68rem] ${active ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>{def.label}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setPreviewOpen((open) => !open)}
        aria-expanded={previewOpen}
        aria-controls={`${id}-preview`}
        className="pm-desc-btn mt-2.5 underline underline-offset-[3px]"
      >
        {previewOpen ? 'Hide preview' : 'See how it looks'}
      </button>
      {previewOpen && (
        <div id={`${id}-preview`} className="flex flex-col items-center gap-1.5 mt-2">
          <EngravingTag text={value} font={font} flat shape={shape} />
          <p className="m-0 text-[0.75rem] text-[var(--muted)]">Preview</p>
        </div>
      )}
    </>
  )
}
