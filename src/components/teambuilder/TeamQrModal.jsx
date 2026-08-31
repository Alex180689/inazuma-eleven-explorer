import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, X, Shield, Users } from 'lucide-react';
import { encodeTeamToQrString } from '../../utils/teamQr';

export default function TeamQrModal({
  isOpen,
  onClose,
  teamData,
  formationName = '4-4-2',
}) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrString, setQrString] = useState('');

  const fieldCount = Object.keys(teamData?.fieldPlayers || {}).length;
  const benchCount = Object.keys(teamData?.benchPlayers || {}).length;
  const teamName = teamData?.name || 'Squadra Inazuma';

  useEffect(() => {
    if (!isOpen || !teamData) return;

    const encoded = encodeTeamToQrString({
      name: teamName,
      formationId: teamData.formationId,
      fieldPlayers: teamData.fieldPlayers,
      benchPlayers: teamData.benchPlayers,
    });

    setQrString(encoded);

    // Give DOM a tick to mount canvas
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          encoded,
          {
            width: 260,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
              dark: '#020617',
              light: '#ffffff',
            },
          },
          (err) => {
            if (err) console.error('Errore generazione QR code', err);
          }
        );
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, teamData, teamName]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const cleanName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `inazuma_team_qr_${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyText = async () => {
    if (!qrString) return;
    try {
      await navigator.clipboard.writeText(qrString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Chiudi"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 pr-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <QrCode size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-amber-300 font-display truncate">
              {teamName}
            </h3>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>Modulo: {formationName}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{fieldCount + benchCount} giocatori</span>
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center justify-center shadow-inner mb-4">
          <canvas ref={canvasRef} className="max-w-full rounded-lg" />
          <p className="text-[10px] text-slate-600 font-mono font-medium mt-1">
            Scansiona per caricare la formazione all'istante
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download size={15} strokeWidth={2.5} />
            <span>Salva PNG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={15} className="text-emerald-400" />
                <span className="text-emerald-400">Copiato!</span>
              </>
            ) : (
              <>
                <Copy size={15} className="text-amber-400" />
                <span>Copia Codice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
