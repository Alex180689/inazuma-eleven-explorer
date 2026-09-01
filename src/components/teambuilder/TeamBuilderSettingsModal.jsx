import { X, Settings, RotateCcw, Sliders, Eye, Palette, Activity, Film } from 'lucide-react';

export const DEFAULT_TEAMBUILDER_SETTINGS = {
  pitchWidth: 540, // px (420 to 720)
  pitchHeight: 640, // px (460 to 800)
  slotSize: 64, // px (50 to 76)
  badgeSize: 20, // px (16 to 28)
  cardBackground: 'dark', // 'dark' | 'element' | 'gold' | 'neon' | 'glass' | 'none'
  lineOpacity: 45, // % (15 to 80)
  hoverCardOpacity: 92, // % (40 to 100)
  showGrassStripes: true,
  showOvrBadge: true,
  showRoleBadge: true,
  showElementBadge: true,
  radarWidth: 560, // px (380 to 780)
  showStabEffect: true, // Show STAB bonus visual highlight
  videoWindowWidth: 340, // px (260 to 540) - Dimensione finestra video clip
};

export const BACKGROUND_OPTIONS = [
  {
    id: 'dark',
    name: 'Scuro Classico',
    description: 'Sfumatura scura classica',
    previewClass: 'bg-gradient-to-b from-slate-800 to-slate-950 border-slate-700 text-slate-400',
    previewLabel: 'Scuro',
  },
  {
    id: 'element',
    name: 'Colore Elemento',
    description: 'Gradiente dell\'elemento del calciatore',
    previewClass: 'bg-gradient-to-r from-red-900/80 via-emerald-900/80 to-blue-900/80 border-emerald-500/50 text-emerald-300',
    previewLabel: 'Elemento',
  },
  {
    id: 'gold',
    name: 'Oro Campioni',
    description: 'Sfumatura dorata brillante',
    previewClass: 'bg-gradient-to-b from-amber-700/90 via-amber-950 to-black border-amber-400 text-amber-300',
    previewLabel: 'Oro',
  },
  {
    id: 'neon',
    name: 'Neon Elettrico',
    description: 'Bagliore indaco e ciano',
    previewClass: 'bg-gradient-to-b from-indigo-900/90 via-purple-950 to-black border-cyan-400 text-cyan-300',
    previewLabel: 'Neon',
  },
  {
    id: 'glass',
    name: 'Vetro Trasparente',
    description: 'Effetto vetro smerigliato',
    previewClass: 'bg-white/10 backdrop-blur-md border-white/30 text-white',
    previewLabel: 'Glass',
  },
  {
    id: 'none',
    name: 'Nessun Riquadro',
    description: 'Sprite PNG diretto sul campo da gioco',
    previewClass: 'bg-emerald-950/40 border-dashed border-emerald-400 text-emerald-300',
    previewLabel: 'PNG Diretto',
  },
];

export function getTeamBuilderSettings() {
  try {
    const raw = localStorage.getItem('ie1_teambuilder_settings');
    if (!raw) return DEFAULT_TEAMBUILDER_SETTINGS;
    return { ...DEFAULT_TEAMBUILDER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TEAMBUILDER_SETTINGS;
  }
}

export function saveTeamBuilderSettings(settings) {
  try {
    localStorage.setItem('ie1_teambuilder_settings', JSON.stringify(settings));
  } catch {}
}

export default function TeamBuilderSettingsModal({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  onResetSettings,
}) {
  if (!isOpen) return null;

  const update = (key, value) => {
    const next = { ...settings, [key]: value };
    onChangeSettings(next);
    saveTeamBuilderSettings(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Impostazioni Team Builder
              </h3>
              <p className="text-xs text-slate-400">
                Personalizza dimensioni del campo, sfondi card e simboli
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Controls */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section: Sfondo Icone Giocatori */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <Palette size={14} />
              <span>Stile Sfondo Icone Giocatori</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BACKGROUND_OPTIONS.map((opt) => {
                const isSelected = (settings.cardBackground || 'dark') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update('cardBackground', opt.id)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-800 shadow-lg scale-[1.02]'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-[11px] font-bold text-white leading-tight">
                        {opt.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] shrink-0 ml-1" />
                      )}
                    </div>
                    {/* Thumbnail preview */}
                    <div
                      className={`w-full h-7 rounded-xl flex items-center justify-center text-[10px] font-mono border ${opt.previewClass}`}
                    >
                      {opt.previewLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Dimensioni Campo */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              <Sliders size={14} />
              <span>Dimensioni & Stretch Campo</span>
            </div>

            {/* Slider 1: Stretch Verticale (Altezza Campo) */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Stretch Verticale (Altezza Campo)</span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {settings.pitchHeight} px
                </span>
              </div>
              <input
                type="range"
                min="460"
                max="800"
                step="10"
                value={settings.pitchHeight}
                onChange={(e) => update('pitchHeight', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Compatto (460px)</span>
                <span>Predefinito (640px)</span>
                <span>Esteso (800px)</span>
              </div>
            </div>

            {/* Slider 2: Stretch Orizzontale (Larghezza Campo) */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Stretch Orizzontale (Larghezza Campo)</span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {settings.pitchWidth} px
                </span>
              </div>
              <input
                type="range"
                min="420"
                max="720"
                step="10"
                value={settings.pitchWidth}
                onChange={(e) => update('pitchWidth', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Stretto (420px)</span>
                <span>Predefinito (540px)</span>
                <span>Largo (720px)</span>
              </div>
            </div>

            {/* Slider 3: Dimensione Slot Giocatori */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Dimensione Slot Giocatori</span>
                <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {settings.slotSize} px
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="76"
                step="2"
                value={settings.slotSize}
                onChange={(e) => update('slotSize', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Piccolo (50px)</span>
                <span>Medio (64px)</span>
                <span>Grande (76px)</span>
              </div>
            </div>

            {/* Slider 4: Dimensione Simboli (Badge OVR, Ruolo, Elemento) */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Dimensione Simboli (OVR, Ruolo, Elemento)</span>
                <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                  {settings.badgeSize || 20} px
                </span>
              </div>
              <input
                type="range"
                min="16"
                max="28"
                step="1"
                value={settings.badgeSize || 20}
                onChange={(e) => update('badgeSize', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Piccolo (16px)</span>
                <span>Predefinito (20px)</span>
                <span>Grande (28px)</span>
              </div>
            </div>

            {/* Slider 5: Opacità Linee Campo */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Opacità Linee del Campo</span>
                <span className="font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  {settings.lineOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                value={settings.lineOpacity}
                onChange={(e) => update('lineOpacity', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Slider 6: Opacità Scheda Info in Hover */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Opacità Finestra Info (Hover)</span>
                <span className="font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                  {settings.hoverCardOpacity ?? 92}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={settings.hoverCardOpacity ?? 92}
                onChange={(e) => update('hoverCardOpacity', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Trasparente (40%)</span>
                <span>Predefinito (92%)</span>
                <span>Opaco (100%)</span>
              </div>
            </div>
          </div>

          {/* Section: Dimensioni Sezione Radar Centrale */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <Activity size={14} />
              <span>Larghezza Sezione Radar Centrale</span>
            </div>

            {/* Slider Larghezza Radar */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Larghezza Radar</span>
                <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {settings.radarWidth ?? 560} px
                </span>
              </div>
              <input
                type="range"
                min="380"
                max="780"
                step="10"
                value={settings.radarWidth ?? 560}
                onChange={(e) => update('radarWidth', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Compatto (380px)</span>
                <span>Predefinito (560px)</span>
                <span>Espanso (780px)</span>
              </div>
            </div>
          </div>

          {/* Section: Dimensione Finestra Video / Clip Tecnica */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <Film size={14} />
              <span>Dimensione Finestra Video (Clip in Hover)</span>
            </div>

            {/* Slider Dimensione Finestra Video */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Larghezza Finestra Video</span>
                <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {settings.videoWindowWidth ?? 340} px
                </span>
              </div>
              <input
                type="range"
                min="260"
                max="540"
                step="10"
                value={settings.videoWindowWidth ?? 340}
                onChange={(e) => update('videoWindowWidth', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Compatta (260px)</span>
                <span>Predefinita (340px)</span>
                <span>Grande (540px)</span>
              </div>
            </div>
          </div>

          {/* Section: Visibilità Dettagli */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
              <Eye size={14} />
              <span>Visibilità Elementi & Badge</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Toggle OVR */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showOvrBadge}
                  onChange={(e) => update('showOvrBadge', e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-slate-300 font-medium">Numero OVR</span>
              </label>

              {/* Toggle Ruolo Naturale */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showRoleBadge}
                  onChange={(e) => update('showRoleBadge', e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-slate-300 font-medium">Ruolo Naturale</span>
              </label>

              {/* Toggle Icona Elemento */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showElementBadge}
                  onChange={(e) => update('showElementBadge', e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-slate-300 font-medium">Icona Elemento</span>
              </label>

              {/* Toggle Strisce Erba */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showGrassStripes}
                  onChange={(e) => update('showGrassStripes', e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-slate-300 font-medium">Strisce Erba Campo</span>
              </label>

              {/* Toggle STAB Bonus */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors col-span-2">
                <input
                  type="checkbox"
                  checked={settings.showStabEffect ?? true}
                  onChange={(e) => update('showStabEffect', e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-slate-200 font-medium block">
                      Evidenzia Bonus STAB (+20%)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Bordo dorato e badge per tecniche dello stesso elemento del calciatore
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black font-mono bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-sm uppercase tracking-wider shrink-0 ml-2">
                    STAB
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetSettings}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Ripristina Predefiniti</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
