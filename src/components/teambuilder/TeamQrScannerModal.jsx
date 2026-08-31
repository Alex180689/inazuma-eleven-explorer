import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle, VideoOff, Zap } from 'lucide-react';
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
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  // Stop video stream
  const stopStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
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
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment' },
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

      // Re-enumerate to get labeled device names after permission granted
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

  // QR Scanning Loop: Native BarcodeDetector (GPU) with high-speed jsQR fallback
  useEffect(() => {
    if (!isScanning || !isOpen) return;

    let isNativeBarcodeDetectorSupported = false;
    let barcodeDetector = null;

    try {
      if ('BarcodeDetector' in window) {
        barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        isNativeBarcodeDetectorSupported = true;
      }
    } catch {
      isNativeBarcodeDetectorSupported = false;
    }

    let isProcessing = false;

    const scanFrame = async () => {
      if (!isScanning) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
        animFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      let detectedText = null;

      // 1. Try Native BarcodeDetector if available (instant hardware acceleration)
      if (isNativeBarcodeDetectorSupported && barcodeDetector && !isProcessing) {
        try {
          isProcessing = true;
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            detectedText = barcodes[0].rawValue;
          }
        } catch {
          // Fallback to jsQR
        } finally {
          isProcessing = false;
        }
      }

      // 2. Fallback to jsQR on canvas frame buffer
      if (!detectedText) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, width, height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            detectedText = code.data;
          }
        }
      }

      // If valid QR code detected
      if (detectedText) {
        const result = decodeQrStringToTeam(detectedText, allPlayers);
        if (result.success && result.team) {
          setIsScanning(false);
          setScannedSuccess(true);
          playScanSuccessChime();

          // Brief visual success animation before applying
          setTimeout(() => {
            stopStream();
            onTeamScanned(result.team);
            onClose();
          }, 380);
          return;
        } else {
          // Unsupported QR format, keep scanning
        }
      }

      animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
              Inquadra il QR code per importare all'istante la formazione
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

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black border-2 border-slate-800 flex items-center justify-center shadow-inner">
          {/* Live Video */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Offscreen Canvas for Frame Extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Holographic Inazuma Target Overlay */}
          {isScanning && !scannedSuccess && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Darkened outer vignette */}
              <div className="absolute inset-0 border-[36px] sm:border-[44px] border-black/45" />

              {/* Central Target Box */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden">
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

          {/* Success Flash Overlay */}
          {scannedSuccess && (
            <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300 font-bold gap-2 animate-pulse">
              <CheckCircle size={54} className="text-emerald-400 drop-shadow-lg" />
              <span className="text-sm font-mono tracking-wider">SQUADRA RILEVATA!</span>
            </div>
          )}

          {/* Error State */}
          {errorMsg && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-5 text-center gap-3">
              <VideoOff size={42} className="text-red-400" />
              <p className="text-xs text-red-300 font-medium max-w-xs">{errorMsg}</p>
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="mt-1 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <RefreshCw size={13} />
                <span>Riprova</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-3.5 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Zap size={12} className="text-amber-400 shrink-0" />
            <span>Riconoscimento ultrarapido in tempo reale (Hardware Accelerated)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
