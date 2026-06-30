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

  // Verifica se tem dados de prorrogação
  const hasExtraTime = match.et_home_score !== null && match.et_away_score !== null

  // Processa os penaltis
  let penaltyHome = 0
  let penaltyAway = 0
  let hasPenalties = false
  const homePenalties: any[] = []
  const awayPenalties: any[] = []

  if (match.penalty_shots && Array.isArray(match.penalty_shots) && match.penalty_shots.length > 0) {
    hasPenalties = true
    match.penalty_shots.forEach((shot: any) => {
      if (shot.result === 1) {
        if (shot.home_shot !== undefined) {
          penaltyHome++
          homePenalties.push({ ...shot, scored: true })
        } else if (shot.away_shot !== undefined) {
          penaltyAway++
          awayPenalties.push({ ...shot, scored: true })
        }
      } else {
        if (shot.home_shot !== undefined) {
          homePenalties.push({ ...shot, scored: false })
        } else if (shot.away_shot !== undefined) {
          awayPenalties.push({ ...shot, scored: false })
        }
      }
    })
  }

  // Função para renderizar as bolinhas com separação após o 5º pênalti
  const renderPenaltyBalls = (penalties: any[]) => {
    const firstFive = penalties.slice(0, 5)
    const rest = penalties.slice(5)

    return (
      <>
        {/* Primeiras 5 cobranças */}
        <div className="flex gap-1">
          {firstFive.map((shot, index) => (
            <div
              key={`first-${index}`}
              className={`w-3 h-3 rounded-full ${
                shot.scored ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={`Cobrança ${index + 1}: ${shot.scored ? '✅ Gol' : '❌ Perdeu'}`}
            />
          ))}
        </div>

        {/* Cobranças a partir da 6ª (morte súbita) */}
        {rest.length > 0 && (
          <>
            <div className="w-2 h-0.5 bg-muted-foreground/30" />
            <div className="flex gap-1.5">
              {rest.map((shot, index) => (
                <div
                  key={`rest-${index}`}
                  className={`w-3 h-3 rounded-full ${
                    shot.scored ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  title={`Cobrança ${index + 6}: ${shot.scored ? '✅ Gol' : '❌ Perdeu'}`}
                />
              ))}
            </div>
          </>
        )}
      </>
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
            <div className="w-full">

                <div className="flex items-center justify-center gap-8">

                    <div className="flex flex-col items-center">
                    <TeamFlag
                        code={match.home_team.code}
                        name={match.home_team.name}
                        size="md"
                    />

                    <span className="text-xs text-muted-foreground mt-1">
                        {match.home_team.name}
                    </span>
                    </div>

                    <div className="flex flex-col items-center min-w-[80px]">

                    {match.status === 'scheduled' ? (
                        <span className="text-xl font-bold">
                        x
                        </span>
                    ) : (
                        <>
                          {/* Placar principal */}
                          <span className="text-xl font-bold">
                            {match.home_score ?? 0}
                            {' x '}
                            {match.away_score ?? 0}
                          </span>

                          {/* Placar de prorrogação e/ou penaltis */}
                          {(hasExtraTime || hasPenalties) && (
                            <div className="flex flex-col items-center mt-1 text-xs text-muted-foreground">
                              {hasExtraTime && (
                                <span>
                                  Prorrogação: {match.et_home_score} x {match.et_away_score}
                                </span>
                              )}
                              {hasPenalties && (
                                <span className={hasExtraTime ? 'mt-0.5' : ''}>
                                  Penaltis: {penaltyHome} x {penaltyAway}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                    )}

                    </div>

                    <div className="flex flex-col items-center">
                    <TeamFlag
                        code={match.away_team.code}
                        name={match.away_team.name}
                        size="md"
                    />

                    <span className="text-xs text-muted-foreground mt-1">
                        {match.away_team.name}
                    </span>
                    </div>

                </div>

                <div className="flex justify-center mt-4">

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

                {/* Bolinhas de penaltis */}
                {hasPenalties && (
                  <div className="flex items-center justify-center gap-6 mt-3">
                    {/* Penaltis do time da casa */}
                    <div className="flex items-center gap-1.5">
                      {renderPenaltyBalls(homePenalties)}
                    </div>

                    <span className="text-xs text-muted-foreground">|</span>

                    {/* Penaltis do time visitante */}
                    <div className="flex items-center gap-1.5">
                      {renderPenaltyBalls(awayPenalties)}
                    </div>
                  </div>
                )}

            </div>
        </AccordionTrigger>

        <AccordionContent>

          <div className="space-y-2">

            {bets.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum palpite realizado.
              </p>
            )}

            {bets.map((bet, index) => (

              <div
                key={bet.id}
                className="flex items-center justify-between border rounded-md px-4 py-2"
              >

                {/* Lado esquerdo: Nome + Medalha */}
                <div className="flex items-center gap-3 min-w-[120px]">

                  {match.status === 'finished' && index === 0 && (
                    <span className="text-lg">🥇</span>
                  )}

                  {match.status === 'finished' && index === 1 && (
                    <span className="text-lg">🥈</span>
                  )}

                  {match.status === 'finished' && index === 2 && (
                    <span className="text-lg">🥉</span>
                  )}

                  <span className="font-medium truncate">
                    {bet.profile?.name ?? 'Usuário'}
                  </span>

                </div>

                {/* Centro: Palpite com bandeiras */}
                <div className="flex items-center gap-3 flex-1 justify-center">

                  <TeamFlag
                    code={match.home_team.code}
                    name={match.home_team.name}
                    size="sm"
                  />

                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-6 text-center">
                      {bet.predicted_home_score}
                    </span>
                    <span className="text-muted-foreground">x</span>
                    <span className="w-6 text-center">
                      {bet.predicted_away_score}
                    </span>
                  </div>

                  <TeamFlag
                    code={match.away_team.code}
                    name={match.away_team.name}
                    size="sm"
                  />

                </div>

                {/* Lado direito: Pontos */}
                <div className="min-w-[80px] text-right">

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