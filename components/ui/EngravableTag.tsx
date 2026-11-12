/**
 * "Engravable" marker for products that take engraving (the portal's
 * "personalizable" flag). `overlay` pins it to a card photo's corner; without it
 * it is an ordinary inline pill (the product popup).
 */
export function EngravableTag({ overlay = false }: { overlay?: boolean }) {
  return (
    <span className={overlay ? 'engravable-tag engravable-tag--overlay' : 'engravable-tag'}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      Engravable
    </span>
  )
}
