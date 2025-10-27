goGW — mobile QR scanner & live map

This repository is a small static web app that provides:
- A mobile-styled QR scanner UI (camera -> jsQR decoding pipeline).
- A fullscreen dark Leaflet map with live multi-user location dots.
- A realtime presence layer that keeps other users visible while their browser is open (Realtime Database onDisconnect).

The project is intentionally lightweight (vanilla HTML/CSS/JS) so it runs without a build step.

## Features (current)
- `index.html`: app launcher and menu.
- `qr-scanner.html`: dedicated scanner page using the device camera and jsQR. Start/Stop lifecycle, and flashlight toggle (where supported). The flashlight button is only active while scanning.
- `maps.html`: fullscreen Leaflet map with dark tiles, live user marker + accuracy circle, and multi-user dots using Firestore (storage) + Realtime Database presence (live).
- `yard.html`, `documents.html`: additional pages (viewer and placeholders).
- `style.css`: theming, responsive layout and icon styling. Uses provided assets for the small badge and torch icons.
- `script.js`: scanner lifecycle, jsQR load/decoding loop and flash handling.

## Firebase setup (required for multi-user map)

The project uses two Firebase services currently:
- Firestore (compat) — stores location documents (used for history / optional storage).
- Realtime Database (compat) — presence layer for live, reliable online presence using `onDisconnect()`.

Before testing the live map, do the following in the Firebase console:
1. Create a Web app and copy the config object. Paste it into `maps.html` at the `firebaseConfig` variable (already supported in the file).
2. Enable Anonymous sign-in: Console → Authentication → Sign-in method → Anonymous.
3. (Optional but recommended) Enable Firestore and a TTL policy if you want server-side expiry: create a TTL index on the `expiresAt` field.
4. Realtime Database rules (simple example allowing authenticated users to write their own presence node):

```json
{
  "rules": {
    "presence": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

5. Firestore rules (optional example allowing reads for authenticated users and writes only for owner):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /locations/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## How presence works
- Clients publish their live position to Firestore (for storage) and to Realtime Database under `/presence/{uid}` for live presence.
- The Realtime Database code registers `onDisconnect().remove()` on the presence node so the server removes it when the client's socket disconnects — this is reliable when browsers are killed or network drops.
- The client also removes presence on graceful stops/unload.

This combination gives reliable live presence while keeping Firestore for optional history.

## Run locally (development)
The app is static — you can open the files directly, but camera/geolocation require a secure origin (https or localhost). Use a local server while testing.

- Quick (Python):
  - Python 3: `python -m http.server 8000` (then open http://localhost:8000)
  - PowerShell (Windows): `python -m http.server 8000` in the project folder
- Or use VS Code Live Server extension.

Notes for iOS/Safari: open the page in Safari (not in-app webviews) for reliable camera/geolocation behavior.

## Testing the live map presence
1. Add your Firebase config to `maps.html` and push changes or serve locally over `localhost`.
2. Enable Anonymous sign-in in the Firebase console.
3. Open `maps.html` on two different devices/browsers (or a device + desktop). Press "Locate" on both.
4. Each browser should show the other's dot while both pages are open. If a client closes or its process is killed, Realtime Database onDisconnect should remove that presence node and the dot should disappear automatically.

If someone disappears after a few seconds only: check the project's throttling and movement thresholds. The client publishes at most once every ~3.5s and only if the user moved more than ~10 meters (to reduce writes). If you want more frequent updates, reduce throttling in `maps.html` (variable `publishThrottle`).

## Troubleshooting
- No camera on scanner page: make sure the page is served via HTTPS or `localhost` and that you start the camera with a user gesture (press Scan). iOS requires playsinline and user gestures inside Safari.
- Other users not visible:
  - Confirm Anonymous auth is enabled in Firebase.
  - Check Realtime Database `/presence` entries in the Firebase console — they should appear and be removed on disconnect.
  - If presence nodes exist but markers don't show, open browser console for errors. Use the small debug messages logged by the app (setDebug uses console fallback).
- Torch/flash not working: many devices/browsers don't expose torch control. The code attempts MediaTrack.applyConstraints({ advanced:[{torch}] }) when supported.

## Next steps / improvements (ideas)
- Add clustering (Leaflet.markercluster) for many nearby users to improve rendering performance.
- Refactor `maps.html` scripts into separate modules (`maps-core.js`, `maps-firebase.js`, `maps-ui.js`) for maintainability.
- Use the modular Firebase SDK and ESM imports for a modern build when moving to a bundler.
- Add optional server-side cleanup Cloud Function if needed.

## Where to look in the code
- `qr-scanner.html` + `script.js` — camera lifecycle and QR decode loop using jsQR.
- `maps.html` — map init, Firestore listeners, Realtime DB presence helpers, publish/remove logic, throttling and pruning.
- `style.css` — layout, colors and button styling.

If you'd like I can:
- Implement clustering quickly (small change) to improve UX with many users.
- Split the map code into small modules for clarity.
- Tighten/loosen publish throttles or movement thresholds to match your desired realtime fidelity.

Happy to update this README further if you want more details (example rules, full debug steps, or deployment notes).