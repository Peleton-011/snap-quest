Full roadmap towards a working app:

---

## Phase 1 — Strip Server, Go Local-First

1. **Remove server dependencies** — Delete MongoDB, Express, Formidable, dotenv from `package.json`
2. **Delete API routes** — Remove `app/api/` entirely (promptSets, uploads)
3. **Remove unused deps** — Vite, `@vitejs/plugin-react` (not used with Next.js)
4. **Create local prompt set JSON files** — Bundle a few default prompt sets as static JSON in something like `app/data/defaultPromptSets.ts`
5. **Wire up Dexie as the single data layer** — Expand `db.ts` schema to store prompt sets, prompts, user-created prompt sets, and captured photos (as base64 or array buffers, not blob URLs)
6. **Seed Dexie on first launch** — On app init, check if default prompt sets exist in Dexie; if not, populate from the bundled JSON
7. **Build "Create Prompt Set" UI** — Let users add/edit/delete their own prompt sets, saved to Dexie
8. **Rewire existing UI** — `page.tsx`, `api.ts` currently fetch from `/api/*`. Point everything at Dexie instead
9. **Replace blob URLs with stored base64** — `CameraModal.tsx` and `MosaicGrid.tsx` use `URL.createObjectURL()`. Store image data in Dexie, render from base64 data URIs
10. **Verify PDF/ZIP export still works** — These run client-side already, just make sure they pull from Dexie instead of blob URLs

## Phase 2 — Capacitor + Android

11. **Switch Next.js to static export** — Set `output: 'export'` in `next.config.ts`, fix any SSR-only code
12. **Install Capacitor** — `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
13. **Configure Capacitor** — Create `capacitor.config.ts`, point `webDir` to Next.js static export output
14. **Replace file input with Capacitor Camera plugin** — `@capacitor/camera` for native camera/gallery access in `CameraModal.tsx`
15. **Replace file-saver downloads with Capacitor Filesystem + Share** — `@capacitor/filesystem` to write PDF/ZIP to device, `@capacitor/share` to let users share/save them
16. **Build and test on Android emulator** — `npx cap add android`, `npx cap sync`, open in Android Studio, verify everything works

## Phase 3 — Local Network Multiplayer (Option A)

17. **Add a local HTTP/WebSocket server plugin** — Use a Capacitor native plugin (or write a thin one wrapping NanoHTTPD on Android) so the host device can run a lightweight WebSocket server on the local network
18. **Get device local IP** — Use `@capacitor-community/network-info` or similar to find the device's WiFi IP address
19. **Build "Host Session" flow** — Host taps "Host", app starts local WebSocket server, generates a QR code containing `ws://<local-ip>:<port>/<session-id>`
20. **Build "Join Session" flow** — Joiner taps "Join", scans QR code with `@capacitor/barcode-scanner`, connects to host's WebSocket
21. **Design the session protocol** — Define message types: `join`, `image-transfer` (chunked, since images are large), `session-state` (which prompts have photos from whom), `disconnect`
22. **Implement image chunking over WebSocket** — Slice images into ~64KB chunks, send with sequence numbers, reassemble on the receiving end, add ack/retry logic
23. **Build session state UI** — Show connected users, which prompts each user has submitted photos for, live status
24. **Generate combined PDF** — Pull all users' images from the session, lay them out grouped by prompt (e.g., a row per prompt with each user's photo side by side)
25. **Handle edge cases** — User disconnects mid-transfer, host leaves (migrate host or end session), duplicate submissions, network switching
