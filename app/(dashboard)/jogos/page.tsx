import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MatchList } from './match-list'
import type { MatchWithTeams, Bet } from '@/lib/types'

export default async function JogosPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get all matches with teams and stadium
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      stadium:stadiums(*)
    `)
    .order('match_date', { ascending: true })

  // Get user's bets
  const { data: userBets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id)

  const betsMap = new Map(userBets?.map(b => [b.match_id, b]))

  // Group matches by status
  const scheduledMatches = matches?.filter(m => m.status === 'scheduled') || []
  const liveMatches = matches?.filter(m => m.status === 'live') || []
  const finishedMatches = matches?.filter(m => m.status === 'finished') || []

  // Group matches by group
  const groupedMatches = matches?.reduce((acc, match) => {
    if (match.stage === 'group_stage' && match.group_name) {
      const group = match.group_name
      if (!acc[group]) acc[group] = []
      acc[group].push(match)
    }
    return acc
  }, {} as Record<string, typeof matches>) || {}

  // Count bets for each match status
  const scheduledBetsCount = scheduledMatches.filter(m => betsMap.has(m.id)).length
  const finishedBetsCount = finishedMatches.filter(m => betsMap.has(m.id)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Jogos da Copa 2026</h1>
        <p className="text-muted-foreground mt-1">
          Faça suas apostas nos jogos da Copa do Mundo FIFA 2026
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Agendados</p>
              <p className="text-2xl font-bold">{scheduledMatches.length}</p>
            </div>
            <Badge variant="secondary">
              {scheduledBetsCount} apostas
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ao Vivo</p>
              <p className="text-2xl font-bold">{liveMatches.length}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              {liveMatches.length > 0 ? 'Em andamento' : '-'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Finalizados</p>
              <p className="text-2xl font-bold">{finishedMatches.length}</p>
            </div>
            <Badge variant="outline">
              {finishedBetsCount} apostas
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Matches Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="upcoming">
            Próximos ({scheduledMatches.length})
          </TabsTrigger>
          <TabsTrigger value="live" disabled={liveMatches.length === 0}>
            Ao Vivo ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Finalizados ({finishedMatches.length})
          </TabsTrigger>
          <TabsTrigger value="groups">
            Por Grupo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <MatchList 
            matches={scheduledMatches as MatchWithTeams[]} 
            betsMap={Object.fromEntries(betsMap)}
            userId={user?.id || ''}
          />
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {liveMatches.length > 0 ? (
            <MatchList 
              matches={liveMatches as MatchWithTeams[]} 
              betsMap={Object.fromEntries(betsMap)}
              userId={user?.id || ''}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum jogo ao vivo no momento.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="finished" className="space-y-4">
          {finishedMatches.length > 0 ? (
            <MatchList 
              matches={finishedMatches as MatchWithTeams[]} 
              betsMap={Object.fromEntries(betsMap)}
              userId={user?.id || ''}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum jogo finalizado ainda.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {Object.keys(groupedMatches).sort().map((group) => (
            <div key={group} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  Grupo {group}
                </Badge>
              </h2>
              <MatchList 
                matches={groupedMatches[group] as MatchWithTeams[]} 
                betsMap={Object.fromEntries(betsMap)}
                userId={user?.id || ''}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
