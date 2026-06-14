import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BetList } from './bet-list'

export default async function PalpitesPage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      bets(
        *,
        profile:profiles(
          id,
          name,
          avatar_url
        )
      )
    `)
    .order('match_number', { ascending: false })

  const liveMatches =
    matches?.filter(m => m.status === 'live') || []

  const finishedMatches =
    matches?.filter(m => m.status === 'finished') || []

  const scheduledMatches =
    matches?.filter(m => m.status === 'scheduled') || []

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Palpites
        </h1>

        <p className="text-muted-foreground">
          Visualize todos os palpites realizados
        </p>
      </div>

      <Tabs
        defaultValue="live"
        className="space-y-4"
      >
        <TabsList className="w-full">

          <TabsTrigger value="live">
            Ao Vivo ({liveMatches.length})
          </TabsTrigger>

          <TabsTrigger value="finished">
            Finalizados ({finishedMatches.length})
          </TabsTrigger>

        </TabsList>

        <TabsContent value="live">
          <BetList matches={liveMatches} />
        </TabsContent>

        <TabsContent value="finished">
          <BetList matches={finishedMatches} />
        </TabsContent>

        <TabsContent value="scheduled">
          <BetList matches={scheduledMatches} />
        </TabsContent>

      </Tabs>

    </div>
  )
}