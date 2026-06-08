import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Trophy, Target, Check, X, Minus } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import type { BetWithMatch } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if current user is admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser?.id)
    .single()

  if (!currentProfile?.is_admin) {
    redirect('/dashboard')
  }

  // Get target user profile
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!userProfile) {
    notFound()
  }

  // Get user ranking
  const { data: ranking } = await supabase
    .from('rankings')
    .select('*')
    .eq('user_id', id)
    .single()

  // Get user bets with matches
  const { data: bets } = await supabase
    .from('bets')
    .select(`
      *,
      match:matches(
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        stadium:stadiums(*)
      )
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const finishedBets = bets?.filter(b => b.match?.status === 'finished') || []
  const pendingBets = bets?.filter(b => b.match?.status !== 'finished') || []

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/usuarios">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Usuários
        </Button>
      </Link>

      {/* User Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {userProfile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {userProfile.name}
                {userProfile.is_admin && (
                  <Badge className="bg-primary/10 text-primary">Admin</Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Cadastrado em {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold text-primary">{ranking?.total_points || 0}</p>
            <p className="text-sm text-muted-foreground">Pontos Totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold">#{ranking?.position || '-'}</p>
            <p className="text-sm text-muted-foreground">Posição no Ranking</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold text-green-500">{ranking?.exact_scores || 0}</p>
            <p className="text-sm text-muted-foreground">Placares Exatos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold">{bets?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total de Apostas</p>
          </CardContent>
        </Card>
      </div>

      {/* Bets History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Apostas</CardTitle>
          <CardDescription>
            Todas as {bets?.length || 0} apostas do usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {finishedBets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Apostas Finalizadas ({finishedBets.length})
              </h3>
              <div className="space-y-3">
                {finishedBets.map((bet) => {
                  const typedBet = bet as unknown as BetWithMatch
                  const match = typedBet.match
                  const isExact = 
                    bet.predicted_home_score === match?.home_score && 
                    bet.predicted_away_score === match?.away_score
                  const isCorrectWinner = 
                    (match?.home_score !== null && match?.away_score !== null) &&
                    ((bet.predicted_home_score > bet.predicted_away_score && match.home_score > match.away_score) ||
                     (bet.predicted_home_score < bet.predicted_away_score && match.home_score < match.away_score) ||
                     (bet.predicted_home_score === bet.predicted_away_score && match.home_score === match.away_score))
                  
                  return (
                    <div 
                      key={bet.id} 
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TeamFlag code={match?.home_team?.code || ''} size="sm" />
                          <span className="font-medium">{match?.home_team?.code}</span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Aposta</div>
                          <div className="font-bold">
                            {bet.predicted_home_score} - {bet.predicted_away_score}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{match?.away_team?.code}</span>
                          <TeamFlag code={match?.away_team?.code || ''} size="sm" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Resultado</div>
                          <div className="font-bold text-primary">
                            {match?.home_score} - {match?.away_score}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isExact ? (
                            <Badge className="bg-green-500/10 text-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              +4 pts
                            </Badge>
                          ) : isCorrectWinner ? (
                            <Badge className="bg-yellow-500/10 text-yellow-500">
                              <Target className="h-3 w-3 mr-1" />
                              +2 pts
                            </Badge>
                          ) : bet.points === 1 ? (
                            <Badge className="bg-blue-500/10 text-blue-500">
                              <Minus className="h-3 w-3 mr-1" />
                              +1 pt
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="h-3 w-3 mr-1" />
                              0 pts
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {pendingBets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Apostas Pendentes ({pendingBets.length})
              </h3>
              <div className="space-y-3">
                {pendingBets.map((bet) => {
                  const typedBet = bet as unknown as BetWithMatch
                  const match = typedBet.match
                  
                  return (
                    <div 
                      key={bet.id} 
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TeamFlag code={match?.home_team?.code || ''} size="sm" />
                          <span className="font-medium">{match?.home_team?.code}</span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Aposta</div>
                          <div className="font-bold">
                            {bet.predicted_home_score} - {bet.predicted_away_score}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{match?.away_team?.code}</span>
                          <TeamFlag code={match?.away_team?.code || ''} size="sm" />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(match?.match_date || '').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match?.match_date || '').toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(!bets || bets.length === 0) && (
            <p className="text-center text-muted-foreground py-8">
              Este usuário ainda não fez nenhuma aposta.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
