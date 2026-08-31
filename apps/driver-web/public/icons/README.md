# App icons

`icon.svg` is the working placeholder used by the web manifest and Apple touch icon.

For production installability on iOS/Android, export PNGs and add them back to
`public/manifest.webmanifest`:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `apple-touch-icon.png` (180×180) referenced from `app/layout.tsx` metadata

Any SVG→PNG tool works (e.g. `npx sharp-cli` or an online converter).
