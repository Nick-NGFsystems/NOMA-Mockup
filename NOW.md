# Now — NOMA Designs

_Last updated 2026-09-26. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox**. Reviews stay hidden until NOMA adds real ones. **Products from the portal** is built on branch `claude/ngf-products`, not merged: once merged and switched on, NOMA adds, edits, hides and prices products on the portal's Products page, and the site shows and charges exactly that list.

**Next:** Merge the NGF app's Products PR first, then this repo's PR, then switch Products on for NOMA and import `docs/ngf-products-import.json` (runbook: NGF app `docs/products.md`). Then one sandbox checkout.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet. Prices, bundle contents and the Ayana/Alaina name can now be set by NOMA on the Products page instead of answered in the document.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist, set `NEXT_PUBLIC_SITE_URL`, and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** Products from the portal (draft).
