'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TeamFlag } from '@/components/team-flag'
import { Calendar, MapPin, Lock, Check, X } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { MatchWithTeams, Bet } from '@/lib/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  match: MatchWithTeams
  bet?: Bet | null
  onSaveBet?: (matchId: string, homeScore: number, awayScore: number) => Promise<void>
  showBetForm?: boolean
}

const stageLabels: Record<string, string> = {
  group_stage: 'Fase de Grupos',
  round_of_32: 'Rodada de 32',
  round_of_16: 'Oitavas de Final',
  quarter_finals: 'Quartas de Final',
  semi_finals: 'Semifinais',
  third_place: 'Disputa 3º Lugar',
  final: 'Final',
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-secondary text-secondary-foreground',
  live: 'bg-green-500/20 text-green-400 animate-pulse',
  finished: 'bg-muted text-muted-foreground',
}

export function MatchCard({ match, bet, onSaveBet, showBetForm = true }: MatchCardProps) {
  const [homeScore, setHomeScore] = useState(bet?.predicted_home_score?.toString() || '')
  const [awayScore, setAwayScore] = useState(bet?.predicted_away_score?.toString() || '')
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const matchDate = new Date(match.match_date)
  const isLocked = isPast(matchDate) || match.status !== 'scheduled'
  const hasBet = bet !== null && bet !== undefined

  const handleSave = async () => {
    if (!onSaveBet || homeScore === '' || awayScore === '') return
    
    setIsLoading(true)
    try {
      await onSaveBet(match.id, parseInt(homeScore), parseInt(awayScore))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const getPointsBadge = () => {
    if (!bet || match.status !== 'finished') return null
    
    const points = bet.points
    const colors = {
      4: 'bg-primary/20 text-primary border-primary/30',
      2: 'bg-accent/20 text-accent border-accent/30',
      1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      0: 'bg-muted text-muted-foreground border-muted',
    }
    const labels = {
      4: 'Placar Exato',
      2: 'Acertou Vencedor',
      1: 'Acerto Parcial',
      0: 'Errou',
    }
    
    return (
      <Badge className={cn('text-xs', colors[points as keyof typeof colors] || colors[0])}>
        {points} pts - {labels[points as keyof typeof labels] || labels[0]}
      </Badge>
    )
  }

  return (
    <Card className={cn(
      'overflow-hidden transition-all hover:shadow-lg',
      match.status === 'live' && 'ring-2 ring-green-500/50',
      isLocked && 'opacity-80'
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {stageLabels[match.stage]}
            </Badge>
            {match.group_name && (
              <Badge variant="secondary" className="text-xs">
                Grupo {match.group_name}
              </Badge>
            )}
          </div>
          <Badge className={cn('text-xs', statusColors[match.status])}>
            {match.status === 'scheduled' && 'Agendado'}
            {match.status === 'live' && 'Ao Vivo'}
            {match.status === 'finished' && 'Finalizado'}
          </Badge>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <TeamFlag code={match.home_team.code} name={match.home_team.name} size="lg" />
            <p className="mt-2 text-sm font-medium truncate">{match.home_team.name}</p>
          </div>

          {/* Score / Bet Input */}
          <div className="flex flex-col items-center gap-2">
            {match.status === 'finished' ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{match.home_score}</span>
                <span className="text-xl text-muted-foreground">x</span>
                <span className="text-3xl font-bold">{match.away_score}</span>
              </div>
            ) : showBetForm ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  disabled={isLocked}
                  className="w-14 h-12 text-center text-xl font-bold bg-secondary/50"
                />
                <span className="text-xl text-muted-foreground">x</span>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  disabled={isLocked}
                  className="w-14 h-12 text-center text-xl font-bold bg-secondary/50"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl text-muted-foreground">vs</span>
              </div>
            )}

            {/* Points Badge */}
            {getPointsBadge()}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <TeamFlag code={match.away_team.code} name={match.away_team.name} size="lg" />
            <p className="mt-2 text-sm font-medium truncate">{match.away_team.name}</p>
          </div>
        </div>

        {/* Bet Info */}
        {showBetForm && hasBet && match.status === 'finished' && (
          <div className="mt-3 pt-3 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Sua aposta: <span className="font-medium text-foreground">{bet.predicted_home_score} x {bet.predicted_away_score}</span>
            </p>
          </div>
        )}

        {/* Save Button */}
        {showBetForm && !isLocked && onSaveBet && (
          <div className="mt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading || homeScore === '' || awayScore === ''}
              className="w-full"
              size="sm"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvo!
                </>
              ) : isLoading ? (
                'Salvando...'
              ) : hasBet ? (
                'Atualizar Aposta'
              ) : (
                'Salvar Aposta'
              )}
            </Button>
          </div>
        )}

        {/* Locked Message */}
        {isLocked && showBetForm && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Apostas encerradas</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(matchDate, "dd 'de' MMM, HH:mm", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-1 truncate max-w-[50%]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{match.stadium?.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
