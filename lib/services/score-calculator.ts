/**
 * ScoreCalculatorService
 * 
 * Serviço responsável por calcular a pontuação das apostas.
 * 
 * REGRAS DE PONTUAÇÃO (mutuamente exclusivas):
 * - Placar exato: 4 pontos
 * - Acerto do vencedor: 2 pontos
 * - Acerto parcial (gols de um time): 1 ponto
 * - Nenhum acerto: 0 pontos
 * 
 * IMPORTANTE: As regras NÃO se acumulam.
 * Se acertar o placar exato, ganha apenas 4 pontos (não 4+2+1).
 */

export interface BetData {
  predicted_home_score: number
  predicted_away_score: number
}

export interface MatchResult {
  home_score: number
  away_score: number
}

export type ScoreType = 'exact' | 'winner' | 'partial' | 'none'

export interface ScoreResult {
  points: number
  type: ScoreType
  description: string
}

export class ScoreCalculatorService {
  /**
   * Calcula a pontuação de uma aposta com base no resultado real da partida.
   * 
   * @param bet - Aposta do usuário com placar previsto
   * @param match - Resultado real da partida
   * @returns ScoreResult com pontos, tipo de acerto e descrição
   */
  static calculate(bet: BetData, match: MatchResult): ScoreResult {
    const { predicted_home_score, predicted_away_score } = bet
    const { home_score, away_score } = match

    // 1. Placar exato → 4 pontos
    if (predicted_home_score === home_score && predicted_away_score === away_score) {
      return {
        points: 4,
        type: 'exact',
        description: 'Placar exato'
      }
    }

    // Determinar vencedor real e previsto
    const realWinner = this.getWinner(home_score, away_score)
    const predictedWinner = this.getWinner(predicted_home_score, predicted_away_score)

    // 2. Acerto do vencedor → 2 pontos
    if (realWinner === predictedWinner) {
      return {
        points: 2,
        type: 'winner',
        description: realWinner === 'draw' ? 'Acertou o empate' : 'Acertou o vencedor'
      }
    }

    // 3. Acerto parcial de gols → 1 ponto
    if (predicted_home_score === home_score || predicted_away_score === away_score) {
      return {
        points: 1,
        type: 'partial',
        description: 'Acertou gols de um time'
      }
    }

    // 4. Nenhum acerto → 0 pontos
    return {
      points: 0,
      type: 'none',
      description: 'Nenhum acerto'
    }
  }

  /**
   * Determina o vencedor com base no placar
   */
  private static getWinner(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
    if (homeScore > awayScore) return 'home'
    if (awayScore > homeScore) return 'away'
    return 'draw'
  }

  /**
   * Calcula estatísticas do usuário com base em todas as apostas
   */
  static calculateStats(bets: { points: number }[]): {
    total_points: number
    exact_scores: number
    correct_winners: number
    partial_scores: number
    total_bets: number
  } {
    return bets.reduce(
      (acc, bet) => {
        acc.total_points += bet.points
        acc.total_bets += 1
        
        if (bet.points === 4) acc.exact_scores += 1
        else if (bet.points === 2) acc.correct_winners += 1
        else if (bet.points === 1) acc.partial_scores += 1
        
        return acc
      },
      {
        total_points: 0,
        exact_scores: 0,
        correct_winners: 0,
        partial_scores: 0,
        total_bets: 0
      }
    )
  }
}
