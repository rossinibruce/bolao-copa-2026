'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BetCard } from './bet-card'

interface Props {
  matches: any[]
}

export function BetList({ matches }: Props) {

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <div className="text-5xl mb-4">
            ⚽
          </div>
      
          <h3 className="font-semibold text-lg">
            Aguardando eventos
          </h3>
      
          <p className="text-muted-foreground text-sm mt-1">
            Nenhuma partida encontrada nesta categoria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map(match => (
        <BetCard
          key={match.id}
          match={match}
        />
      ))}
    </div>
  )
}