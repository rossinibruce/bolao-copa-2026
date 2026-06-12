import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RankingCard } from '@/components/ranking-card'
import { Trophy, Users, Target, TrendingUp } from 'lucide-react'
import type { RankingWithProfile } from '@/lib/types'

export default async function RankingPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get all rankings with profiles
  const { data: rankings } = await supabase
    .from('rankings')
    .select('*, profile:profiles(*)')
    .order('total_points', { ascending: false })

// Calculate stats
const totalParticipants = rankings?.length || 0

// Dados do usuário logado
const currentUserRanking = rankings?.find(
  r => r.user_id === user?.id
)

const userPoints = currentUserRanking?.total_points || 0
const userExactScores = currentUserRanking?.exact_scores || 0
const userTotalBets = currentUserRanking?.total_bets || 0

// Get user's position
const userPosition = rankings?.findIndex(
  r => r.user_id === user?.id
) ?? -1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Ranking Geral
        </h1>
        <p className="text-muted-foreground mt-1">
          Classificação dos participantes do Bolão Copa 2026
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Trophy className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sua Posição</p>
              <p className="text-2xl font-bold">
                {userPosition >= 0 ? `${userPosition + 1}º` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participantes</p>
              <p className="text-2xl font-bold">{totalParticipants}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Podium - Top 3 */}
      {rankings && rankings.length >= 3 && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Second Place */}
          <div className="order-1 md:order-1 md:mt-8">
            <div className="text-center mb-2">
              <Badge className="bg-[oklch(0.75_0.02_260/0.2)] text-[oklch(0.75_0.02_260)] border-[oklch(0.75_0.02_260/0.3)]">
                2º Lugar
              </Badge>
            </div>
            <RankingCard
              ranking={rankings[1] as RankingWithProfile}
              position={2}
              isCurrentUser={rankings[1].user_id === user?.id}
            />
          </div>

          {/* First Place */}
          <div className="order-0 md:order-2">
            <div className="text-center mb-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse-gold">
                1º Lugar - Líder
              </Badge>
            </div>
            <RankingCard
              ranking={rankings[0] as RankingWithProfile}
              position={1}
              isCurrentUser={rankings[0].user_id === user?.id}
            />
          </div>

          {/* Third Place */}
          <div className="order-2 md:order-3 md:mt-12">
            <div className="text-center mb-2">
              <Badge className="bg-[oklch(0.65_0.12_55/0.2)] text-[oklch(0.65_0.12_55)] border-[oklch(0.65_0.12_55/0.3)]">
                3º Lugar
              </Badge>
            </div>
            <RankingCard
              ranking={rankings[2] as RankingWithProfile}
              position={3}
              isCurrentUser={rankings[2].user_id === user?.id}
            />
          </div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Classificação Completa</h2>
        
        {rankings && rankings.length > 0 ? (
          <div className="space-y-3">
            {rankings.map((ranking, index) => (
              <RankingCard
                key={ranking.id}
                ranking={ranking as RankingWithProfile}
                position={index + 1}
                isCurrentUser={ranking.user_id === user?.id}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum participante cadastrado ainda.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
