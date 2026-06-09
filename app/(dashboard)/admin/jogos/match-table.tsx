'use client'

import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, RefreshCw } from 'lucide-react'
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
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { MatchWithTeams } from '@/lib/types'

const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Fase de Grupos',
  round_of_32: 'Dezesseis-avos de final',
  round_of_16: 'Oitavas de Final',
  quarter_finals: 'Quartas de Final',
  semi_finals: 'Semifinais',
  third_place: 'Disputa 3º Lugar',
  final: 'Final',
}

interface MatchTableProps {
  matchesByStage: Record<string, MatchWithTeams[]>
}

export function MatchTable({ matchesByStage }: MatchTableProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const router = useRouter()

  const handleDeleteMatch = async (matchId: string) => {
    setDeletingIds(prev => new Set(prev).add(matchId))

    try {
      // First, delete all bets for this match
      await supabase
        .from('bets')
        .delete()
        .eq('match_id', matchId)

      // Then delete the match
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('[v0] Error deleting match:', error)
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(matchId)
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(matchesByStage).map(([stage, stageMatches]) => (
        <div key={stage}>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-base font-semibold px-3 py-1">
              {STAGE_LABELS[stage] || stage}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {stageMatches?.length} jogos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-muted-foreground">#</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Jogo</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Estadio</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Placar</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {stageMatches?.map((match) => (
                  <tr key={match.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-2 text-muted-foreground">{match.match_number || '-'}</td>
                    <td className="p-2 font-medium">
                      {match.home_team?.code} vs {match.away_team?.code}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(match.match_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-2 text-muted-foreground">{match.stadium?.name}</td>
                    <td className="p-2 text-center font-bold">
                      {match.status === 'finished' 
                        ? `${match.home_score} - ${match.away_score}`
                        : '-'
                      }
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={
                        match.status === 'finished' ? 'default' :
                        match.status === 'live' ? 'destructive' : 'secondary'
                      }>
                        {match.status === 'scheduled' ? 'Agendado' :
                         match.status === 'live' ? 'Ao Vivo' : 'Finalizado'}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={deletingIds.has(match.id)}
                          >
                            {deletingIds.has(match.id) ? (
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
                              Tem certeza que deseja excluir o jogo <strong>{match.home_team?.name} vs {match.away_team?.name}</strong>?
                              <br /><br />
                              <span className="text-destructive font-medium">
                                Esta acao ira excluir todas as apostas feitas para este jogo e nao pode ser desfeita.
                              </span>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
