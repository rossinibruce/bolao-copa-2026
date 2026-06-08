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
  USA: '🇺🇸',
  MEX: '🇲🇽',
  CAN: '🇨🇦',
  ECU: '🇪🇨',
  // Grupo B
  ARG: '🇦🇷',
  COL: '🇨🇴',
  CHI: '🇨🇱',
  PER: '🇵🇪',
  // Grupo C
  BRA: '🇧🇷',
  URU: '🇺🇾',
  PAR: '🇵🇾',
  VEN: '🇻🇪',
  // Grupo D
  GER: '🇩🇪',
  FRA: '🇫🇷',
  NED: '🇳🇱',
  BEL: '🇧🇪',
  // Grupo E
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ESP: '🇪🇸',
  POR: '🇵🇹',
  ITA: '🇮🇹',
  // Grupo F
  JPN: '🇯🇵',
  KOR: '🇰🇷',
  KSA: '🇸🇦',
  AUS: '🇦🇺',
  // Grupo G
  MAR: '🇲🇦',
  SEN: '🇸🇳',
  NGA: '🇳🇬',
  CMR: '🇨🇲',
  // Grupo H
  POL: '🇵🇱',
  CRO: '🇭🇷',
  SRB: '🇷🇸',
  DEN: '🇩🇰',
  // Grupo I
  SUI: '🇨🇭',
  AUT: '🇦🇹',
  UKR: '🇺🇦',
  CZE: '🇨🇿',
  // Grupo J
  IRN: '🇮🇷',
  QAT: '🇶🇦',
  UAE: '🇦🇪',
  UZB: '🇺🇿',
  // Grupo K
  CRC: '🇨🇷',
  HON: '🇭🇳',
  JAM: '🇯🇲',
  PAN: '🇵🇦',
  // Grupo L
  GHA: '🇬🇭',
  CIV: '🇨🇮',
  EGY: '🇪🇬',
  MLI: '🇲🇱',
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
