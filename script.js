/*
  script.js
  - Adds minimal interactivity for the Scan button and flash placeholder.
  - This file is intentionally small. To enable real camera scanning, integrate a library such as
    - @zxing/library (ZXing) or jsQR + camera stream handling.

  Where to extend:
  - Replace the scanBtn click handler with camera initialization and a QR decoding pipeline.
  - Use the flash button to toggle torch via MediaStreamTrack.applyConstraints when running on supported mobile browsers.
*/
document.addEventListener('DOMContentLoaded', ()=>{
  const scanBtn = document.getElementById('scanBtn');
  const flashBtn = document.getElementById('flashBtn');
  const video = document.getElementById('cameraPreview');
  const canvas = document.getElementById('cameraCanvas');
  const ctx = canvas.getContext && canvas.getContext('2d');

  let stream = null;
  let scanning = false;
  let jsQRLoaded = false;

  // Simple simulated scan behavior — replace with real scanning logic later
  async function loadJsQR(){
    if(jsQRLoaded) return;
    // load jsQR from CDN
    await new Promise((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      s.onload = ()=>{ jsQRLoaded = true; resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function startCamera(){
    try{
      await loadJsQR();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  video.srcObject = stream;
  video.style.display = 'block';
      scanning = true;
      scanBtn.textContent = 'Stop';
      requestAnimationFrame(tick);
    }catch(e){
      console.error('camera start failed', e);
      alert('Unable to access camera: ' + (e.message || e));
    }
  }

  function stopCamera(){
  scanning = false;
  scanBtn.textContent = 'Scan';
  if(video) video.style.display = 'none';
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      stream = null;
    }
  }

  function tick(){
    if(!scanning) return;
    if(video.readyState === video.HAVE_ENOUGH_DATA){
      // match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try{
        const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if(code){
          // show result and stop scanning
          stopCamera();
          alert('QR code: ' + code.data);
          return;
        }
      }catch(e){
        // ignore read errors
      }
    }
    requestAnimationFrame(tick);
  }

  if(scanBtn){
    scanBtn.addEventListener('click', ()=>{
      if(scanning){ stopCamera(); }
      else{ startCamera(); }
    });
  }

  // Flash placeholder toggle — real flashlight control requires native APIs or supported browser APIs
  if(flashBtn){
    flashBtn.addEventListener('click', ()=>{
      const pressed = flashBtn.getAttribute('aria-pressed') === 'true';
      flashBtn.setAttribute('aria-pressed', String(!pressed));
      flashBtn.style.boxShadow = !pressed ? '0 0 0 3px rgba(0,0,0,0.08) inset' : '';
    });
  }
});

