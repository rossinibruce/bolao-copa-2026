'use client'

import { MatchCard } from '@/components/match-card'
import { createClient } from '@/lib/supabase/client'
import type { MatchWithTeams, Bet } from '@/lib/types'
import { useState } from 'react'

interface MatchListProps {
  matches: MatchWithTeams[]
  betsMap: Record<string, Bet>
  userId: string
}

export function MatchList({ matches, betsMap: initialBetsMap, userId }: MatchListProps) {
  const [betsMap, setBetsMap] = useState<Record<string, Bet>>(initialBetsMap)
  const supabase = createClient()

  const handleSaveBet = async (matchId: string, homeScore: number, awayScore: number) => {
    const existingBet = betsMap[matchId]

    if (existingBet) {
      // Update existing bet
      const { data, error } = await supabase
        .from('bets')
        .update({
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        })
        .eq('id', existingBet.id)
        .select()
        .single()

      if (!error && data) {
        setBetsMap(prev => ({ ...prev, [matchId]: data }))
      }
    } else {
      // Create new bet
      const { data, error } = await supabase
        .from('bets')
        .insert({
          user_id: userId,
          match_id: matchId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        })
        .select()
        .single()

      if (!error && data) {
        setBetsMap(prev => ({ ...prev, [matchId]: data }))
      }
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          bet={betsMap[match.id]}
          onSaveBet={handleSaveBet}
          showBetForm={true}
        />
      ))}
    </div>
  )
}
