import React from 'react';
import { ELEMENTS } from '../constants/elements';
import { Flame, Wind, Mountain, Trees, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Fire: Flame,
  Wind: Wind,
  Earth: Mountain,
  Wood: Trees,
  Neutral: Sparkles,
};

export default function ElementBadge({ element, size = 'md', showLabel = true, className = '' }) {
  const elem = ELEMENTS[element] || ELEMENTS.Neutral;
  const IconComponent = ICON_MAP[element] || Sparkles;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm sm:text-base gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-300 font-medium ${elem.badgeClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={elem.description}
    >
      <IconComponent size={iconSizes[size] || 14} className="shrink-0 animate-pulse-slow" />
      {showLabel && <span>{elem.nameIt}</span>}
    </span>
  );
}
