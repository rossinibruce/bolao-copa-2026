import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MatchCard } from '@/components/match-card'
import { RankingCard } from '@/components/ranking-card'
import { Trophy, Target, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { MatchWithTeams, RankingWithProfile, Bet } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile and ranking
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: userRanking } = await supabase
    .from('rankings')
    .select('*, profile:profiles(*)')
    .eq('user_id', user?.id)
    .single()

  // Get user's position in ranking
  const { data: allRankings } = await supabase
    .from('rankings')
    .select('user_id, total_points')
    .order('total_points', { ascending: false })

  const userPosition = allRankings?.findIndex(r => r.user_id === user?.id) ?? -1

  // Get upcoming matches (next 5)
  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      stadium:stadiums(*)
    `)
    .eq('status', 'scheduled')
    .order('match_date', { ascending: true })
    .limit(5)

  // Get user's bets for upcoming matches
  const matchIds = upcomingMatches?.map(m => m.id) || []
  const { data: userBets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id)
    .in('match_id', matchIds)

  const betsMap = new Map(userBets?.map(b => [b.match_id, b]))

  // Get top 5 ranking
  const { data: topRankings } = await supabase
    .from('rankings')
    .select('*, profile:profiles(*)')
    .order('total_points', { ascending: false })
    .limit(5)

  // Get stats
  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })

  const { count: finishedMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'finished')

  const { count: userBetsCount } = await supabase
    .from('bets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Olá, <span className="text-primary">{profile?.name || 'Participante'}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao Bolão da Copa do Mundo 2026
          </p>
        </div>
        <Button asChild>
          <Link href="/jogos">
            <Calendar className="h-4 w-4 mr-2" />
            Ver Todos os Jogos
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sua Posição</p>
                <p className="text-2xl font-bold">
                  {userPosition >= 0 ? `${userPosition + 1}º` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pontos</p>
                <p className="text-2xl font-bold">{userRanking?.total_points || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <Target className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Placares Exatos</p>
                <p className="text-2xl font-bold">{userRanking?.exact_scores || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suas Apostas</p>
                <p className="text-2xl font-bold">
                  {userBetsCount || 0} / {totalMatches || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Próximos Jogos</h2>
              <p className="text-sm text-muted-foreground">Faça suas apostas antes do início</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jogos">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {upcomingMatches && upcomingMatches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingMatches.slice(0, 4).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match as MatchWithTeams}
                  bet={betsMap.get(match.id) as Bet | undefined}
                  showBetForm={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum jogo agendado no momento.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Ranking */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Top 5 Ranking</h2>
              <p className="text-sm text-muted-foreground">Líderes da competição</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ranking">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {topRankings && topRankings.length > 0 ? (
              topRankings.map((ranking, index) => (
                <RankingCard
                  key={ranking.id}
                  ranking={ranking as RankingWithProfile}
                  position={index + 1}
                  isCurrentUser={ranking.user_id === user?.id}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhum participante ainda.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
