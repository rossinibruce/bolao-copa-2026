'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TeamFlag } from '@/components/team-flag'
import { Calendar, MapPin, Save, Check, RefreshCw, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { MatchWithTeams } from '@/lib/types'
import { ScoreCalculatorService } from '@/lib/services/score-calculator'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AdminMatchListProps {
  matches: MatchWithTeams[]
}

export function AdminMatchList({ matches }: AdminMatchListProps) {
  const [matchStates, setMatchStates] = useState<Record<string, {
    homeScore: string
    awayScore: string
    status: string
    isLoading: boolean
    saved: boolean
    isDeleting: boolean
  }>>(
    Object.fromEntries(matches.map(m => [m.id, {
      homeScore: m.home_score?.toString() || '',
      awayScore: m.away_score?.toString() || '',
      status: m.status,
      isLoading: false,
      saved: false,
      isDeleting: false,
    }]))
  )
  
  const supabase = createClient()
  const router = useRouter()

  const updateMatchState = (matchId: string, updates: Partial<typeof matchStates[string]>) => {
    setMatchStates(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], ...updates }
    }))
  }

  const handleSaveResult = async (matchId: string) => {
    const state = matchStates[matchId]
    if (!state || state.homeScore === '' || state.awayScore === '') return

    updateMatchState(matchId, { isLoading: true })

    const homeScore = parseInt(state.homeScore)
    const awayScore = parseInt(state.awayScore)
    const newStatus = state.status

    try {
      // Update match result
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: newStatus,
        })
        .eq('id', matchId)

      if (matchError) throw matchError

      // If match is finished, calculate points for all bets
      if (newStatus === 'finished') {
        // Get all bets for this match
        const { data: bets } = await supabase
          .from('bets')
          .select('*')
          .eq('match_id', matchId)

        // Calculate points for each bet
        if (bets) {
          const affectedUsers = new Set<string>()
        
          // 1 - Atualiza todas as apostas
          for (const bet of bets) {
            const result = ScoreCalculatorService.calculate(
              {
                predicted_home_score: bet.predicted_home_score,
                predicted_away_score: bet.predicted_away_score
              },
              {
                home_score: homeScore,
                away_score: awayScore
              }
            )
        
            const { error: betError } = await supabase
              .from('bets')
              .update({
                points: result.points
              })
              .eq('id', bet.id)
        
            if (betError) {
              console.error('Erro atualizando bet', bet.id, betError)
              continue
            }
        
            affectedUsers.add(bet.user_id)
          }
        
          // 2 - Recalcula ranking dos usuários afetados
          for (const userId of affectedUsers) {
            const { data: userBets, error: userBetsError } = await supabase
              .from('bets')
              .select(`
                points,
                matches!inner(
                  status
                )
              `)
              .eq('user_id', userId)
              .eq('matches.status', 'finished')
        
            if (userBetsError) {
              console.error('Erro buscando bets do usuário', userId, userBetsError)
              continue
            }
        
            const stats = ScoreCalculatorService.calculateStats(userBets || [])
        
            const { error: rankingError } = await supabase
              .from('rankings')
              .update({
                total_points: stats.total_points,
                exact_scores: stats.exact_scores,
                correct_winners: stats.correct_winners,
                partial_scores: stats.partial_scores,
                total_bets: stats.total_bets,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId)
        
            if (rankingError) {
              console.error('Erro ranking', userId, rankingError)
            }
          }
        }
      }

      updateMatchState(matchId, { saved: true, isLoading: false })
      setTimeout(() => updateMatchState(matchId, { saved: false }), 2000)
      
      router.refresh()
    } catch (error) {
      console.error('[v0] Error saving result:', error)
      updateMatchState(matchId, { isLoading: false })
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    updateMatchState(matchId, { isDeleting: true })

    try {
      // First, delete all bets for this match
      const { error: betsError } = await supabase
        .from('bets')
        .delete()
        .eq('match_id', matchId)

      if (betsError) throw betsError

      // Then delete the match
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (matchError) throw matchError

      router.refresh()
    } catch (error) {
      console.error('[v0] Error deleting match:', error)
      updateMatchState(matchId, { isDeleting: false })
    }
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const state = matchStates[match.id]
        const matchDate = new Date(match.match_date)

        return (
          <Card key={match.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Match Info */}
                <div className="flex items-center gap-4">
                  {/* Home Team */}
                  <div className="flex items-center gap-2">
                    <TeamFlag code={match.home_team.code} name={match.home_team.name} size="md" />
                    <span className="text-sm font-medium">{match.home_team.code}</span>
                  </div>

                  {/* Score Inputs */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={state?.homeScore || ''}
                      onChange={(e) => updateMatchState(match.id, { homeScore: e.target.value })}
                      className="w-16 h-10 text-center font-bold bg-secondary/50"
                    />
                    <span className="text-muted-foreground">x</span>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={state?.awayScore || ''}
                      onChange={(e) => updateMatchState(match.id, { awayScore: e.target.value })}
                      className="w-16 h-10 text-center font-bold bg-secondary/50"
                    />
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{match.away_team.code}</span>
                    <TeamFlag code={match.away_team.code} name={match.away_team.name} size="md" />
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <Select
                    value={state?.status || match.status}
                    onValueChange={(value) => updateMatchState(match.id, { status: value })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="finished">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => handleSaveResult(match.id)}
                    disabled={state?.isLoading || state?.homeScore === '' || state?.awayScore === ''}
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {state?.saved ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Salvo!
                      </>
                    ) : state?.isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Salvando
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={state?.isDeleting}
                      >
                        {state?.isDeleting ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Jogo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o jogo {match.home_team.name} vs {match.away_team.name}?
                          <br /><br />
                          <strong className="text-destructive">Esta acao ira excluir todas as apostas feitas para este jogo e nao pode ser desfeita.</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteMatch(match.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Match Details */}
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(matchDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.stadium?.name}
                </div>
                {match.group_name && (
                  <Badge variant="outline" className="text-xs">
                    Grupo {match.group_name}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  Jogo #{match.match_number}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
