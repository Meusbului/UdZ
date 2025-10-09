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

  let ctx = null;
  if(canvas && canvas.getContext){
    try{ ctx = canvas.getContext('2d'); }catch(e){ ctx = null; }
  }

  let stream = null;
  let scanning = false;
  let jsQRLoaded = false;

  // Load jsQR safely; multiple calls are OK
  async function loadJsQR(){
    if(jsQRLoaded) return;
    return new Promise((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      s.onload = ()=>{ jsQRLoaded = true; resolve(); };
      s.onerror = ()=>{ console.warn('Failed to load jsQR'); resolve(); };
      document.head.appendChild(s);
    });
  }

  async function startCamera(){
    if(!video){
      // video element missing — cannot start camera
      console.warn('No video element present; camera not started');
      return;
    }
    try{
      await loadJsQR();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      video.srcObject = stream;
      try{ await video.play(); }catch(e){}
      // hide any placeholder overlay if present
      const placeholder = document.getElementById('scannerPlaceholder');
      if(placeholder) placeholder.style.display = 'none';
      video.style.display = 'block';
      scanning = true;
      scanBtn.textContent = 'Stop';
      requestAnimationFrame(tick);
    }catch(e){
      console.error('camera start failed', e);
      alert('Unable to access camera: ' + (e && e.message ? e.message : e));
    }
  }

  function stopCamera(){
    scanning = false;
    if(scanBtn) scanBtn.textContent = 'Scan';
    if(video) video.style.display = 'none';
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      stream = null;
    }
  }

  function tick(){
    if(!scanning) return;
    if(!video) return;
    if(video.readyState === video.HAVE_ENOUGH_DATA){
      if(canvas && ctx){
        canvas.width = video.videoWidth || canvas.width;
        canvas.height = video.videoHeight || canvas.height;
        try{
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          if(window.jsQR){
            const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
            const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
            if(code){
              stopCamera();
              alert('QR code: ' + code.data);
              return;
            }
          }
        }catch(e){
          console.warn('Frame decode error', e);
        }
      }
    }
    requestAnimationFrame(tick);
  }

  if(scanBtn){
    scanBtn.addEventListener('click', ()=>{
      if(scanning) stopCamera(); else startCamera();
    });
  }

  if(flashBtn){
    flashBtn.addEventListener('click', async ()=>{
      const pressed = flashBtn.getAttribute('aria-pressed') === 'true';
      flashBtn.setAttribute('aria-pressed', String(!pressed));
      flashBtn.style.boxShadow = !pressed ? '0 0 0 3px rgba(0,0,0,0.08) inset' : '';
      // Try toggling torch if supported
      try{
        if(stream){
          const [track] = stream.getVideoTracks();
          const capabilities = track.getCapabilities && track.getCapabilities();
          if(capabilities && capabilities.torch){
            await track.applyConstraints({ advanced: [{ torch: !pressed }] });
          }
        }
      }catch(e){
        // ignore if not supported
      }
    });
  }
});
