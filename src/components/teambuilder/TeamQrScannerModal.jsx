import React, { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';
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
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Stop scanner and release camera
  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      } catch {}
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Handle successful QR detection
  const handleDecodedString = useCallback(
    (rawString) => {
      if (!rawString || typeof rawString !== 'string') return;
      const result = decodeQrStringToTeam(rawString, allPlayers);
      if (result.success && result.team) {
        if (scannerRef.current) {
          try {
            scannerRef.current.stop();
          } catch {}
        }
        setIsScanning(false);
        setScannedSuccess(true);
        playScanSuccessChime();

        setTimeout(() => {
          stopScanner();
          onTeamScanned(result.team);
          onClose();
        }, 500);
      }
    },
    [allPlayers, onTeamScanned, onClose, stopScanner]
  );

  // Start the PosteID-grade high-speed QrScanner
  const initAndStartScanner = useCallback(
    async (deviceId) => {
      stopScanner();
      setErrorMsg(null);
      setScannedSuccess(false);

      if (!videoRef.current) return;

      try {
        // Enumerate camera devices
        const cameraList = await QrScanner.listCameras(true);
        setDevices(cameraList);

        const activeCamera = deviceId || (cameraList.length > 0 ? cameraList[0].id : 'environment');
        if (!selectedDeviceId && cameraList.length > 0) {
          setSelectedDeviceId(activeCamera);
        }

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            const raw = typeof result === 'string' ? result : result?.data;
            handleDecodedString(raw);
          },
          {
            onDecodeError: () => {
              // Frame without QR code: ignore silently and keep scanning at 25fps
            },
            preferredCamera: activeCamera,
            maxScansPerSecond: 25, // Blazing-fast 25 scans per second WebWorker
            highlightScanRegion: false,
            highlightCodeOutline: false,
            calculateScanRegion: (video) => {
              // Focus scanning on the central square target box
              const smallest = Math.min(video.videoWidth, video.videoHeight);
              const size = Math.round(smallest * 0.7);
              return {
                x: Math.round((video.videoWidth - size) / 2),
                y: Math.round((video.videoHeight - size) / 2),
                width: size,
                height: size,
                downScaledWidth: 480,
                downScaledHeight: 480,
              };
            },
          }
        );

        scannerRef.current = scanner;
        await scanner.start();
        setIsScanning(true);
      } catch (err) {
        console.error('Errore avvio scanner:', err);
        let msg = 'Impossibile accedere alla fotocamera.';
        if (err?.name === 'NotAllowedError') {
          msg = 'Permesso telecamera negato. Abilita la fotocamera nelle impostazioni del browser.';
        } else if (err?.name === 'NotFoundError') {
          msg = 'Nessuna webcam o fotocamera trovata.';
        }
        setErrorMsg(msg);
        setIsScanning(false);
      }
    },
    [handleDecodedString, stopScanner, selectedDeviceId]
  );

  // Mount/Unmount effect
  useEffect(() => {
    if (isOpen) {
      initAndStartScanner(selectedDeviceId);
    } else {
      stopScanner();
      setErrorMsg(null);
      setScannedSuccess(false);
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, selectedDeviceId, initAndStartScanner, stopScanner]);

  // Handle direct file upload
  const handleImageFileUpload = async (file) => {
    if (!file) return;
    setErrorMsg(null);

    try {
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      const raw = typeof result === 'string' ? result : result?.data;
      if (raw) {
        const decoded = decodeQrStringToTeam(raw, allPlayers);
        if (decoded.success && decoded.team) {
          setIsScanning(false);
          setScannedSuccess(true);
          playScanSuccessChime();

          setTimeout(() => {
            stopScanner();
            onTeamScanned(decoded.team);
            onClose();
          }, 500);
        } else {
          setErrorMsg(decoded.error || 'Dati QR non validi per questa versione di gioco.');
        }
      }
    } catch {
      setErrorMsg('Nessun QR code leggibile rilevato nell\'immagine selezionata.');
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative text-white flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20 cursor-pointer"
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

        {/* Camera Device Selector */}
        {devices.length > 1 && (
          <div className="w-full mb-3">
            <label className="text-[11px] font-mono font-semibold text-slate-300 block mb-1">
              Sorgente Telecamera:
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedDeviceId(newId);
                if (scannerRef.current) {
                  scannerRef.current.setCamera(newId);
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {devices.map((device, idx) => (
                <option key={device.id || idx} value={device.id}>
                  {device.label || `Telecamera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Viewfinder / Video Container */}
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
          {/* Live Video managed by QrScanner */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

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
              {/* Darkened outer border */}
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

          {/* Success Checkmark Overlay (500ms) */}
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
                  initAndStartScanner(selectedDeviceId);
                }}
                className="mt-1 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
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
            <span>Motore ZXing WebAssembly a 25 fps con scansione hardware su WebWorker</span>
          </p>
        </div>
      </div>
    </div>
  );
}
