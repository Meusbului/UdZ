Project: myGW — QR Scanner (UI mock)

Overview
- This small project reproduces the mobile "Home / Scan" screen from your Figma screenshot.
- Icons and the QR code are placeholders by request. The layout, colors and spacing aim to match the screenshot.

Files
- index.html — main page markup. Comments inside explain each section.
- style.css — styling for the layout. Top of the file contains CSS variables you can tweak.
- script.js — tiny interaction stubs for the Scan and Flash controls. Comments explain how to extend.

How to preview
1. Open this folder in VS Code: File → Open Folder... → choose this project folder.
2. Install Live Server extension (optional but recommended).
3. Right-click `index.html` → Open with Live Server, or open the file in your browser directly.
4. To simulate mobile, open DevTools (F12) and toggle the device toolbar (Ctrl+Shift+M).

Where to customize
- Replace placeholders:
  - Top-right orange badge: swap `.badge.placeholder-orange` with an <img> or inline SVG.
  - QR area: replace the `.qr-blank` div with an <img> tag or render a live camera preview there.
  - Flash square: replace `.flash-square` with your icon.

Integrating real QR scanning (next steps)
- Use a JS QR library and camera stream:
  - @zxing/library (ZXing)
  - jsQR (decode from canvas frames)
- Workflow:
  1. Request camera permission and obtain a MediaStream.
  2. Draw frames to a hidden <canvas> and decode with the library.
  3. Show results in the UI and stop the camera if needed.

Notes
- Flashlight control is only available in supported browsers and devices (use MediaStreamTrack.applyConstraints on the video track).
- For pixel-perfect matching to Figma, provide the Figma link or exact color/font values and I will fine-tune spacing.

If you want, I can now:
- Integrate a QR scanning demo using the camera (will request camera access in the browser).
- Replace placeholders with assets you provide.
- Tweak colors/spacing to match Figma exactly.

Tell me which one you want next and I'll implement it.