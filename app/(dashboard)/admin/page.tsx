import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Trophy, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  // Get current user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Get stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalTeams } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })

  const { count: totalStadiums } = await supabase
    .from('stadiums')
    .select('*', { count: 'exact', head: true })

  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })

  const { count: scheduledMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')

  const { count: finishedMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'finished')

  const { count: totalBets } = await supabase
    .from('bets')
    .select('*', { count: 'exact', head: true })

  const { data: pointsSum } = await supabase
    .from('rankings')
    .select('total_points')

  const totalPoints = pointsSum?.reduce((sum, r) => sum + r.total_points, 0) || 0

  // Recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Upcoming matches
  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(name, code),
      away_team:teams!matches_away_team_id_fkey(name, code)
    `)
    .eq('status', 'scheduled')
    .order('match_date', { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuários</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jogos</p>
              <p className="text-2xl font-bold">{totalMatches}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Apostas</p>
              <p className="text-2xl font-bold">{totalBets}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pontos Totais</p>
              <p className="text-2xl font-bold">{totalPoints}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Jogos Agendados</p>
              <p className="text-xl font-bold">{scheduledMatches}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Jogos Finalizados</p>
              <p className="text-xl font-bold">{finishedMatches}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pendente Resultado</p>
              <p className="text-xl font-bold">{(scheduledMatches || 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Recentes
            </CardTitle>
            <CardDescription>
              Últimos 5 usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {user.is_admin && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Admin
                    </span>
                  )}
                </div>
              ))}
              {(!recentUsers || recentUsers.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum usuário cadastrado ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Jogos
            </CardTitle>
            <CardDescription>
              Jogos que precisam de resultado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMatches?.map((match) => (
                <div key={match.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{match.home_team?.code}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium">{match.away_team?.code}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(match.match_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(match.match_date).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {(!upcomingMatches || upcomingMatches.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  Todos os jogos foram finalizados!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">{totalTeams}</p>
              <p className="text-sm text-muted-foreground">Seleções Cadastradas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-green-500">{totalStadiums}</p>
              <p className="text-sm text-muted-foreground">Estádios Cadastrados</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-blue-500">12</p>
              <p className="text-sm text-muted-foreground">Grupos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-yellow-500">
                {totalBets && totalUsers ? Math.round((totalBets / (totalUsers * (totalMatches || 1))) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Participação</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
