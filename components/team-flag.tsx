import { cn } from '@/lib/utils'

interface TeamFlagProps {
  code: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Mapeamento de códigos de países para emoji de bandeira
const countryEmojis: Record<string, string> = {
  // Grupo A
  MEX: '🇲🇽',
  AFS: '🇿🇦',
  KOR: '🇰🇷',
  CZE: '🇨🇿',

  // Grupo B
  BEH: '🇧🇦',
  CAN: '🇨🇦',
  QAT: '🇶🇦',
  SUI: '🇨🇭',

  // Grupo C
  BRA: '🇧🇷',
  ESC: '🇬🇧',
  HAI: '🇭🇹',
  MAR: '🇲🇷',

  // Grupo D
  AUS: '🇦🇺',
  USA: '🇺🇸',
  PAR: '🇵🇾',
  TUR: '🇹🇷',

  // Grupo E
  GER: '🇩🇪',
  CIV: '🇨🇮',
  CUR: '🇨🇼',
  ECU: '🇪🇨',

  // Grupo F
  NED: '🇳🇱',
  JPN: '🇯🇵',
  SUE: '🇸🇪',
  TUN: '🇹🇳',

  // Grupo G
  BEL: '🇧🇪',
  EGI: '🇪🇬',
  IRN: '🇮🇷',
  NZL: '🇳🇿',

  // Grupo H
  KSA: '🇸🇦',
  CBV: '🇨🇻',
  ESP: '🇪🇸',
  URU: '🇺🇾',

  // Grupo I
  FRA: '🇫🇷',
  IRQ: '🇮🇶',
  NOR: '🇳🇴',
  SEN: '🇸🇳',

  // Grupo J
  AGL: '🇦🇬',
  ARG: '🇦🇷',
  AUT: '🇦🇹',
  JOR: '🇯🇴',

  // Grupo K
  COL: '🇨🇴',
  POR: '🇵🇹',
  RDC: '🇨🇩',
  UZB: '🇺🇿',

  // Grupo L
  CRO: '🇭🇷',
  GHA: '🇬🇭',
  ING: '🇬🇧',
  PAN: '🇵🇦',
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
}

export function TeamFlag({ code, name, size = 'md', className }: TeamFlagProps) {
  const emoji = countryEmojis[code] || '🏳️'

  return (
    <span 
      className={cn(sizeClasses[size], className)} 
      role="img" 
      aria-label={`Bandeira ${name}`}
      title={name}
    >
      {emoji}
    </span>
  )
}
