import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCircle2, Clock, Play } from 'lucide-react'
import { AdminMatchList } from '../admin-match-list'
import { AddMatchForm } from './add-match-form'
import { MatchTable } from './match-table'
import type { MatchWithTeams } from '@/lib/types'

export default async function AdminMatchesPage() {
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

  // Get all matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      stadium:stadiums(*)
    `)
    .order('match_date', { ascending: true })

  // Get teams and stadiums for the form
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('name')

  const { data: stadiums } = await supabase
    .from('stadiums')
    .select('*')
    .order('name')

  // Group by status
  const scheduledMatches = matches?.filter(m => m.status === 'scheduled') || []
  const liveMatches = matches?.filter(m => m.status === 'live') || []
  const finishedMatches = matches?.filter(m => m.status === 'finished') || []

  // Group by stage
  const matchesByStage = matches?.reduce((acc, match) => {
    const stage = match.stage || 'group_stage'
    if (!acc[stage]) acc[stage] = []
    acc[stage].push(match)
    return acc
  }, {} as Record<string, typeof matches>) || {}

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Jogos</p>
              <p className="text-2xl font-bold">{matches?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agendados</p>
              <p className="text-2xl font-bold">{scheduledMatches.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <Play className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ao Vivo</p>
              <p className="text-2xl font-bold">{liveMatches.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Finalizados</p>
              <p className="text-2xl font-bold">{finishedMatches.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Match Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Jogo</CardTitle>
          <CardDescription>
            Cadastre um novo jogo no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddMatchForm teams={teams || []} stadiums={stadiums || []} />
        </CardContent>
      </Card>

      {/* Matches by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Jogos</CardTitle>
          <CardDescription>
            Atualize resultados e status dos jogos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scheduled" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Agendados ({scheduledMatches.length})
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Ao Vivo ({liveMatches.length})
              </TabsTrigger>
              <TabsTrigger value="finished" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Finalizados ({finishedMatches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled">
              {scheduledMatches.length > 0 ? (
                <AdminMatchList matches={scheduledMatches as MatchWithTeams[]} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum jogo agendado.
                </p>
              )}
            </TabsContent>

            <TabsContent value="live">
              {liveMatches.length > 0 ? (
                <AdminMatchList matches={liveMatches as MatchWithTeams[]} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum jogo ao vivo no momento.
                </p>
              )}
            </TabsContent>

            <TabsContent value="finished">
              {finishedMatches.length > 0 ? (
                <AdminMatchList matches={finishedMatches as MatchWithTeams[]} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum jogo finalizado ainda.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Matches by Stage */}
      <Card>
        <CardHeader>
          <CardTitle>Jogos por Fase</CardTitle>
          <CardDescription>
            Visualize os jogos organizados por fase da competicao
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatchTable matchesByStage={matchesByStage as Record<string, MatchWithTeams[]>} />
        </CardContent>
      </Card>
    </div>
  )
}
