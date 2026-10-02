# Packaging notes (phase 3)

Marketplace listing is **out of scope** for now.

## Local / private install

1. `npm run build`
2. `npm run pack` (Framer plugin pack via workspace script from the starter)
3. Load the resulting package in Framer as a development / private plugin

## Before Marketplace (later)

- Unique `framer.json` `id` (currently `wfc001`)
- Icon, name, description, privacy policy URL
- Screenshots of Configure + Sync
- Re-validate dual-write vs fallback A (`docs/framer/VALIDATION.md`)
- Do not ship secrets in the plugin bundle; credentials stay in Managed Collection plugin data entered by the site owner

## Related

- Bridge: `framer-bridge/README.md`
- Validation: `docs/framer/VALIDATION.md`
