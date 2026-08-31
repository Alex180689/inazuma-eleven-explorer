import React, { useState, useEffect } from 'react';
import { ELEMENTS } from '../constants/elements';
import { getPlayerSpriteUrl } from '../utils/spriteUtils';
import { getPlayerColor } from '../utils/statsUtils';

export default function PlayerAvatar({
  player,
  size = 'md', // 'sm' | 'md' | 'lg'
  showPosition = true,
  className = '',
  playerTheme: customPlayerTheme,
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(() => (player ? getPlayerSpriteUrl(player.name) : null));

  useEffect(() => {
    if (player) {
      setCurrentUrl(getPlayerSpriteUrl(player.name));
      setHasImageError(false);
    }
  }, [player?.name]);

  if (!player) return null;

  const handleImageError = () => {
    setHasImageError(true);
  };

  const elem = ELEMENTS[player.element] || ELEMENTS.Neutral;
  const playerTheme = customPlayerTheme || getPlayerColor(player.name);
  const spriteUrl = getPlayerSpriteUrl(player.name);

  // Compute initials as fallback
  const initials = player.name
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeConfigs = {
    sm: {
      container: 'w-11 h-11 rounded-xl',
      text: 'text-base',
      badge: 'w-4 h-4 text-[8px] -bottom-1 -right-1',
      imgPadding: 'p-0',
    },
    md: {
      container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
      text: 'text-2xl sm:text-3xl',
      badge: 'w-6 h-6 text-[9px] sm:text-[10px] -bottom-1.5 -right-1.5',
      imgPadding: 'p-0',
    },
    lg: {
      container: 'w-24 h-24 rounded-3xl',
      text: 'text-4xl',
      badge: 'w-7 h-7 text-xs -bottom-2 -right-2',
      imgPadding: 'p-0',
    },
  };

  const cfg = sizeConfigs[size] || sizeConfigs.md;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${cfg.container} flex items-center justify-center font-display font-black text-white shadow-xl relative overflow-hidden border-2 transition-all duration-300`}
        style={{
          borderColor: playerTheme.color,
          background: `linear-gradient(135deg, ${playerTheme.bgTint} 0%, #0f172a 100%)`,
          boxShadow: playerTheme.boxGlow,
        }}
      >
        {/* Render Sprite Image if available and no error */}
        {currentUrl && !hasImageError ? (
          <img
            src={currentUrl}
            alt={player.name}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className={`w-full h-full object-contain ${cfg.imgPadding} transition-transform duration-200 hover:scale-110 [image-rendering:pixelated]`}
          />
        ) : (
          <span className={cfg.text}>{initials}</span>
        )}
      </div>
    </div>
  );
}
