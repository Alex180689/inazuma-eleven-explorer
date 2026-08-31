import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, CheckCircle, VideoOff, Zap, Upload, Image as ImageIcon } from 'lucide-react';
import { decodeQrStringToTeam } from '../../utils/teamQr';

// Synthesize an energetic success audio chime using Web Audio API
function playScanSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    // Ignore audio restrictions
  }
}

export default function TeamQrScannerModal({
  isOpen,
  onClose,
  onTeamScanned,
  allPlayers = [],
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Stop video stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Enumerate camera devices
  const loadDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer back / environment camera if available
        const backCam = videoDevices.find((d) =>
          /back|rear|environment|posteriore/i.test(d.label)
        );
        setSelectedDeviceId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
      }
    } catch (err) {
      console.warn('Errore lettura dispositivi video', err);
    }
  }, [selectedDeviceId]);

  // Start webcam stream
  const startCamera = useCallback(async (deviceId) => {
    stopStream();
    setErrorMsg(null);
    setScannedSuccess(false);

    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'environment' },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
      }

      loadDevices();
    } catch (err) {
      console.error('Errore accesso webcam:', err);
      let msg = 'Impossibile accedere alla telecamera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Permesso telecamera negato. Abilita la fotocamera nelle impostazioni del browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Nessuna telecamera o webcam trovata sul dispositivo.';
      } else if (err.name === 'NotReadableError') {
        msg = 'La telecamera è già in uso da un altro programma.';
      }
      setErrorMsg(msg);
      setIsScanning(false);
    }
  }, [stopStream, loadDevices]);

  // Initialize camera when modal opens or deviceId changes
  useEffect(() => {
    if (isOpen) {
      startCamera(selectedDeviceId);
    } else {
      stopStream();
      setErrorMsg(null);
      setScannedSuccess(false);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, selectedDeviceId, startCamera, stopStream]);

  // Process file upload directly
  const handleImageFileUpload = (file) => {
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, img.width, img.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const res = decodeQrStringToTeam(code.data, allPlayers);
          if (res.success && res.team) {
            setIsScanning(false);
            setScannedSuccess(true);
            playScanSuccessChime();

            setTimeout(() => {
              stopStream();
              onTeamScanned(res.team);
              onClose();
            }, 500);
          } else {
            setErrorMsg(res.error || 'Dati QR non validi.');
          }
        } else {
          setErrorMsg('Nessun QR code rilevato nell\'immagine selezionata.');
        }
      };
      img.src = e.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFileUpload(file);
    }
  };

  // Periodic Snapshot Scanner: takes a snapshot every ~400ms, decodes target box crop
  useEffect(() => {
    if (!isScanning || !isOpen) return;

    let isBusy = false;

    const processSnapshot = () => {
      if (!isScanning || isBusy) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      isBusy = true;

      try {
        const vW = video.videoWidth;
        const vH = video.videoHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let detectedTeam = null;

        // Pass 1: FOCUSED CENTER CROP (matching the central square target box)
        // Scaled to 480x480 for instant, pin-sharp jsQR detection
        const boxSize = Math.round(Math.min(vW, vH) * 0.65);
        const cropX = Math.round((vW - boxSize) / 2);
        const cropY = Math.round((vH - boxSize) / 2);

        canvas.width = 480;
        canvas.height = 480;
        ctx.drawImage(video, cropX, cropY, boxSize, boxSize, 0, 0, 480, 480);
        let imgData = ctx.getImageData(0, 0, 480, 480);

        let code = jsQR(imgData.data, 480, 480, { inversionAttempts: 'attemptBoth' });

        if (code && code.data) {
          const res = decodeQrStringToTeam(code.data, allPlayers);
          if (res.success && res.team) {
            detectedTeam = res.team;
          }
        }

        // Pass 2: Fallback down-scaled full frame (if QR was held outside center)
        if (!detectedTeam) {
          const overviewW = 640;
          const overviewH = Math.round((vH / vW) * 640);
          canvas.width = overviewW;
          canvas.height = overviewH;
          ctx.drawImage(video, 0, 0, overviewW, overviewH);
          imgData = ctx.getImageData(0, 0, overviewW, overviewH);

          code = jsQR(imgData.data, overviewW, overviewH, { inversionAttempts: 'attemptBoth' });
          if (code && code.data) {
            const res = decodeQrStringToTeam(code.data, allPlayers);
            if (res.success && res.team) {
              detectedTeam = res.team;
            }
          }
        }

        // Valid Team Recognized!
        if (detectedTeam) {
          setIsScanning(false);
          setScannedSuccess(true);
          playScanSuccessChime();

          // Show checkmark for 500ms as requested, then apply team and close
          setTimeout(() => {
            stopStream();
            onTeamScanned(detectedTeam);
            onClose();
          }, 500);
          return;
        }

        // If not recognized: continues silently observing on next tick
      } catch (err) {
        console.warn('Frame scan warning:', err);
      } finally {
        isBusy = false;
      }
    };

    // Run snapshot every 400ms (half-second cadence)
    const intervalId = setInterval(processSnapshot, 400);

    return () => {
      clearInterval(intervalId);
    };
  }, [isScanning, isOpen, allPlayers, onTeamScanned, onClose, stopStream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative text-white flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20"
          title="Chiudi"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="w-full flex items-center gap-3 mb-4 pr-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Camera size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-cyan-300 font-display">
              Scansiona QR Squadra
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Inquadra al centro o carica direttamente l'immagine
            </p>
          </div>
        </div>

        {/* Camera Device Selector (if multiple cameras available) */}
        {devices.length > 1 && (
          <div className="w-full mb-3">
            <label className="text-[11px] font-mono font-semibold text-slate-300 block mb-1">
              Sorgente Telecamera:
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {devices.map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Telecamera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Viewfinder / Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black border-2 transition-all flex items-center justify-center shadow-inner ${
            isDraggingFile
              ? 'border-cyan-400 bg-cyan-950/40 ring-4 ring-cyan-500/30'
              : 'border-slate-800'
          }`}
        >
          {/* Live Video */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />

          {/* Offscreen Canvas for Snapshot Extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Drag & Drop Overlay */}
          {isDraggingFile && (
            <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-300 font-bold gap-2 z-30 pointer-events-none">
              <Upload size={48} className="animate-bounce text-cyan-400" />
              <span className="text-sm font-mono tracking-wider">RILASCIA L'IMMAGINE QR QUI</span>
            </div>
          )}

          {/* Holographic Inazuma Target Overlay */}
          {isScanning && !scannedSuccess && !isDraggingFile && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Darkened outer vignette */}
              <div className="absolute inset-0 border-[32px] sm:border-[40px] border-black/45" />

              {/* Central Target Box */}
              <div className="w-52 h-52 sm:w-60 sm:h-60 relative rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden">
                {/* Target Corners */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-cyan-300 -translate-x-0.5 -translate-y-0.5" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-cyan-300 translate-x-0.5 -translate-y-0.5" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-cyan-300 -translate-x-0.5 translate-y-0.5" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-cyan-300 translate-x-0.5 translate-y-0.5" />

                {/* Animated Electric Scanline */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#38bdf8] animate-scanline" />

                {/* Center crosshair */}
                <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
              </div>
            </div>
          )}

          {/* Success Checkmark Overlay - 500ms presentation */}
          {scannedSuccess && (
            <div className="absolute inset-0 bg-emerald-500/40 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-200 font-bold gap-3 z-30 animate-fadeIn">
              <CheckCircle size={64} className="text-emerald-400 drop-shadow-[0_0_20px_#10b981]" />
              <span className="text-base font-mono tracking-widest uppercase text-white font-black drop-shadow">
                SQUADRA RICONOSCIUTA!
              </span>
            </div>
          )}

          {/* Error State */}
          {errorMsg && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-5 text-center gap-2.5 z-20">
              <VideoOff size={36} className="text-red-400" />
              <p className="text-xs text-red-300 font-medium max-w-xs">{errorMsg}</p>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  startCamera(selectedDeviceId);
                }}
                className="mt-1 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <RefreshCw size={13} />
                <span>Riprova Telecamera</span>
              </button>
            </div>
          )}
        </div>

        {/* Upload Image Alternative Button */}
        <div className="w-full mt-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <ImageIcon size={15} className="text-cyan-400" />
            <span>Carica Immagine QR da File (o trascinala qui)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFileUpload(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* Footer Hint */}
        <div className="mt-2.5 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Zap size={12} className="text-amber-400 shrink-0" />
            <span>Scansione a intervalli regolari (400ms) con zoom sul mirino centrale</span>
          </p>
        </div>
      </div>
    </div>
  );
}
