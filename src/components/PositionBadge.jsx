import React from 'react';
import { POSITIONS } from '../constants/positions';
import { Shield, ShieldAlert, Target, Zap } from 'lucide-react';

const ICON_MAP = {
  GK: Shield,
  DF: ShieldAlert,
  MF: Target,
  FW: Zap,
};

export default function PositionBadge({ position, size = 'md', showFullName = false, className = '' }) {
  const pos = POSITIONS[position] || { nameIt: position, badgeClass: 'bg-slate-700 text-slate-200 border-slate-600' };
  const IconComponent = ICON_MAP[position] || Target;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-black gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono uppercase tracking-wider ${pos.badgeClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={pos.nameIt}
    >
      <IconComponent size={size === 'sm' ? 12 : 14} className="shrink-0" />
      <span>{showFullName ? pos.nameIt : pos.short || position}</span>
    </span>
  );
}
