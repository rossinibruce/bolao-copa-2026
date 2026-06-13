'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { Badge } from '@/components/ui/badge'
import { TeamFlag } from '@/components/team-flag'

interface Props {
  match: any
}

export function BetCard({ match }: Props) {
  const bets = [...(match.bets || [])]

  if (match.status === 'finished') {
    bets.sort(
      (a, b) => (b.points || 0) - (a.points || 0)
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="border rounded-lg px-4"
    >
      <AccordionItem value={match.id}>

        <AccordionTrigger>

            <div className="flex items-center justify-between w-full pr-4">

                <div className="flex flex-col gap-2">

                    <div className="flex items-center gap-4">

                    <div className="flex items-center gap-2">
                        <TeamFlag
                            code={match.home_team.code}
                            name={match.home_team.name}
                            size="sm"
                        />

                        <span className="font-semibold">
                        {match.home_team.name}
                        </span>
                    </div>

                    {match.status !== 'scheduled' ? (
                        <span className="font-bold text-lg">
                        {match.home_score ?? 0}
                        {' x '}
                        {match.away_score ?? 0}
                        </span>
                    ) : (
                        <span className="text-muted-foreground font-medium">
                        x
                        </span>
                    )}

                    <div className="flex items-center gap-2">
                        <TeamFlag
                            code={match.away_team.code}
                            name={match.away_team.name}
                            size="sm"
                        />

                        <span className="font-semibold">
                        {match.away_team.name}
                        </span>
                    </div>

                    </div>

                    <span className="text-xs text-muted-foreground text-left">
                        {new Date(match.match_date).toLocaleString('pt-BR')}
                    </span>

                </div>

                <div>

                    {match.status === 'live' && (
                    <Badge className="bg-green-600 animate-pulse">
                        AO VIVO
                    </Badge>
                    )}

                    {match.status === 'finished' && (
                    <Badge variant="secondary">
                        FINALIZADO
                    </Badge>
                    )}

                    {match.status === 'scheduled' && (
                    <Badge variant="outline">
                        AGENDADO
                    </Badge>
                    )}

                </div>

            </div>
        </AccordionTrigger>

        <AccordionContent>

          <div className="space-y-2">

            {bets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum palpite realizado.
              </p>
            )}

            {bets.map((bet, index) => (

              <div
                key={bet.id}
                className="flex items-center justify-between border rounded-md px-4 py-2"
              >

                <div className="flex items-center gap-3">

                  {match.status === 'finished' &&
                    index === 0 &&
                    <span>🥇</span>
                  }

                  {match.status === 'finished' &&
                    index === 1 &&
                    <span>🥈</span>
                  }

                  {match.status === 'finished' &&
                    index === 2 &&
                    <span>🥉</span>
                  }

                  <span className="font-medium">
                    {bet.profile?.name ?? 'Usuário'}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                        <TeamFlag   
                        code={match.home_team.code}
                        name={match.home_team.name}
                        size="sm"
                        />

                        <span className="font-bold">
                        {bet.predicted_home_score}
                        </span>

                        <span>x</span>

                        <span className="font-bold">
                        {bet.predicted_away_score}
                        </span>

                        <TeamFlag
                        code={match.away_team.code}
                        name={match.away_team.name}
                        size="sm"
                        />

                    </div>

                </div>

                <div className="flex items-center gap-4">

                  {match.status === 'finished' && (
                    <Badge>
                      {bet.points ?? 0} pts
                    </Badge>
                  )}

                </div>

              </div>

            ))}

          </div>

        </AccordionContent>

      </AccordionItem>
    </Accordion>
  )
}